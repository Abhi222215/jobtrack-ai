"use client";

import { useEffect, useMemo, useState } from "react";
import AnalysisPanel from "@/components/AnalysisPanel";
import { Job, JobInput, STATUSES, createJob, deleteJob, getJobs, updateJob } from "@/lib/api";

const emptyForm = { company: "", role: "", job_url: "", description: "", applied_date: "", status: "Saved" };
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
  const [view, setView] = useState<"applications" | "add">("applications");

  async function loadJobs() {
    try { setJobs(await getJobs()); setError(""); }
    catch { setError("Could not reach the backend. Check that the server is running on port 8000."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadJobs(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await createJob({ company: form.company, role: form.role, job_url: form.job_url || null, description: form.description || null, status: form.status, applied_date: form.applied_date || null });
      setForm(emptyForm); await loadJobs(); setView("applications");
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
  const counts = useMemo(() => Object.fromEntries(STATUSES.map((status) => [status, jobs.filter((job) => job.status === status).length])), [jobs]);
  const activePercent = jobs.length ? Math.round((activeCount / jobs.length) * 100) : 0;
  const offerPercent = jobs.length ? Math.round((jobs.filter((job) => job.status === "Offer").length / jobs.length) * 100) : 0;
  const inputClass = "field";

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <a className="brand" href="#" onClick={() => setView("applications")}><span className="brand-mark">J</span><span>JobTrack</span></a>
        <div className="workspace-user"><span className="user-initials">JS</span><span className="user-label"><strong>Job seeker</strong><small>Personal workspace</small></span></div>
      </header>

      <div className="workspace-body">
        <aside className="sidebar" aria-label="Main navigation">
          <span className="sidebar-label">WORKSPACE</span>
          <button className={`nav-item ${view === "applications" ? "active" : ""}`} onClick={() => setView("applications")}><span className="nav-icon">⌂</span>Dashboard</button>
          <button className={`nav-item ${view === "add" ? "active" : ""}`} onClick={() => setView("applications")}><span className="nav-icon">▤</span>Applications<span className="nav-count">{jobs.length}</span></button>
          <div className="sidebar-tip"><span>✦</span><strong>Keep moving forward</strong><p>Small steps today can lead to a great next opportunity.</p></div>
          <div className="sidebar-bottom"><span className="nav-icon">?</span><span>Need a hand?</span></div>
        </aside>

        <main className="workspace-main">
          {error && <p className="notice error-notice workspace-error">{error}</p>}
          {view === "add" ? (
            <>
              <div className="breadcrumbs"><button onClick={() => setView("applications")}>Dashboard</button><span>/</span><button onClick={() => setView("applications")}>Applications</button><span>/</span><strong>Add application</strong></div>
              <div className="page-title-row"><div><h1>Add New Application</h1><p>Keep your job search organized. Add a role to your tracker.</p></div><button className="back-link" onClick={() => setView("applications")}>← <span>Back to applications</span></button></div>
              <div className="form-layout">
                <section className="form-card">
                  <div className="form-card-heading"><h2>Job details</h2><p>Fields marked with <b>*</b> are required.</p></div>
                  <form onSubmit={handleAdd} className="application-form">
                    <span className="form-section-label">COMPANY INFORMATION</span>
                    <div className="form-fields two-col">
                      <label>Company name <b>*</b><input className={inputClass} placeholder="e.g. WSO2" required maxLength={160} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
                      <label>Job title <b>*</b><input className={inputClass} placeholder="e.g. Software Engineering Intern" required maxLength={200} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></label>
                    </div>
                    <span className="form-section-label">APPLICATION DETAILS</span>
                    <label>Job advertisement URL <span className="optional">OPTIONAL</span><input className={inputClass} type="url" placeholder="https://company.com/careers" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} /></label>
                    <div className="form-fields two-col">
                      <label>Applied date <span className="optional">OPTIONAL</span><input className={inputClass} type="date" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} /></label>
                      <label>Application status <b>*</b><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
                    </div>
                    <label>Job description <span className="optional">OPTIONAL · USED FOR AI MATCHING</span><textarea className={inputClass} rows={5} maxLength={30000} placeholder="Paste the job requirements here to get personalized CV insights…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
                    <div className="form-footer"><button type="button" className="secondary-button" onClick={() => { setForm(emptyForm); setView("applications"); }}>Cancel</button><button className="primary-button" type="submit" disabled={saving}><span>＋</span>{saving ? "Saving application…" : "Save application"}</button></div>
                  </form>
                </section>
                <aside className="form-aside">
                  <section className="tips-card"><h2>A few quick tips</h2><ol><li><span>1</span><div><strong>Save the job link</strong><p>Keep the original listing easy to find.</p></div></li><li><span>2</span><div><strong>Track your progress</strong><p>Update the status as you move forward.</p></div></li><li><span>3</span><div><strong>Add the job description</strong><p>Get tailored CV insights for this role.</p></div></li></ol></section>
                  <section className="edit-tip"><strong>✨ Make it useful</strong><p>Add a few notes from the job listing so you can compare the requirements with your experience later.</p></section>
                  <p className="privacy-note"><span>✓</span> Your application details stay in your tracker.</p>
                </aside>
              </div>
            </>
          ) : (
            <>
              <section className="welcome">
                <div><p className="eyebrow">YOUR CAREER DASHBOARD</p><h1>Make your next move.</h1><p className="welcome-copy">Keep every opportunity organized, and make each application count.</p></div>
                <div className="welcome-date"><span className="welcome-date-icon">✳</span><span><strong>One step at a time</strong><small>Your next chapter is taking shape</small></span></div>
              </section>
              <section className="stats-grid" aria-label="Application overview">
                <article className="stat-card"><span className="stat-icon violet">▤</span><div className="stat-copy"><p>Total applications</p><strong>{jobs.length}</strong><span className="stat-caption">Across your job search</span></div><span className="stat-note">ALL TIME</span><span className="stat-meter"><i style={{ width: jobs.length ? "100%" : "0%" }} /></span></article>
                <article className="stat-card"><span className="stat-icon blue">◷</span><div className="stat-copy"><p>In progress</p><strong>{activeCount}</strong><span className="stat-caption">Still in the running</span></div><span className="stat-note">{activePercent}%</span><span className="stat-meter blue-meter"><i style={{ width: `${activePercent}%` }} /></span></article>
                <article className="stat-card"><span className="stat-icon green">✦</span><div className="stat-copy"><p>Offers received</p><strong>{jobs.filter((j) => j.status === "Offer").length}</strong><span className="stat-caption">Celebrate every win</span></div><span className="stat-note">{offerPercent}%</span><span className="stat-meter green-meter"><i style={{ width: `${offerPercent}%` }} /></span></article>
              </section>
              <section className="applications-section" id="applications">
                <div className="list-heading"><div><span className="section-kicker">YOUR PIPELINE</span><h2>Applications <span className="count-pill">{jobs.length}</span></h2></div><label className="search-box"><span>⌕</span><input aria-label="Search applications" placeholder="Search roles or companies" value={query} onChange={(e) => setQuery(e.target.value)} /></label><button className="primary-button list-add-button" onClick={() => { setForm(emptyForm); setView("add"); }}>＋ Add application</button></div>
                <div className="filter-row" role="group" aria-label="Filter applications by status">{["All applications", ...STATUSES].map((item) => { const count = item === "All applications" ? jobs.length : counts[item]; return <button key={item} aria-pressed={filter === item} className={`filter-chip ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)}>{item}<span className="filter-count">{count}</span></button>; })}</div>
                {loading ? <div className="empty-state"><span className="loading-mark">◌</span><p>Loading your applications…</p></div> : visibleJobs.length === 0 ? <div className="empty-state"><span className="empty-icon">{jobs.length ? "⌕" : "✳"}</span><h3>{jobs.length ? "No matches found" : "Your next opportunity starts here"}</h3><p>{jobs.length ? "Try another search or status filter." : "Add your first application and keep your job search in one place."}</p>{!jobs.length && <button className="primary-button" onClick={() => setView("add")}>＋ Add your first application</button>}</div> : (
                  <ul className="job-list">{visibleJobs.map((job) => <li className="job-card" key={job.id}>
                    <div className="job-card-top"><div className="company-avatar">{job.company.trim().charAt(0).toUpperCase()}</div><div className="job-title"><h3>{job.role}</h3><p>{job.company}{job.job_url && <><span className="meta-dot">·</span><a href={job.job_url} target="_blank" rel="noreferrer">View posting ↗</a></>}</p></div><span className={`status-badge status-${job.status.toLowerCase()}`}><span className="status-symbol">{statusIcon[job.status]}</span>{job.status}</span><button className="more-button" aria-label={`Delete ${job.role} at ${job.company}`} title="Delete application" onClick={() => handleDelete(job.id)}>×</button></div>
                    <div className="job-card-bottom"><span className="added-date">Added {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span><div className="job-actions"><label className="status-select-wrap"><span className="sr-only">Application status</span><select aria-label={`Status for ${job.role}`} value={job.status} onChange={(e) => handleStatus(job, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select><span className="select-chevron">⌄</span></label><button className={`ai-button ${openId === job.id ? "is-open" : ""}`} onClick={() => setOpenId(openId === job.id ? null : job.id)}><span>✧</span>{openId === job.id ? "Close insights" : "AI insights"}<span className="arrow">↗</span></button></div></div>
                    {openId === job.id && <AnalysisPanel jobId={job.id} />}
                  </li>)}</ul>
                )}
              </section>
            </>
          )}
          <footer className="workspace-footer"><span>JobTrack <span className="brand-ai">AI</span></span><span>Built for your next chapter <span className="footer-star">✳</span></span></footer>
        </main>
      </div>
    </div>
  );
}
