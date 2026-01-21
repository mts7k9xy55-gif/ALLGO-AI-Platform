// util.js
export const API = "https://wandering-dream-51c5allgoai-api.rgvr8syq2x.workers.dev";

async function safeJson(r){
  const text = await r.text();
  try { return JSON.parse(text); } 
  catch { return { error:"NOT_JSON", raw:text }; }
}

// ---- LLM ----
export async function createFromPrompt(message){
  const r = await fetch(API + "/llm", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ message })
  });
  return await safeJson(r);
}

// ---- apps ----
export async function saveApp(app){
  const r = await fetch(API + "/apps", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      files: app.files,
      meta: {
        title: app.name,
        description: app.description || ""
      }
    })
  });
  return await safeJson(r);
}

export async function getApps(){
  const r = await fetch(API + "/apps");
  const data = await safeJson(r);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function getApp(id){
  const r = await fetch(API + "/apps?id=" + encodeURIComponent(id));
  return await safeJson(r);
}

export async function deleteApp(id){
  const r = await fetch(API + "/apps?id=" + encodeURIComponent(id), {
    method:"DELETE"
  });
  return await safeJson(r);
}
