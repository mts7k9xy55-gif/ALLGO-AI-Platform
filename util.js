// ===== util.js =====
const API = "https://wandering-dream-51c5allgoai-api.rgvr8syq2x.workers.dev";

async function safeJson(r){
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { error:"NOT_JSON", raw:text }; }
}

// ---- apps ----
async function saveApp(app){
  const r = await fetch(API + "/apps", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
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

async function getApps(){
  const r = await fetch(API + "/apps");
  const data = await safeJson(r);

  // ★ ここが最重要：必ず「配列」を返す
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;        // D1 all()形式
  if (Array.isArray(data?.result)) return data.result;          // 変種対策
  return []; // 何が来ても落とさない
}

async function getApp(id){
  const r = await fetch(API + "/apps?id=" + encodeURIComponent(id));
  return await safeJson(r);
}

async function deleteApp(id){
  const r = await fetch(API + "/apps?id=" + encodeURIComponent(id), {
    method:"DELETE"
  });
  return await safeJson(r);
}

// ---- logging (後で拡張) ----
function logEvent(e){
  console.log("LOG:", e);
}
