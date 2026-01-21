export default {
    async fetch(request, env) {
      const url = new URL(request.url);
  
      const cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };
      if (request.method === "OPTIONS") {
        return new Response("", { headers: cors });
      }
  
      // ---- LLM ----
      if (url.pathname === "/llm" && request.method === "POST") {
        const { spec, message } = await request.json();
  
        const systemPrompt = `
  あなたは Buddy という日本語のアプリ設計AIです。
  ユーザーと自然な会話をしながらアプリ設計specを完成させます。
  
  spec構造:
  {
   purpose: string,       // ← これは裏で自動生成（ユーザーには質問しない）
   target_users: string,
   features: string[],
   ui_style: string,
   constraints: string[],
   decided: boolean
  }
  
  ルール:
  - 必ず日本語で返答
  - まずユーザー発言を一文で要約（内部で purpose 更新に使う）
  - purpose はユーザー発言から自動更新する（会話では聞かない）
  - 未入力の項目を1つだけ自然な日本語で質問
  - 会話に「purpose」「spec」「JSON」という単語は出さない
  - spec が十分埋まったら decided=true にする
  
  出力形式(JSONのみ):
  
  {
   "reply": "ユーザーに見せる文章",
   "spec": 更新後のspec
  }
  
  現在spec:
  ${JSON.stringify(spec)}
  `;
  
        const result = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        });
  
        const parsed = JSON.parse(result.response);
        return Response.json(parsed, { headers: cors });
      }
  
      return new Response("Not Found", { status: 404, headers: cors });
    }
  };
  