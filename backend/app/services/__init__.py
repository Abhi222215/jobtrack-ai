import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
client = Anthropic()  # ANTHROPIC_API_KEY එක .env එකෙන් ගන්නවා

MODEL = "claude-sonnet-5-5"

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
    message = client.messages.create(
        model=MODEL,
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Company: {company}\nRole: {role}\n\n"
                    f"JOB DESCRIPTION:\n{description}\n\n"
                    f"CANDIDATE CV:\n{cv_text}"
                ),
            }
        ],
    )
    text = message.content[0].text
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)