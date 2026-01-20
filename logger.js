<script>
// ===== logger.js =====
function getLogs(){
  return JSON.parse(localStorage.getItem("logs") || "[]");
}
function saveLogs(logs){
  localStorage.setItem("logs", JSON.stringify(logs));
}
function logEvent(type, data={}){
  const logs = getLogs();
  logs.push({
    id: "evt_" + Math.random().toString(36).slice(2),
    type,
    data,
    time: Date.now()
  });
  saveLogs(logs);
}
</script>
