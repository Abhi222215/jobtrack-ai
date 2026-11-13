# JobTrack AI

AI-powered job application tracker. Save the jobs you apply for, move them through a pipeline (Saved, Applied, Interview, Offer, Rejected), and paste your CV to get an AI match score, the skills you are missing, and concrete suggestions to improve your CV for that job.

**Live demo:** https://jobtrack-ai-e838.vercel.app
**API docs:** https://jobtrack-ai-581f6.containers.snapdeploy.app/docs

> The demo runs on free tiers. The backend sleeps after a period of inactivity, so the first request can take up to a minute. Please do not enter real personal details (address, phone number, email) in the CV box.

## Screenshots

<!-- Replace these with your own images in docs/ -->
![Jobs list](docs/screenshot-jobs.png)
![AI analysis](docs/screenshot-analysis.png)

## Features

- Add, edit, delete and list job applications
- Change the application status from a dropdown
- AI CV analysis per job: match score (0-100), missing skills, improvement suggestions
- Analysis history is stored per job in PostgreSQL
- REST API with auto-generated OpenAPI docs
- Automated tests for the API (PyTest)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL (Neon) in production, SQLite locally |
| AI | LLM through an OpenAI-compatible API (Google Gemini), provider configurable via environment variables |
| Testing | PyTest, FastAPI TestClient |
| CI/CD | GitHub Actions, Docker |
| Hosting | Vercel (frontend), SnapDeploy (backend), Neon (database) |

## Architecture

```
Browser (Next.js on Vercel)
        |
        v
FastAPI backend (SnapDeploy)  --->  LLM API (CV vs job description)
        |
        v
PostgreSQL (Neon)
```

<!-- Add your Draw.io export, for example: ![Architecture](docs/architecture.png) -->

## Project structure

```
jobtrack-ai/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, routers
│   │   ├── database.py        # SQLAlchemy engine and session
│   │   ├── models.py          # Job and Analysis tables
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── routers/           # jobs.py, analysis.py
│   │   └── services/ai.py     # LLM call and JSON parsing
│   ├── tests/                 # PyTest suite
│   └── Dockerfile
├── frontend/
│   └── src/                   # Next.js app, components, API client
├── docs/                      # diagrams and wireframes
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## API overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobs/` | List all jobs |
| POST | `/jobs/` | Create a job |
| GET | `/jobs/{job_id}` | Get one job |
| PUT | `/jobs/{job_id}` | Update a job |
| DELETE | `/jobs/{job_id}` | Delete a job |
| POST | `/jobs/{job_id}/analyze` | Analyze a CV against the job description |
| GET | `/jobs/{job_id}/analyses` | List past analyses for a job |

Interactive docs are available at `/docs` when the backend is running.

## Running locally

### Backend

Python 3.12 is recommended.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LLM_MODEL=your-model-name
```

Optional variables:

```
DATABASE_URL=postgresql://user:password@host/dbname   # defaults to a local SQLite file
ALLOWED_ORIGINS=http://localhost:3000                  # comma-separated list
```

Run the API:

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Open http://localhost:3000.

### Tests

```bash
cd backend
python -m pytest -v
```

The tests use an in-memory database and mock the AI call, so they need no API key.

### Docker

```bash
docker compose up --build
```

## How AI tools were used

AI assistants helped with planning the feature list, drafting boilerplate, and debugging errors. Every generated piece of code was read, run and adjusted before being committed. The CV analysis feature itself calls an LLM with a structured prompt and expects a strict JSON answer, which the backend validates before saving.

## What I learned

- A Python `.gitignore` template silently ignored my `frontend/src/lib/` folder, which broke the production build until I found it
- Reading configuration (database URL, CORS origins, API keys) from environment variables made the same code run locally and in production
- Mocking the external AI call keeps tests fast, free and deterministic
- Free hosting tiers add cold starts and quotas that are worth planning for

## Roadmap

- User accounts and login
- CV file upload (PDF)
- Dashboard charts for application statuses
- Rate limiting on the AI endpoint

## License

MIT
