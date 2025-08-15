import Link from "next/link";
import { getGifsFromPublic, State } from "./getGifs";
import BadgeModalWrapper from "../components/BadgeModalWrapper";

const SOURCE_LABELS: Record<string, string> = {
  JPLD: "Ground Truth: JPLD",
  IRI: "International Reference Ionosphere",
  LSTM: "IonCast LSTM",
  SFNO: "IonCast SFNO",
  GNN: "IonCast GNN",
};

const STATE_LABELS: Record<State, string> = {
  Quiet: "Quiet",
  Moderate: "Moderate",
  Storm: "Storm",
};

const pill = (active: boolean): React.CSSProperties => ({
  textDecoration: "none",
  padding: "10px 14px",
  borderRadius: 999,
  border: active ? "1px solid #2563eb" : "1px solid #293042",
  background: active ? "rgba(37, 99, 235, 0.15)" : "#141a28",
  color: active ? "#eaf1ff" : "#d7e2f1",
  fontWeight: 600,
  fontSize: 14,
  display: "inline-block",
  lineHeight: 1,
  whiteSpace: "nowrap",
});

const segment = (active: boolean): React.CSSProperties => ({
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 10,
  border: active ? "1px solid #2563eb" : "1px solid #293042",
  background: active ? "rgba(37, 99, 235, 0.15)" : "#141a28",
  color: active ? "#eaf1ff" : "#d7e2f1",
  fontWeight: 600,
  fontSize: 13,
  display: "inline-block",
  lineHeight: 1,
  whiteSpace: "nowrap",
});


export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const gifs = getGifsFromPublic();

  // Present options from files
  const sourcesPresent = Array.from(new Set(gifs.map((g) => g.source))).sort(
    (a, b) => (SOURCE_LABELS[a] ?? a).localeCompare(SOURCE_LABELS[b] ?? b)
  );
  const statesPresent: State[] = (["Quiet", "Moderate", "Storm"] as State[]).filter(
    (st) => gifs.some((g) => g.state === st)
  );

  const defaultSource = sourcesPresent[0];
  const defaultState = statesPresent[0];

  // helpers to avoid nested ternaries
  const firstString = (v?: string | string[]) =>
    Array.isArray(v) ? v[0] : v;

  const pickSource = (
    sp: { [k: string]: string | string[] | undefined } | undefined,
    list: string[],
    fallback: string
  ) => {
    const raw = firstString(sp?.source);
    return raw && list.includes(raw) ? raw : fallback;
  };

  const pickState = (
    sp: { [k: string]: string | string[] | undefined } | undefined,
    list: State[],
    fallback: State
  ) => {
    const raw = firstString(sp?.state) as State | undefined;
    return raw && list.includes(raw) ? raw : fallback;
  };

  const selectedSource = pickSource(resolvedSearchParams, sourcesPresent, defaultSource);
  const selectedState = pickState(resolvedSearchParams, statesPresent, defaultState);

  // Constrain states to selected source
  const statesForSource = (["Quiet", "Moderate", "Storm"] as State[]).filter((st) =>
    gifs.some((g) => g.source === selectedSource && g.state === st)
  );
  const safeSelectedState = statesForSource.includes(selectedState)
    ? selectedState
    : statesForSource[0];

  const match = gifs.find(
    (g) => g.source === selectedSource && g.state === safeSelectedState
  );

  const urlFor = (src: string, st: State) =>
    `/?source=${encodeURIComponent(src)}&state=${encodeURIComponent(st)}`;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background: "#000",
        color: "#e8eef7",
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Arial,sans-serif',
      }}
    >
      {/* Responsive Header */}
      <header
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #222836",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Ionosphere Forecast Model Explorer
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.8 }}>Model</span>
            {sourcesPresent.map((src) => (
              <Link
                key={src}
                href={urlFor(src, safeSelectedState)}
                title={SOURCE_LABELS[src] ?? src}
                style={pill(src === selectedSource)}
              >
                {SOURCE_LABELS[src] ?? src}
              </Link>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.8 }}>Intensity Level</span>
            {statesForSource.map((st) => (
              <Link
                key={st}
                href={urlFor(selectedSource, st)}
                title={st}
                style={segment(st === safeSelectedState)}
              >
                {STATE_LABELS[st]}
              </Link>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 600px) {
            header {
              padding: 12px 8px !important;
              gap: 8px !important;
            }
            header h1 {
              font-size: 16px !important;
            }
            header > div {
              flex-direction: column !important;
              gap: 8px !important;
            }
            header span {
              font-size: 11px !important;
            }
            header a {
              font-size: 12px !important;
              padding: 8px 10px !important;
            }
          }
        `}</style>
      </header>

      {/* Viewer */}
      <section
        style={{
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        {match ? (
          <figure
            style={{
              margin: 0,
              background: "#000",
              border: "none",
              borderRadius: 12,
              padding: 16,
              width: "min(80%, 900px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/gifs/${match.file}`}
              alt={match.file}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "calc(100vh - 220px)", // leaves room for header and badge
                display: "block",
                borderRadius: 8,
                objectFit: "contain",
                boxSizing: "border-box",
              }}
            />
            <style>{`
              @media (max-width: 900px) {
                figure {
                  width: 100% !important;
                  padding: 8px !important;
                  justify-content: flex-start !important;
                  align-items: flex-start !important;
                }
                figure img {
                  max-height: calc(100vh - 180px) !important;
                }
              }
              @media (max-width: 600px) {
                figure {
                  padding: 4px !important;
                  justify-content: flex-start !important;
                  align-items: flex-start !important;
                }
                figure img {
                  max-height: calc(100vh - 140px) !important;
                }
              }
            `}</style>
          </figure>
        ) : (
          <p style={{ opacity: 0.8 }}>
            No matching GIF found. Add files to <code>/public</code> named like{" "}
            <code>TEC_&lt;SOURCE&gt;_&lt;STATE&gt;.gif</code>.
          </p>
        )}
      </section>

      {/* Badge modal client component */}
      <BadgeModalWrapper />
    </main>
  );
}
