export default {
    async fetch(request, env) {
      const url = new URL(request.url);
  
      // ---- CORS ----
      const cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };
      if (request.method === "OPTIONS") {
        return new Response("", { headers: cors });
      }
  
      // ---- Health ----
      if (url.pathname === "/health") {
        return new Response("ok", { headers: cors });
      }
  
      // ---- Save App ----
      if (url.pathname === "/app" && request.method === "POST") {
        const app = await request.json();
        await env.DB.prepare(
          "INSERT OR REPLACE INTO apps (id,name,files,created_at) VALUES (?,?,?,?)"
        ).bind(
          app.id,
          app.name,
          JSON.stringify(app.files || {}),
          app.createdAt || Date.now()
        ).run();
        return new Response("ok", { headers: cors });
      }
  
      // ---- Get Apps ----
      if (url.pathname === "/apps" && request.method === "GET") {
        const { results } = await env.DB
          .prepare("SELECT * FROM apps ORDER BY created_at DESC")
          .all();
        return Response.json(results, { headers: cors });
      }
  
      // ---- Buddy LLM ----
      if (url.pathname === "/llm" && request.method === "POST") {
        const { spec, message } = await request.json();
  
        const systemPrompt = `
  あなたは Buddy という日本語の設計AIです。
  ユーザーとの会話からアプリ設計specを完成させます。
  
  spec構造:
  {
   purpose: string,
   target_users: string,
   features: string[],
   ui_style: string,
   constraints: string[],
   decided: boolean
  }
  
  重要ルール:
  - 必ず日本語で返答
  - 出力は **有効なJSONのみ**
  - reply と spec の両方を必ず出す
  - specは「現在のspecを保持しつつ、変更部分だけ更新」する
  - 未変更の項目は絶対に消さない
  
  出力形式:
  {
   "reply": "ユーザーに表示する文章",
   "spec": { 更新後spec }
  }
  
  現在のspec:
  ${JSON.stringify(spec)}
  `;
  
        const result = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        });
  
        let data;
        try {
          data = JSON.parse(result.response);
        } catch {
          data = { reply: "すみません、もう一度お願いします。", spec: {} };
        }
  
        // ---- 安全マージ ----
        let updatedSpec = {
          ...spec,
          ...data.spec
        };
  
        // ---- 完成判定 ----
        if (
          updatedSpec.purpose &&
          updatedSpec.target_users &&
          updatedSpec.features &&
          updatedSpec.features.length >= 1
        ) {
          updatedSpec.decided = true;
        }
  
        return Response.json({
          reply: data.reply,
          spec: updatedSpec
        }, { headers: cors });
      }
  
      // ---- Fallback ----
      return new Response("Not Found", { status: 404, headers: cors });
    }
  };
  