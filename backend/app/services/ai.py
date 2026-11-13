import os
import json
import re

import httpx
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")
API_KEY = os.getenv("LLM_API_KEY")
MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")

SYSTEM_PROMPT = """You are an expert technical recruiter and career coach.
Compare the candidate's CV against the job description.
Respond with ONLY a valid JSON object, no extra text, in this exact shape:
{
  "match_score": <integer 0-100>,
  "missing_skills": [<skills or requirements in the job description that the CV lacks>],
  "suggestions": [<specific, actionable ways to improve the CV for this job>]
}
Be honest and specific. Give at most 6 items in each list."""


def analyze_cv(cv_text: str, company: str, role: str, description: str) -> dict:
    if not API_KEY:
        raise RuntimeError("LLM_API_KEY is not configured")

    try:
        response = httpx.post(
            f"{BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json={
                "model": MODEL,
                "temperature": 0.2,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": (
                            f"Company: {company}\nRole: {role}\n\n"
                            f"JOB DESCRIPTION:\n{description}\n\n"
                            f"CANDIDATE CV:\n{cv_text}"
                        ),
                    },
                ],
            },
            timeout=httpx.Timeout(35.0, connect=10.0),
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        if not isinstance(content, str):
            raise ValueError("The AI provider returned an empty response")
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.IGNORECASE)
        result = json.loads(text)
        if not isinstance(result, dict):
            raise ValueError("The AI provider returned an invalid response")
        return result
    except (httpx.HTTPError, KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise RuntimeError("AI provider request failed") from exc
