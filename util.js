const API = "https://wandering-dream-51c5allgoai-api.rgvr8syq2x.workers.dev";

// 共通API
async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) throw await res.text();
  return res.json().catch(()=>null);
}

// ---- Apps ----

// 全アプリ取得
async function getApps() {
  return await api("/apps"); // 配列で返る
}

// 単体取得（一覧から探す）
async function getApp(id) {
  const apps = await getApps();
  return apps.find(a => a.id === id);
}

// 保存
async function saveApp(app) {
  return await api("/app", {
    method: "POST",
    body: JSON.stringify(app)
  });
}

// ---- Logs ----
async function logEvent(ev) {
  return await api("/log", {
    method: "POST",
    body: JSON.stringify(ev)
  });
}
async function deleteApp(id){
  return await api("/app?id="+id, { method:"DELETE" });
}
