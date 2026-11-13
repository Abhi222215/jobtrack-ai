"use client";

import { useEffect, useMemo, useState } from "react";
import AnalysisPanel from "@/components/AnalysisPanel";
import { Job, JobInput, STATUSES, createJob, deleteJob, getJobs, updateJob } from "@/lib/api";

const emptyForm = { company: "", role: "", job_url: "", description: "" };
const statusIcon: Record<string, string> = { Saved: "◷", Applied: "↗", Interview: "▣", Offer: "✦", Rejected: "—" };

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState("All applications");
  const [query, setQuery] = useState("");

  async function loadJobs() {
    try { setJobs(await getJobs()); setError(""); }
    catch { setError("Could not reach the backend. Check that the server is running on port 8000."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadJobs(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await createJob({ company: form.company, role: form.role, job_url: form.job_url || null, description: form.description || null, status: "Saved", applied_date: null });
      setForm(emptyForm); await loadJobs();
    } catch { setError("Could not add the job. Please try again."); }
    finally { setSaving(false); }
  }
  async function handleStatus(job: Job, status: string) {
    const data: JobInput = { company: job.company, role: job.role, job_url: job.job_url, description: job.description, status, applied_date: job.applied_date };
    try { await updateJob(job.id, data); await loadJobs(); } catch { setError("Could not update this application."); }
  }
  async function handleDelete(id: number) {
    if (!confirm("Delete this job application?")) return;
    try { await deleteJob(id); await loadJobs(); } catch { setError("Could not delete this application."); }
  }

  const visibleJobs = useMemo(() => jobs.filter((job) => (filter === "All applications" || job.status === filter) && `${job.role} ${job.company}`.toLowerCase().includes(query.toLowerCase())), [jobs, filter, query]);
  const activeCount = jobs.filter((job) => !["Rejected", "Offer"].includes(job.status)).length;
  const inputClass = "field";

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">J</span> jobtrack<span className="brand-ai">AI</span></a>
        <div className="topbar-right"><span className="live-dot" /> Your career, in progress <span className="avatar">Y</span></div>
      </header>

      <section className="welcome">
        <div><p className="eyebrow">YOUR CAREER DASHBOARD</p><h1>Make your next move.</h1><p className="welcome-copy">Keep every opportunity organized, and make each application count.</p></div>
        <div className="welcome-date">✳ <span>One step at a time</span></div>
      </section>

      <section className="stats-grid" aria-label="Application overview">
        <article className="stat-card"><span className="stat-icon violet">▤</span><div><p>Total applications</p><strong>{jobs.length}</strong></div><span className="stat-note">all time</span></article>
        <article className="stat-card"><span className="stat-icon blue">◷</span><div><p>In progress</p><strong>{activeCount}</strong></div><span className="stat-note">active</span></article>
        <article className="stat-card"><span className="stat-icon green">✦</span><div><p>Offers received</p><strong>{jobs.filter((j) => j.status === "Offer").length}</strong></div><span className="stat-note">keep it up</span></article>
      </section>

      <div className="content-grid">
        <section className="panel add-panel">
          <div className="panel-heading"><div><span className="section-kicker">NEW OPPORTUNITY</span><h2>Add an application</h2></div><span className="heading-icon">＋</span></div>
          <p className="panel-description">Save the details now. You can update your progress anytime.</p>
          <form onSubmit={handleAdd} className="job-form">
            <label>Company name<input className={inputClass} placeholder="e.g. Acme Studio" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
            <label>Role title<input className={inputClass} placeholder="e.g. Product Designer" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></label>
            <label>Job posting link <span className="optional">OPTIONAL</span><input className={inputClass} type="url" placeholder="https://company.com/careers/role" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} /></label>
            <label>Job description <span className="optional">OPTIONAL · USED FOR AI MATCHING</span><textarea className={inputClass} rows={4} placeholder="Paste the job description here to get tailored CV insights…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className="primary-button" type="submit" disabled={saving}><span>＋</span> {saving ? "Adding application…" : "Add application"}</button>
          </form>
        </section>

        <section className="applications-section">
          <div className="list-heading"><div><span className="section-kicker">YOUR PIPELINE</span><h2>Applications <span className="count-pill">{jobs.length}</span></h2></div><label className="search-box"><span>⌕</span><input aria-label="Search applications" placeholder="Search roles or companies" value={query} onChange={(e) => setQuery(e.target.value)} /></label></div>
          <div className="filter-row">{["All applications", ...STATUSES].map((item) => <button key={item} className={`filter-chip ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
          {error && <p className="notice error-notice">{error}</p>}
          {loading ? <div className="empty-state"><span className="loading-mark">◌</span><p>Loading your applications…</p></div> : visibleJobs.length === 0 ? <div className="empty-state"><span className="empty-icon">{jobs.length ? "⌕" : "✳"}</span><h3>{jobs.length ? "No matches found" : "Your next opportunity starts here"}</h3><p>{jobs.length ? "Try another search or status filter." : "Add your first application and keep your job search in one place."}</p></div> : (
            <ul className="job-list">{visibleJobs.map((job) => <li className="job-card" key={job.id}>
              <div className="job-card-top"><div className="company-avatar">{job.company.trim().charAt(0).toUpperCase()}</div><div className="job-title"><h3>{job.role}</h3><p>{job.company}{job.job_url && <><span className="meta-dot">·</span><a href={job.job_url} target="_blank" rel="noreferrer">View posting ↗</a></>}</p></div><span className={`status-badge status-${job.status.toLowerCase()}`}><i />{job.status}</span><button className="more-button" aria-label={`Delete ${job.role} at ${job.company}`} title="Delete application" onClick={() => handleDelete(job.id)}>×</button></div>
              <div className="job-card-bottom"><span className="added-date">Added {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span><div className="job-actions"><label className="status-select-wrap"><span className="sr-only">Application status</span><select aria-label={`Status for ${job.role}`} value={job.status} onChange={(e) => handleStatus(job, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select><span className="select-chevron">⌄</span></label><button className={`ai-button ${openId === job.id ? "is-open" : ""}`} onClick={() => setOpenId(openId === job.id ? null : job.id)}><span>✧</span>{openId === job.id ? "Close insights" : "AI insights"}<span className="arrow">↗</span></button></div></div>
              {openId === job.id && <AnalysisPanel jobId={job.id} />}
            </li>)}</ul>
          )}
        </section>
      </div>
      <footer className="footer"><span>jobtrack<span className="brand-ai">AI</span></span><span>Built for your next chapter <span className="footer-star">✳</span></span></footer>
    </main>
  );
}
