export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Home page - email form
    if (url.pathname === "/") {
      return new Response(
        `
<!doctype html>
<html>
  <head>
    <meta charset="utf8" />
    <title>SSY Synthetic Email Engine</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background: linear-gradient(135deg, #ff4b8b, #ff6f61);
        color: #1a1a1a;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .shell {
        width: 100%;
        max-width: 900px;
        padding: 32px 16px;
      }
      .card {
        background: #ffffff;
        border-radius: 18px;
        padding: 28px 28px 24px;
        box-shadow: 0 18px 40px rgba(0,0,0,0.18);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
        letter-spacing: 0.02em;
      }
      .tagline {
        margin: 0 0 20px;
        color: #444;
        font-size: 14px;
      }
      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #222;
      }
      input, textarea {
        width: 100%;
        border-radius: 10px;
        border: 1px solid #e5e5e5;
        padding: 10px 12px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      input:focus, textarea:focus {
        border-color: #ff4b8b;
        box-shadow: 0 0 0 2px rgba(255,75,139,0.2);
      }
      textarea {
        resize: vertical;
        min-height: 120px;
      }
      .row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      .col {
        flex: 1 1 260px;
      }
      .button-row {
        margin-top: 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      button {
        border: none;
        border-radius: 999px;
        padding: 10px 22px;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        background: linear-gradient(135deg, #ff4b8b, #d7263d);
        color: #ffffff;
        box-shadow: 0 10px 25px rgba(215,38,61,0.35);
        transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
      }
      button:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(215,38,61,0.4);
        opacity: 0.96;
      }
      button:active {
        transform: translateY(0);
        box-shadow: 0 8px 18px rgba(215,38,61,0.35);
      }
      .microcopy {
        font-size: 11px;
        color: #777;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 999px;
        padding: 4px 10px;
        background: rgba(255,75,139,0.07);
        color: #c2185b;
        font-size: 11px;
        font-weight: 600;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #ff4b8b;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="pill">
          <span class="dot"></span>
          SSY Synthetic Email Engine
        </div>
        <h1>Compose once, let the engine analyse for you</h1>
        <p class="tagline">
          Write your email as you normally would.  
          The engine will prepare a gentle, human style briefing about how this message might land with the recipient.
        </p>

        <form method="POST" action="/send">
          <div class="row">
            <div class="col">
              <label for="to">Recipient email</label>
              <input id="to" name="to" type="email" required placeholder="ssy@engineteam.com" />
            </div>
            <div class="col">
              <label for="subject">Subject line</label>
              <input id="subject" name="subject" type="text" placeholder="Quick follow up on our call" />
            </div>
          </div>

          <div style="margin-top:16px;">
            <label for="message">Your message</label>
            <textarea id="message" name="message" required placeholder="Write as if you were really sending this email..."></textarea>
          </div>

          <div class="button-row">
            <button type="submit">Generate personal briefing</button>
            <div class="microcopy">
              No real data is stored or tracked.  
              All insights are fully synthetic and created only for you on this page.
            </div>
          </div>
        </form>
      </div>
    </div>
  </body>
</html>
        `,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf8" } }
      );
    }

    // Handle POST /send
    if (url.pathname === "/send" && request.method === "POST") {
      const formData = await request.formData();
      const to = (formData.get("to") || "").toString();
      const subject = (formData.get("subject") || "").toString();
      const message = (formData.get("message") || "").toString();

      // Simple deterministic "analytics" based on text length
      const base = (to.length + subject.length + message.length) || 1;
      const replyProb = 60 + (base % 35);           // 60 - 94
      const responseHours = 2 + (base % 48);        // 2 - 49
      const relationshipScore = 40 + (base % 55);   // 40 - 94

      let relationshipLabel = "warming up";
      if (relationshipScore >= 85) relationshipLabel = "very strong";
      else if (relationshipScore >= 70) relationshipLabel = "promising";
      else if (relationshipScore < 55) relationshipLabel = "needs a little care";

      const sendWindowStart = 8 + (base % 6) * 2;   // 8,10,12,14,16,18,20
      const sendWindowEnd = sendWindowStart + 3;

      const storyIntro = `
Hi, this is your personal synthetic briefing for the email you just wrote. 
It is not trying to judge you. 
It simply turns your text into a calm, data flavored reflection that helps you decide what to do next.
`.trim();

      const storyReply = `
Based on the tone and length of your message the engine estimates a reply probability of about ${replyProb} percent.
This means a reply feels ${replyProb >= 80 ? "quite likely" : "possible but not guaranteed"} as long as the email is seen at a good moment.
`.trim();

      const storyTiming = `
If this were a real productivity assistant it would gently suggest sending this email between about ${String(sendWindowStart).padStart(2,"0")}:00 and ${String(sendWindowEnd).padStart(2,"0")}:00 in the recipient time zone. 
This window is where similar messages usually feel calm and easy to answer, not rushed.
`.trim();

      const storyRelationship = `
Looking only at the structure of this email the relationship score comes out as ${relationshipScore} out of 100, which sits in the "${relationshipLabel}" zone. 
In practical words this means the email reads ${relationshipLabel === "very strong" ? "warm, clear and confident" : relationshipLabel === "promising" ? "respectful and open to further conversation" : "a little distant, so adding one more friendly line might help"}.
`.trim();

      const storySummary = `
None of these numbers use real history, tracking or profiling.
They are fully synthetic so you can safely experiment, change the text and see how the briefing changes for you.
`.trim();

      return new Response(
        `
<!doctype html>
<html>
  <head>
    <meta charset="utf8" />
    <title>SSY Synthetic Email Engine - Briefing</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background: linear-gradient(135deg, #ff4b8b, #ff6f61);
        color: #1a1a1a;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .shell {
        width: 100%;
        max-width: 980px;
        padding: 32px 16px;
      }
      .card {
        background: #ffffff;
        border-radius: 20px;
        padding: 28px 30px 26px;
        box-shadow: 0 20px 45px rgba(0,0,0,0.2);
      }
      h1 {
        margin: 0 0 6px;
        font-size: 26px;
      }
      h2 {
        font-size: 16px;
        margin: 20px 0 6px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 999px;
        padding: 4px 10px;
        background: rgba(255,75,139,0.07);
        color: #c2185b;
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .dot { width: 6px; height: 6px; border-radius: 999px; background: #ff4b8b; }
      .meta {
        font-size: 13px;
        color: #444;
        margin-bottom: 10px;
      }
      .meta span.label {
        font-weight: 600;
        color: #111;
      }
      .email-preview {
        margin-top: 14px;
        background: #fff4f7;
        border-radius: 14px;
        padding: 14px 16px;
        font-size: 13px;
        border: 1px solid rgba(255,75,139,0.3);
      }
      .email-preview strong {
        color: #b0003a;
      }
      p {
        font-size: 14px;
        line-height: 1.55;
        margin: 8px 0;
      }
      .grid {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.1fr);
        gap: 20px;
        margin-top: 18px;
      }
      @media (max-width: 800px) {
        .grid {
          grid-template-columns: minmax(0,1fr);
        }
      }
      .metrics {
        background: #fff9fb;
        border-radius: 14px;
        padding: 14px 16px;
        border: 1px dashed rgba(255,75,139,0.35);
        font-size: 13px;
      }
      .metric-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .metric-label {
        color: #555;
      }
      .metric-value {
        font-weight: 600;
        color: #b0003a;
      }
      .microcopy {
        font-size: 11px;
        color: #777;
        margin-top: 10px;
      }
      .actions {
        margin-top: 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      a.button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 9px 20px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        background: linear-gradient(135deg, #ff4b8b, #d7263d);
        color: #ffffff;
        box-shadow: 0 10px 25px rgba(215,38,61,0.35);
      }
      a.button:hover {
        opacity: 0.96;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="pill">
          <span class="dot"></span>
          Personal synthetic briefing ready
        </div>
        <h1>Your email, explained in calm human language</h1>

        <div class="email-preview">
          <strong>Recipient:</strong> ${to || "not specified yet"}<br/>
          ${subject ? `<strong>Subject:</strong> ${subject}<br/>` : ""}
          <strong>Message:</strong><br/>
          <div style="white-space: pre-wrap; margin-top:4px;">${escapeHtml(message)}</div>
        </div>

        <div class="grid">
          <div>
            <h2>How this email might feel to the recipient</h2>
            <p>${storyIntro}</p>
            <p>${storyReply}</p>
            <p>${storyTiming}</p>
            <p>${storyRelationship}</p>
            <p>${storySummary}</p>
          </div>

          <div class="metrics">
            <div class="metric-row">
              <span class="metric-label">Reply likelihood</span>
              <span class="metric-value">${replyProb} percent</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Expected response time</span>
              <span class="metric-value">around ${responseHours} hour(s)</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Relationship score</span>
              <span class="metric-value">${relationshipScore} / 100</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Suggested send window</span>
              <span class="metric-value">${String(sendWindowStart).padStart(2,"0")}:00 - ${String(sendWindowEnd).padStart(2,"0")}:00</span>
            </div>

            <div class="microcopy">
              These values are created from the text you typed only.  
              There is no tracking, profiling or hidden data collection.
            </div>
          </div>
        </div>

        <div class="actions">
          <a href="/" class="button">Write a new email</a>
          <div class="microcopy">
            Tip, change one or two sentences, then generate a new briefing  
            and notice how the tone and scores move with you.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
        `,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf8" } }
      );
    }

    // Fallback
    return new Response("Not found", { status: 404 });
  },
};

// Simple HTML escape to avoid breaking the page
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}