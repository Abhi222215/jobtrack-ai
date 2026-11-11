"use client";

import { useEffect, useState } from "react";
import { Analysis, analyzeJob, getAnalyses } from "@/lib/api";

function scoreColor(score: number) {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

export default function AnalysisPanel({ jobId }: { jobId: number }) {
  const [cv, setCv] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalyses(jobId)
      .then((list) => {
        if (list.length > 0) setResult(list[0]);
      })
      .catch(() => {});
  }, [jobId]);

  async function handleAnalyze() {
    if (!cv.trim()) {
      setError("Paste your CV text first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setResult(await analyzeJob(jobId, cv));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-4 border-t border-gray-300 pt-4">
      <textarea
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black"
        rows={6}
        placeholder="Paste your CV text here (skills and projects are enough, no personal details)"
        value={cv}
        onChange={(e) => setCv(e.target.value)}
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze with AI"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="space-y-3">
          <p className="text-lg font-semibold">
            Match score:{" "}
            <span className={scoreColor(result.match_score)}>
              {result.match_score}/100
            </span>
          </p>
          <div>
            <p className="font-semibold">Missing skills</p>
            <ul className="list-inside list-disc text-sm">
              {result.missing_skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold">Suggestions</p>
            <ul className="list-inside list-disc text-sm">
              {result.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}