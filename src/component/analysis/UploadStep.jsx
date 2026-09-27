import { useRef } from "react";

export default function UploadStep({ isUploading, filename, onSelectFile }) {
  const inputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onSelectFile(file);
  }

  return (
    <section
      aria-labelledby="analysis-upload-title"
      className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-1 py-8 sm:py-12"
    >
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-bronze/10 text-gold ring-1 ring-bronze/30">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
            <path d="M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" />
          </svg>
        </span>
        <h2
          id="analysis-upload-title"
          className="mt-5 text-2xl font-semibold tracking-tight text-ivory sm:text-3xl"
        >
          Start a coaching analysis
        </h2>
        <p className="mx-auto mt-2 max-w-[55ch] text-sm leading-relaxed text-parchment">
          Upload a PGN to follow the analysis live and receive your evidence-backed coaching report.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-stone/70 bg-obsidian/35 px-5 py-8 text-center transition-colors sm:px-8 sm:py-10">
        <p className="text-sm font-medium text-ivory">
          {isUploading ? "Sending your PGN to analysis" : "Choose a PGN file"}
        </p>
        <p className="mt-1.5 text-xs text-parchment">
          {isUploading
            ? filename || "Preparing your analysis job…"
            : "Games in the file are analyzed together to find recurring patterns."}
        </p>
        <input
          ref={inputRef}
          id="analysis-pgn-file"
          type="file"
          accept=".pgn"
          onChange={handleFileChange}
          aria-label="Choose a PGN file"
          aria-describedby="analysis-pgn-hint"
          className="sr-only"
          disabled={isUploading}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-bronze px-6 py-3 text-sm font-semibold text-obsidian transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-[0_12px_24px_-8px_rgba(200,155,90,0.25)] focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isUploading ? (
            <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian/35 border-t-obsidian" />
          ) : (
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5" />
              <path d="M4 11v4.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V11" />
            </svg>
          )}
          {isUploading ? "Uploading…" : "Choose PGN file"}
        </button>
        <p id="analysis-pgn-hint" className="mt-3 text-xs text-faded">
          PGN files only · Your analysis begins as soon as the upload completes.
        </p>
      </div>
    </section>
  );
}
