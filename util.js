// === frontend util.js ===
const API = "https://wandering-dream-51c5allgoai-api.rgvr8syq2x.workers.dev";

async function saveApp(app){
  const r = await fetch(API + "/apps", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      files: app.files,
      meta:{
        title: app.name,
        description: app.description || ""
      }
    })
  });
  return await r.json();
}

async function getApps(){
  const r = await fetch(API + "/apps");
  return await r.json();
}

async function getApp(id){
  const r = await fetch(API + "/apps?id="+id);
  return await r.json();
}

async function deleteApp(id){
  const r = await fetch(API + "/apps?id="+id,{method:"DELETE"});
  return await r.json();
}
