const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

export type Job = {
  id: number;
  company: string;
  role: string;
  job_url: string | null;
  description: string | null;
  status: string;
  applied_date: string | null;
  created_at: string;
};

export type JobInput = Omit<Job, "id" | "created_at">;

export type Analysis = {
  id: number;
  job_id: number;
  match_score: number;
  missing_skills: string[];
  suggestions: string[];
  created_at: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export const getJobs = () => request<Job[]>("/jobs/");

export const createJob = (job: JobInput) =>
  request<Job>("/jobs/", { method: "POST", body: JSON.stringify(job) });

export const updateJob = (id: number, job: JobInput) =>
  request<Job>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(job) });

export const deleteJob = (id: number) =>
  request<{ detail: string }>(`/jobs/${id}`, { method: "DELETE" });

export const analyzeJob = (jobId: number, cvText: string) =>
  request<Analysis>(`/jobs/${jobId}/analyze`, {
    method: "POST",
    body: JSON.stringify({ cv_text: cvText }),
  });

export const getAnalyses = (jobId: number) =>
  request<Analysis[]>(`/jobs/${jobId}/analyses`);