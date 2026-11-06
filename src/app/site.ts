import content from '../content/site.json';

export interface Game {
  slug: string;
  title: string;
  status: string;
  blurb: string;
  controls: string;
  /** Path to the game's own project, relative to this repo; used only by scripts/assemble.mjs. */
  project: string;
  build: string;
  dist: string;
  /** Thumbnail under public/, e.g. "thumbs/duck-gallery.png". */
  thumb: string;
  aspect: string;
}

export interface Project {
  title: string;
  tag: string;
  /** Material Symbols ligature name. */
  icon: string;
  text: string;
  href: string | null;
}

export interface Job {
  role: string;
  org: string | null;
  period: string;
  place: string | null;
  ladder: string | null;
  points: string[];
}

export interface Site {
  host: string;
  name: string;
  role: string;
  location: string;
  intro: string;
  summary: string[];
  highlights: { value: string; label: string }[];
  links: { github: string | null; linkedin: string | null; email: string | null };
  skills: { group: string; items: string[] }[];
  experience: Job[];
  education: { title: string; org: string; period: string }[];
  languages: { name: string; level: string }[];
  projects: Project[];
  games: Game[];
}

/** All site content. Edit src/content/site.json, never the components. */
export const SITE: Site = content;

export const findGame = (slug: string | undefined): Game | undefined =>
  SITE.games.find((g) => g.slug === slug);

/** Where scripts/assemble.mjs puts a game's bundle. Served as static files, outside the Angular router. */
export const playUrl = (g: Game): string => `/games/${g.slug}/play/`;
