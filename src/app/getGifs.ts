import fs from "fs";
import path from "path";

export type State = "Quiet" | "Moderate" | "Storm";

export type ParsedGif = {
  source: string;
  state: State;
  file: string;
};

export function getGifsFromPublic(): ParsedGif[] {
  const publicDir = path.join(process.cwd(), "public/gifs");
  const entries = fs.readdirSync(publicDir);
  const rx = /^TEC_([^_]+)_(Quiet|Moderate|Storm)\.gif$/i;
  return entries
    .map((name) => {
      const m = name.match(rx);
      if (!m) return null;
      const source = m[1];
      const state = m[2] as State;
      return { source, state, file: name };
    })
    .filter(Boolean) as ParsedGif[];
}
