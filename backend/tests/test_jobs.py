JOB = {
    "company": "WSO2",
    "role": "Software Engineer Intern",
    "job_url": "https://example.com/careers",
    "description": "Backend internship working with Python and APIs",
    "status": "Saved",
}


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "JobTrack AI is running"}


def test_create_job(client):
    response = client.post("/jobs/", json=JOB)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["company"] == "WSO2"
    assert data["status"] == "Saved"


def test_list_jobs(client):
    client.post("/jobs/", json=JOB)
    client.post("/jobs/", json={**JOB, "company": "99x"})
    response = client.get("/jobs/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_job_not_found(client):
    response = client.get("/jobs/999")
    assert response.status_code == 404


def test_update_job_status(client):
    job_id = client.post("/jobs/", json=JOB).json()["id"]
    response = client.put(f"/jobs/{job_id}", json={**JOB, "status": "Interview"})
    assert response.status_code == 200
    assert response.json()["status"] == "Interview"


def test_delete_job(client):
    job_id = client.post("/jobs/", json=JOB).json()["id"]
    assert client.delete(f"/jobs/{job_id}").status_code == 200
    assert client.get(f"/jobs/{job_id}").status_code == 404


def test_create_job_requires_company(client):
    response = client.post("/jobs/", json={"role": "Intern"})
    assert response.status_code == 422