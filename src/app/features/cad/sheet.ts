// Hologrid on paper: each part is sliced by a millimetre grid in its own print frame and drawn
// as ink lines, with hard edges traced on top. Hidden lines are removed by depth-only occluders,
// and the canvas is transparent, so the graph paper behind it is plain CSS.
// Loaded with import() from the CAD page, so three.js stays out of every other page's bundle.
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  Assembly,
  explodeOffset,
  IDENTITY,
  Kind,
  kindOf,
  MODELS_URL,
  parseStl,
  Part,
} from './model';

/** CSS colours for each kind of part, read from the theme tokens. */
export type Inks = Record<Kind | 'hot', string>;

export interface Loaded {
  parts: { part: Part; kind: Kind; qty: number }[];
  tris: number;
  /** Bounding box of the fitted (non-ghost) parts, in mm. */
  size: [number, number, number];
}

const VS = `varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
void main() {
  vPos = position; vNormal = normalMatrix * normal;
  vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;
const FS = `uniform vec3 uColor; uniform float uSpacing; uniform float uWidth; uniform float uFade; uniform float uAlpha;
varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
void main() {
  vec3 p = vPos / uSpacing; vec3 d = max(fwidth(p), vec3(1e-5));
  vec3 f = abs(fract(p - 0.5) - 0.5) / d;
  vec3 l = (1.0 - smoothstep(0.0, uWidth, f)) * smoothstep(0.0, 0.02, d);
  float g = max(max(l.x, l.y), l.z);
  float facing = abs(dot(normalize(vNormal), normalize(vView)));
  g *= mix(1.0, pow(facing, 0.75), uFade) * uAlpha;
  if (g < 0.01) discard;
  gl_FragColor = vec4(uColor, g);
}`;

const GRID_MM = 10;
const EDGE_ANGLE = 30;
const GHOST_ALPHA = 0.55;
const CAM_Z = 4.3;
const VIEW = { x: 0.32, y: -0.55 };

interface Instance {
  group: Group;
  surf: Mesh;
  occ: Mesh;
  centroid: [number, number, number];
}
interface Rec {
  part: Part;
  kind: Kind;
  colour: Color;
  surf: ShaderMaterial;
  line: LineBasicMaterial;
  edges: EdgesGeometry;
  instances: Instance[];
  visible: boolean;
}

export class CadSheet {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(42, 1, 0.05, 200);
  private readonly rig = new Group();
  private readonly holder = new Group();
  private readonly occluder = new MeshBasicMaterial({
    colorWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2,
  });
  private readonly geometries = new Map<string, Promise<BufferGeometry>>();
  private readonly colours: Record<Kind | 'hot', Color>;
  private readonly ray = new Raycaster();
  private readonly resizer: ResizeObserver;
  private recs: Rec[] = [];
  private center: [number, number, number] = [0, 0, 0];
  private reach = 1;
  private explodeBy = 0;
  private ghosts = true;
  private alts = false;
  private xray = false;
  private hot: number | null = null;
  private frame = 0;
  private loadId = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    inks: Inks,
  ) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.colours = Object.fromEntries(
      Object.entries(inks).map(([k, css]) => [k, new Color(css)]),
    ) as Record<Kind | 'hot', Color>;
    this.rig.add(this.holder);
    this.scene.add(this.rig);
    this.resetView();
    this.resizer = new ResizeObserver(() => this.resize());
    this.resizer.observe(canvas);
    this.resize();
  }

  /** Replaces the drawing. Resolves with the part list, or null if another load overtook it. */
  async load(a: Assembly): Promise<Loaded | null> {
    const id = ++this.loadId;
    const geos = await Promise.all(a.parts.map((p) => this.geometry(p.file)));
    if (id !== this.loadId) return null;
    this.clear();
    const bb = new Box3();
    const all = new Box3();
    let tris = 0;
    this.recs = a.parts.map((part, i) => {
      const geo = geos[i];
      const kind = kindOf(part);
      const colour = this.colours[kind].clone();
      const ghost = kind === 'bought';
      const surf = new ShaderMaterial({
        uniforms: {
          uColor: { value: colour.clone() },
          uSpacing: { value: GRID_MM },
          uWidth: { value: 1.1 },
          uFade: { value: 0.55 },
          uAlpha: { value: ghost ? GHOST_ALPHA : 0.95 },
        },
        vertexShader: VS,
        fragmentShader: FS,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const line = new LineBasicMaterial({
        color: colour.clone(),
        transparent: true,
        opacity: ghost ? GHOST_ALPHA : 0.9,
        depthWrite: false,
      });
      const edges = new EdgesGeometry(geo, EDGE_ANGLE);
      const rec: Rec = { part, kind, colour, surf, line, edges, instances: [], visible: !part.alt };
      for (const inst of part.instances?.length ? part.instances : [{ matrix: IDENTITY }]) {
        const m = new Matrix4().set(...(inst.matrix as Parameters<Matrix4['set']>));
        const inner = new Group();
        inner.matrixAutoUpdate = false;
        inner.matrix.copy(m);
        const occ = new Mesh(geo, this.occluder);
        occ.renderOrder = 0;
        const s = new Mesh(geo, surf);
        s.renderOrder = 2;
        s.userData['rec'] = i;
        const ed = new LineSegments(edges, line);
        ed.renderOrder = 3;
        inner.add(occ, s, ed);
        const group = new Group();
        group.add(inner);
        this.holder.add(group);
        const box = geo.boundingBox!.clone().applyMatrix4(m);
        all.union(box);
        if (!ghost) bb.union(box);
        const c = box.getCenter(new Vector3());
        rec.instances.push({ group, surf: s, occ, centroid: [c.x, c.y, c.z] });
        tris += part.tris ?? geo.getAttribute('position').count / 3;
      }
      return rec;
    });
    if (bb.isEmpty()) bb.copy(all); // only context parts: frame those instead
    const size = bb.getSize(new Vector3());
    const center = bb.getCenter(new Vector3());
    this.center = [center.x, center.y, center.z];
    this.reach = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.4 / this.reach;
    this.holder.scale.setScalar(scale);
    this.holder.rotation.set((a.up ?? 'z') === 'z' ? -Math.PI / 2 : 0, 0, 0);
    this.holder.position.copy(center.applyEuler(this.holder.rotation).multiplyScalar(-scale));
    this.hot = null;
    this.apply();
    return {
      parts: this.recs.map((r) => ({ part: r.part, kind: r.kind, qty: r.instances.length })),
      tris,
      size: [size.x, size.y, size.z],
    };
  }

  setExplode(amount: number): void {
    this.explodeBy = amount;
    this.apply();
  }
  setGhosts(on: boolean): void {
    this.ghosts = on;
    this.apply();
  }
  setAlternatives(on: boolean): void {
    this.alts = on;
    this.apply();
  }
  setXray(on: boolean): void {
    this.xray = on;
    for (const r of this.recs) {
      r.surf.depthTest = r.line.depthTest = !on;
    }
    this.apply();
  }
  setVisible(index: number, on: boolean): void {
    const r = this.recs[index];
    if (r) r.visible = on;
    this.apply();
  }
  /** Draws one part in red pen. */
  setHot(index: number | null): void {
    this.hot = index;
    this.recs.forEach((r, i) => {
      const c = i === index ? this.colours.hot : r.colour;
      (r.surf.uniforms['uColor'].value as Color).copy(c);
      r.line.color.copy(c);
    });
    this.request();
  }

  /** The fitted part under a canvas-relative point, if any. */
  pick(x: number, y: number): number | null {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.ray.setFromCamera(new Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1), this.camera);
    const targets = this.recs
      .filter((r) => r.kind !== 'bought')
      .flatMap((r) => r.instances.filter((i) => i.group.visible).map((i) => i.surf));
    const hit = this.ray.intersectObjects(targets, false)[0];
    return hit ? (hit.object.userData['rec'] as number) : null;
  }

  rotate(dx: number, dy: number): void {
    this.rig.rotation.y += dx;
    this.rig.rotation.x = Math.max(-1.2, Math.min(1.2, this.rig.rotation.x + dy));
    this.request();
  }
  /** factor < 1 moves closer. */
  zoom(factor: number): void {
    this.camera.position.z = Math.max(1.6, Math.min(12, this.camera.position.z * factor));
    this.request();
  }
  resetView(): void {
    this.rig.rotation.set(VIEW.x, VIEW.y, 0);
    this.camera.position.set(0, 0, CAM_Z);
    this.camera.lookAt(0, 0, 0);
    this.request();
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.resizer.disconnect();
    this.clear();
    for (const g of this.geometries.values())
      void g.then(
        (geo) => geo.dispose(),
        () => {},
      );
    this.occluder.dispose();
    this.renderer.dispose();
  }

  private geometry(file: string): Promise<BufferGeometry> {
    let g = this.geometries.get(file);
    if (!g) {
      g = fetch(MODELS_URL + file)
        .then((r) => {
          if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
          return r.arrayBuffer();
        })
        .then((buf) => {
          const geo = new BufferGeometry();
          geo.setAttribute('position', new BufferAttribute(parseStl(buf), 3));
          geo.computeVertexNormals();
          geo.computeBoundingBox();
          return geo;
        });
      g.catch(() => this.geometries.delete(file));
      this.geometries.set(file, g);
    }
    return g;
  }

  private clear(): void {
    this.holder.clear();
    for (const r of this.recs) {
      r.surf.dispose();
      r.line.dispose();
      r.edges.dispose();
    }
    this.recs = [];
  }

  private apply(): void {
    for (const r of this.recs) {
      const ghost = r.kind === 'bought';
      const shown = r.visible && (!ghost || this.ghosts) && (!r.part.alt || this.alts);
      for (const i of r.instances) {
        i.group.visible = shown;
        i.occ.visible = !this.xray && !ghost;
        const [x, y, z] = ghost
          ? [0, 0, 0]
          : explodeOffset(i.centroid, this.center, this.reach, this.explodeBy);
        i.group.position.set(x, y, z);
      }
    }
    this.request();
  }

  private resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.request();
  }

  /** Draws on the next frame. Nothing moves on its own, so there is no render loop. */
  private request(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.renderer.render(this.scene, this.camera);
    });
  }
}
