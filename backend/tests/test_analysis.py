JOB = {
    "company": "WSO2",
    "role": "Software Engineer Intern",
    "description": "Backend internship working with Python and APIs",
}

FAKE_RESULT = {
    "match_score": 72,
    "missing_skills": ["Docker", "Kubernetes"],
    "suggestions": ["Add a project that uses Docker"],
}


def test_analyze_job_not_found(client):
    response = client.post("/jobs/999/analyze", json={"cv_text": "Python developer"})
    assert response.status_code == 404


def test_analyze_requires_description(client):
    job_id = client.post("/jobs/", json={"company": "X", "role": "Y"}).json()["id"]
    response = client.post(f"/jobs/{job_id}/analyze", json={"cv_text": "Python"})
    assert response.status_code == 400


def test_analyze_success(client, monkeypatch):
    monkeypatch.setattr(
        "app.routers.analysis.analyze_cv", lambda *args, **kwargs: FAKE_RESULT
    )
    job_id = client.post("/jobs/", json=JOB).json()["id"]

    response = client.post(f"/jobs/{job_id}/analyze", json={"cv_text": "Python, SQL"})
    assert response.status_code == 200
    data = response.json()
    assert data["match_score"] == 72
    assert data["missing_skills"] == ["Docker", "Kubernetes"]

    history = client.get(f"/jobs/{job_id}/analyses").json()
    assert len(history) == 1


def test_analyze_ai_failure_returns_502(client, monkeypatch):
    def broken(*args, **kwargs):
        raise RuntimeError("AI is down")

    monkeypatch.setattr("app.routers.analysis.analyze_cv", broken)
    job_id = client.post("/jobs/", json=JOB).json()["id"]

    response = client.post(f"/jobs/{job_id}/analyze", json={"cv_text": "Python"})
    assert response.status_code == 502