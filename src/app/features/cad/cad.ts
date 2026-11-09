import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';
import { Catalog, fetchCatalog, formatSize, Kind, Part } from './model';
import type { CadSheet, Inks } from './sheet';

interface Row {
  index: number;
  part: Part;
  kind: Kind;
  qty: number;
  visible: boolean;
}

type Status = 'loading' | 'ready' | 'missing' | 'failed';

/** Theme tokens (styles.scss) the sheet draws with, per kind of part. */
const INK_TOKENS: Record<keyof Inks, string> = {
  printed: '--pen',
  flexible: '--ink-green',
  bought: '--pencil',
  alternative: '--ink-violet',
  hot: '--ink-red',
};

const STEP = 0.12;

@Component({
  selector: 'app-cad',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './cad.html',
  styleUrl: './cad.scss',
})
export class Cad {
  protected readonly cad = SITE.cad;
  protected readonly legend: { kind: Kind; label: string }[] = [
    { kind: 'printed', label: 'printed, PLA' },
    { kind: 'flexible', label: 'printed, flexible TPU' },
    { kind: 'bought', label: 'bought or context' },
    { kind: 'alternative', label: 'alternative' },
  ];

  protected readonly selected = signal(SITE.cad.models[0].key);
  protected readonly model = computed(
    () => this.cad.models.find((m) => m.key === this.selected()) ?? this.cad.models[0],
  );
  protected readonly status = signal<Status>('loading');
  protected readonly rows = signal<Row[]>([]);
  protected readonly stats = signal<{ tris: number; size: string } | null>(null);
  protected readonly explode = signal(0);
  protected readonly ghosts = signal(true);
  protected readonly alternatives = signal(false);
  protected readonly xray = signal(false);
  protected readonly hot = signal<number | null>(null);

  protected readonly hotRow = computed(() => {
    const i = this.hot();
    return i === null ? null : (this.rows()[i] ?? null);
  });
  protected readonly hasAlternatives = computed(() => this.rows().some((r) => r.part.alt));

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly sheet = signal<CadSheet | null>(null);
  private catalog: Catalog | null = null;
  private drag: { x: number; y: number } | null = null;
  private lastPick = 0;

  constructor() {
    inject(Seo).set({
      title: `CAD · ${SITE.name}`,
      description: this.cad.description,
      path: '/cad/',
    });
    afterNextRender(() => void this.start());
    inject(DestroyRef).onDestroy(() => this.sheet()?.dispose());

    effect(() => {
      const sheet = this.sheet();
      const key = this.selected();
      if (sheet) void this.show(sheet, key);
    });
    effect(() => this.sheet()?.setExplode(this.explode()));
    effect(() => this.sheet()?.setGhosts(this.ghosts()));
    effect(() => this.sheet()?.setAlternatives(this.alternatives()));
    effect(() => this.sheet()?.setXray(this.xray()));
    effect(() => this.sheet()?.setHot(this.hot()));
  }

  protected toggle(row: Row, on: boolean): void {
    this.rows.update((rows) =>
      rows.map((r) => (r.index === row.index ? { ...r, visible: on } : r)),
    );
    this.sheet()?.setVisible(row.index, on);
  }

  protected zoom(factor: number): void {
    this.sheet()?.zoom(factor);
  }

  protected reset(): void {
    this.sheet()?.resetView();
    this.explode.set(0);
  }

  protected value(e: Event): number {
    return +(e.target as HTMLInputElement).value;
  }

  protected checked(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }

  protected down(e: PointerEvent): void {
    this.drag = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  protected move(e: PointerEvent): void {
    const sheet = this.sheet();
    if (!sheet) return;
    if (this.drag) {
      sheet.rotate((e.clientX - this.drag.x) * 0.008, (e.clientY - this.drag.y) * 0.008);
      this.drag = { x: e.clientX, y: e.clientY };
      return;
    }
    if (e.pointerType !== 'mouse' || e.timeStamp - this.lastPick < 60) return;
    this.lastPick = e.timeStamp;
    this.hot.set(sheet.pick(e.offsetX, e.offsetY));
  }

  protected up(): void {
    this.drag = null;
  }

  /** Trackpad pinch arrives as a wheel event with ctrlKey; a plain wheel still scrolls the page. */
  protected wheel(e: WheelEvent): void {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    this.sheet()?.zoom(1 + Math.max(-0.5, Math.min(0.5, e.deltaY * 0.01)));
  }

  protected key(e: KeyboardEvent): void {
    const sheet = this.sheet();
    if (!sheet) return;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => sheet.rotate(-STEP, 0),
      ArrowRight: () => sheet.rotate(STEP, 0),
      ArrowUp: () => sheet.rotate(0, -STEP),
      ArrowDown: () => sheet.rotate(0, STEP),
      '+': () => sheet.zoom(0.85),
      '=': () => sheet.zoom(0.85),
      '-': () => sheet.zoom(1 / 0.85),
      '0': () => this.reset(),
    };
    const fn = moves[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  }

  private async start(): Promise<void> {
    const canvas = this.canvas().nativeElement;
    try {
      const [{ CadSheet }, catalog] = await Promise.all([import('./sheet'), fetchCatalog()]);
      const css = getComputedStyle(canvas);
      const inks = Object.fromEntries(
        Object.entries(INK_TOKENS).map(([k, token]) => [k, css.getPropertyValue(token).trim()]),
      ) as Inks;
      this.catalog = catalog;
      this.sheet.set(new CadSheet(canvas, inks));
    } catch {
      // A build without the models (a fresh clone, CI): the page still works, the sheet says so.
      this.status.set('missing');
    }
  }

  private async show(sheet: CadSheet, key: string): Promise<void> {
    const assembly = this.catalog?.assemblies.find((a) => a.key === key);
    if (!assembly) {
      this.status.set('missing');
      return;
    }
    this.status.set('loading');
    this.hot.set(null);
    try {
      const loaded = await sheet.load(assembly);
      if (!loaded) return; // another model was picked meanwhile
      this.rows.set(loaded.parts.map((p, index) => ({ index, ...p, visible: !p.part.alt })));
      this.stats.set({ tris: loaded.tris, size: formatSize(...loaded.size) });
      this.status.set('ready');
    } catch {
      if (this.selected() === key) this.status.set('failed');
    }
  }
}
