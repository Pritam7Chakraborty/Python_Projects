const API_BASE = "/api";

const getToken = () => localStorage.getItem("token");

export async function login(email, password){
    const res = await fetch(`${API_BASE}/auth/login`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
    });
    if (!res.ok) throw new Error("Login failed. Check your credentials.");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    return data;
}

export async function register(email, password){
    const res = await fetch(`${API_BASE}/auth/register`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
    });
    if (!res.ok) throw new Error("Registration failed. Email might be in use.");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    return data;
}

export async function uploadHeadshot(file) {
    const form= new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/upload-headshot`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        },
        body: form,
    });
    if (!res.ok) {
        throw new Error("Failed to upload headshot");
    }
    return res.json();
}

export async function createJob({prompt, numThumbnails, headshotUrl}) {
    const res = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            prompt,
            numThumbnails,
            headshotUrl,
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to create job");
    }
    return res.json();
}

export async function subscribeToJob(jobId, {onThumbnailReady, onThumbnailFailed, onJobComplete, onError}) {
    const es = new EventSource(`${API_BASE}/jobs/${jobId}/stream`);

    es.addEventListener("thumbnail_ready",(event) => {
        onThumbnailReady(JSON.parse(event.data));
        });;

    es.addEventListener("thumbnail_failed",(event) => {
        onThumbnailFailed(JSON.parse(event.data));
        });;

    es.addEventListener("job_completed",(event) => {
        onJobComplete(JSON.parse(event.data));
        });;

    es.addEventListener("error",(event) => {
        onError(event);
        es.close();
        });;

    return es;
}

