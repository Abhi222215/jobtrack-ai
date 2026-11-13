"use client";

import { useEffect, useState } from "react";
import { Analysis, analyzeJob, getAnalyses } from "@/lib/api";

function scoreColor(score: number) {
  if (score >= 70) return "score-good";
  if (score >= 40) return "score-mid";
  return "score-low";
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
    <div className="analysis-panel">
      <div className="analysis-heading"><div><span className="section-kicker">PERSONALIZED MATCH</span><h3>AI career insights</h3></div><span className="analysis-sparkle">✧</span></div>
      <p className="analysis-help">Add your CV skills and project experience to see how well they fit this role.</p>
      <textarea
        className="analysis-input"
        rows={6}
        placeholder="Paste your CV text here. Skills and projects are enough; leave out personal details."
        value={cv}
        onChange={(e) => setCv(e.target.value)}
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="primary-button analyze-button"
      >
        <span>✧</span> {loading ? "Analyzing your match…" : "Analyze my match"}
      </button>

      {error && <p className="analysis-error">{error}</p>}

      {result && (
        <div className="analysis-result">
          <div className="score-card"><div><span className="section-kicker">ROLE COMPATIBILITY</span><p>Overall match score</p></div><strong className={scoreColor(result.match_score)}>{result.match_score}<small>/100</small></strong></div>
          <div className="analysis-columns"><div className="analysis-block">
            <p className="analysis-block-title"><span>＋</span> Skills to build</p>
            {result.missing_skills.length ? <ul>
              {result.missing_skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul> : <p className="analysis-empty">No missing skills found.</p>}
          </div><div className="analysis-block">
            <p className="analysis-block-title"><span>✧</span> Suggestions</p>
            {result.suggestions.length ? <ul>
              {result.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul> : <p className="analysis-empty">No suggestions available.</p>}
          </div></div>
        </div>
      )}
    </div>
  );
}
