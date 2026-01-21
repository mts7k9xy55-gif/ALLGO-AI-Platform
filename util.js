export const API = "https://wandering-dream-51c5allgoai-api.rgvr8syq2x.workers.dev";

async function safeJson(r){
  const t = await r.text();
  try { return JSON.parse(t); }
  catch { return { error:"NOT_JSON", raw:t }; }
}

export async function createFromPrompt(message){
  const r = await fetch(API + "/llm", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ message })
  });
  return await safeJson(r);
}

export async function getApps(){
  const r = await fetch(API + "/apps");
  const data = await safeJson(r);
  return Array.isArray(data) ? data : [];
}

export async function getApp(id){
  const r = await fetch(API + "/apps?id=" + encodeURIComponent(id));
  return await safeJson(r);
}

export async function deleteApp(id){
  const r = await fetch(API + "/apps?id=" + encodeURIComponent(id), { method:"DELETE" });
  return await safeJson(r);
}
