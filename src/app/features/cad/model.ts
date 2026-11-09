// The CAD catalog that scripts/assemble.mjs publishes at /cad/models/catalog.json, and the
// pure helpers the sheet needs. Nothing here touches WebGL, so it is unit-tested directly.

/** Where scripts/assemble.mjs puts the models. Static files, outside the Angular router. */
export const MODELS_URL = '/cad/models/';

export interface Instance {
  /** 16 floats, row-major: maps the STL (print orientation) into the assembly frame. */
  matrix: number[];
}

export interface Part {
  id: string;
  /** Relative to MODELS_URL. A binary STL. */
  file: string;
  material?: string;
  note?: string;
  /** Context geometry: bought parts, the desk. Drawn in pencil, never exploded. */
  ghost?: boolean;
  /** An alternative that is not fitted together with the rest. Hidden by default. */
  alt?: boolean;
  tris?: number;
  instances?: Instance[];
}

export interface Assembly {
  key: string;
  name: string;
  /** Which model axis points up; the generators write "z". */
  up?: 'y' | 'z';
  parts: Part[];
}

export interface Catalog {
  assemblies: Assembly[];
}

export type Kind = 'printed' | 'flexible' | 'bought' | 'alternative';

export const kindOf = (p: Part): Kind =>
  p.ghost
    ? 'bought'
    : p.alt
      ? 'alternative'
      : /TPU/i.test(p.material ?? '')
        ? 'flexible'
        : 'printed';

export const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** Triangle positions (9 floats each) from a binary STL. Throws on anything else. */
export function parseStl(buf: ArrayBuffer): Float32Array {
  if (buf.byteLength < 84) throw new Error('not a binary STL: too short');
  const dv = new DataView(buf);
  const n = dv.getUint32(80, true);
  if (84 + n * 50 !== buf.byteLength) throw new Error('not a binary STL: size does not match');
  const pos = new Float32Array(n * 9);
  let o = 84;
  let k = 0;
  for (let i = 0; i < n; i++) {
    o += 12; // skip the facet normal; normals are recomputed from the triangle
    for (let j = 0; j < 9; j++, o += 4) pos[k++] = dv.getFloat32(o, true);
    o += 2;
  }
  return pos;
}

/** Size of a binary STL with this many triangles: 80-byte header, count, 50 bytes per triangle. */
export const stlBytes = (tris: number): number => 84 + 50 * tris;

/**
 * Download progress of an assembly, 0..1: bytes received so far over the expected size of each
 * distinct file (parts can share one). Files without a triangle count are left out of the sum.
 */
export function progressOf(parts: Part[], received: (file: string) => number): number {
  const files = new Map(parts.filter((p) => p.tris).map((p) => [p.file, stlBytes(p.tris!)]));
  let want = 0;
  let got = 0;
  for (const [file, size] of files) {
    want += size;
    got += Math.min(size, received(file));
  }
  return want ? got / want : 1;
}

type Vec3 = [number, number, number];

/**
 * How far an instance moves when the drawing is exploded: straight out from the assembly centre,
 * by part of the assembly's size plus part of its own distance, so near parts still separate.
 */
export function explodeOffset(centroid: Vec3, center: Vec3, reach: number, amount: number): Vec3 {
  const d: Vec3 = [centroid[0] - center[0], centroid[1] - center[1], centroid[2] - center[2]];
  const len = Math.hypot(...d);
  if (len === 0 || amount === 0) return [0, 0, 0];
  const s = (amount * (0.15 * reach + 0.5 * len)) / len;
  return [d[0] * s, d[1] * s, d[2] * s];
}

/** "258 × 258 × 41 mm" */
export const formatSize = (x: number, y: number, z: number): string =>
  `${Math.round(x)} × ${Math.round(y)} × ${Math.round(z)} mm`;

export async function fetchCatalog(fetcher: typeof fetch = fetch): Promise<Catalog> {
  const r = await fetcher(MODELS_URL + 'catalog.json');
  if (!r.ok) throw new Error(`catalog: HTTP ${r.status}`);
  return (await r.json()) as Catalog;
}
