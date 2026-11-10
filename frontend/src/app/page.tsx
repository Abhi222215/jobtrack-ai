"use client";

import { useEffect, useState } from "react";
import AnalysisPanel from "@/components/AnalysisPanel";
import {
  Job,
  JobInput,
  STATUSES,
  createJob,
  deleteJob,
  getJobs,
  updateJob,
} from "@/lib/api";

const emptyForm = { company: "", role: "", job_url: "", description: "" };

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  async function loadJobs() {
    try {
      setJobs(await getJobs());
      setError("");
    } catch {
      setError("Could not reach the backend. Is it running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createJob({
        company: form.company,
        role: form.role,
        job_url: form.job_url || null,
        description: form.description || null,
        status: "Saved",
        applied_date: null,
      });
      setForm(emptyForm);
      loadJobs();
    } catch {
      setError("Could not add the job.");
    }
  }

  async function handleStatus(job: Job, status: string) {
    const data: JobInput = {
      company: job.company,
      role: job.role,
      job_url: job.job_url,
      description: job.description,
      status,
      applied_date: job.applied_date,
    };
    await updateJob(job.id, data);
    loadJobs();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this job?")) return;
    await deleteJob(id);
    loadJobs();
  }

  const inputClass =
    "w-full rounded border border-gray-300 px-3 py-2 text-sm text-black";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">JobTrack AI</h1>

      <form
        onSubmit={handleAdd}
        className="mb-8 space-y-3 rounded-lg border border-gray-300 p-4"
      >
        <h2 className="font-semibold">Add a job</h2>
        <input
          className={inputClass}
          placeholder="Company"
          required
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Role"
          required
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Job URL (optional)"
          value={form.job_url}
          onChange={(e) => setForm({ ...form, job_url: e.target.value })}
        />
        <textarea
          className={inputClass}
          rows={4}
          placeholder="Job description (needed for AI analysis)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add job
        </button>
      </form>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && jobs.length === 0 && !error && (
        <p className="text-gray-500">No jobs yet. Add your first one above.</p>
      )}

      <ul className="space-y-3">
        {jobs.map((job) => (
          <li key={job.id} className="rounded-lg border border-gray-300 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{job.role}</p>
                <p className="text-sm text-gray-500">{job.company}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={job.status}
                  onChange={(e) => handleStatus(job, e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-sm text-black"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => setOpenId(openId === job.id ? null : job.id)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {openId === job.id ? "Hide AI" : "AI analysis"}
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            {openId === job.id && <AnalysisPanel jobId={job.id} />}
          </li>
        ))}
      </ul>
    </main>
  );
}