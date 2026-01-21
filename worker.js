export default {
    async fetch(request, env) {
      const url = new URL(request.url);
  
      // --- CORS Headers ---
      const cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };
  
      // --- Preflight ---
      if (request.method === "OPTIONS") {
        return new Response("", { headers: cors });
      }
  
      // ---- /llm ----
      if (url.pathname === "/llm" && request.method === "POST") {
        const { spec, message } = await request.json();
  
        const systemPrompt = `
  あなたは Buddy という日本語のアプリ設計AIです。
  ユーザーと自然な会話をしながらアプリ設計を完成させます。
  
  設計構造:
  {
   purpose: string,
   target_users: string,
   features: string[],
   ui_style: string,
   constraints: string[],
   decided: boolean
  }
  
  ルール:
  - 必ず日本語で返答
  - ユーザー発言を一文で要約して内部目的を更新
  - 未入力項目を1つだけ質問
  - 「purpose」「spec」「JSON」という単語は出さない
  - 設計が十分埋まったら decided=true にする
  
  出力:
  {
   "reply": "ユーザーに見せる文章",
   "spec": 更新後の設計
  }
  
  現在の設計:
  ${JSON.stringify(spec)}
  `;
  
        const result = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        });
  
        // --- Safe parse ---
        const raw = result.response;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  
        return new Response(JSON.stringify(parsed), {
          headers: {
            ...cors,
            "Content-Type": "application/json"
          }
        });
      }
  
      // ---- Not Found ----
      return new Response("Not Found", {
        status: 404,
        headers: cors
      });
    }
  }
  