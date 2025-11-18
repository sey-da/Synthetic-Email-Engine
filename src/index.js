function hashStringToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function containsAny(text, list) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return list.some(w => lower.includes(w));
}

// Smart delay, now also looks at keywords in the message
function getSmartDelayProfile(email, message) {
  const h = hashStringToNumber(email);
  const baseBucket = h % 4;

  // If message looks urgent, force earlier windows
  const isUrgent = containsAny(message, ["urgent", "asap", "deadline", "today"]);

  if (isUrgent) {
    return {
      window: "next 1 to 2 hours",
      description: "Message looks time sensitive, recommended to send as soon as possible."
    };
  }

  if (baseBucket === 0) {
    return {
      window: "07:00 to 09:00",
      description: "Morning reader, tends to respond early in the day."
    };
  }
  if (baseBucket === 1) {
    return {
      window: "12:00 to 14:00",
      description: "Midday responder, usually checks email around lunch time."
    };
  }
  if (baseBucket === 2) {
    return {
      window: "18:00 to 21:00",
      description: "Evening reader, more likely to reply after working hours."
    };
  }
  return {
    window: "Monday and Wednesday mornings",
    description: "Patterns suggest better engagement at the start of the week."
  };
}

// Predictive reply, now depends on message length and urgency
function getPredictiveReply(email, message) {
  const base = hashStringToNumber(email + "|" + message);
  const words = wordCount(message);

  let probability = ((base % 41) + 40) / 100; // 0.40 0.80 arası

  if (containsAny(message, ["deadline", "project", "thesis", "assignment"])) {
    probability += 0.1;
  }
  if (containsAny(message, ["reminder", "follow up", "checking"])) {
    probability += 0.05;
  }
  if (containsAny(message, ["spam", "unsubscribe"])) {
    probability -= 0.15;
  }

  if (words < 4) probability -= 0.05;
  else if (words > 60) probability -= 0.03;

  probability = Math.max(0.15, Math.min(0.95, probability));

  // Estimated response time
  let expectedHours = (base % 24) + 2;
  if (containsAny(message, ["urgent", "asap", "today"])) {
    expectedHours = Math.max(1, expectedHours - 8);
  }

  let label = "medium";
  if (probability >= 0.8) label = "high";
  else if (probability <= 0.45) label = "low";

  return {
    probability,
    expectedHours,
    label
  };
}

// Relationship score, depends on domain and message richness
function getRelationshipScore(email, message) {
  const h = hashStringToNumber(email);
  const domain = email.split("@")[1] || "";
  const words = wordCount(message);

  let score = (h % 41) + 50; // 50 90 arası

  // Same school or company
  if (containsAny(domain, ["novasbe", "fe.up", "porto", "nova"])) {
    score += 5;
  }

  // Longer, more thoughtful messages
  if (words > 30) score += 5;
  if (words > 80) score += 5;

  // Very short messages
  if (words < 4) score -= 10;

  // Emotional words
  if (containsAny(message, ["thank you", "appreciate", "grateful"])) {
    score += 5;
  }
  if (containsAny(message, ["angry", "upset"])) {
    score -= 5;
  }

  score = Math.max(30, Math.min(100, score));

  let status = "stable";
  if (score >= 85) status = "very strong";
  else if (score <= 60) status = "needs attention";

  return {
    score,
    status
  };
}

// Personality mirroring as before
function getPersonalityProfile(email) {
  const h = hashStringToNumber(email);
  const toneBucket = h % 3;
  const lengthBucket = (h >> 3) % 3;

  const tone =
    toneBucket === 0
      ? "formal"
      : toneBucket === 1
      ? "neutral"
      : "informal";

  const sentenceLength =
    lengthBucket === 0
      ? "short and concise"
      : lengthBucket === 1
      ? "medium length"
      : "long and detailed";

  const emojiUsage = h % 2 === 0 ? "low" : "moderate";

  return {
    tone,
    sentenceLength,
    emojiUsage
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // JSON API endpoint
    if (url.pathname === "/insights") {
      const email = url.searchParams.get("email");
      const message = url.searchParams.get("message") || "";
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Missing email query parameter" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const smartDelay = getSmartDelayProfile(email, message);
      const relationship = getRelationshipScore(email, message);
      const personality = getPersonalityProfile(email);
      const predictive = getPredictiveReply(email, message);

      const summary = {
        email,
        smartDelay,
        predictive,
        relationship,
        personality,
        note:
          "All insights are synthetic and generated for demonstration purposes only."
      };

      return new Response(JSON.stringify(summary, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf8" }
      });
    }

    // Home page
    if (url.pathname === "/") {
      return new Response(
        `
        <html>
          <head>
            <meta charset="utf8" />
            <title>S.S.Y Cloud Email Worker</title>
          </head>

          <body style="font-family: system-ui; margin:0; background:#0f172a; color:#e5e7eb;">
            <div style="max-width: 900px; margin: 0 auto; padding: 32px 16px 64px 16px;">

              <!-- Hero -->
              <section style="display:flex; flex-wrap:wrap; gap:24px; align-items:center; margin-bottom:32px;">
                <div style="flex:1 1 260px;">
                  <h1 style="font-size:32px; margin-bottom:8px;">S.S.Y Cloud Email Worker</h1>
                  <p style="font-size:15px; color:#cbd5f5;">
                    A serverless email intelligence prototype designed for busy students, analysts and project teams.
                    It prepares your email payload and simulates advanced analytics such as reply probability, optimal
                    send time and relationship strength.
                  </p>
                  <p style="margin-top:12px; font-size:13px; color:#9ca3af;">
                    Running on Cloudflare Workers, front end free, fully API friendly.
                  </p>
                </div>
                <div style="flex:1 1 260px;">
                  <div style="background:#020617; border-radius:12px; padding:16px 18px; border:1px solid #1f2937;">
                    <p style="font-size:12px; color:#9ca3af; margin-bottom:6px;">Live simulation preview</p>
                    <p style="font-size:13px; white-space:pre-line;">
Recipient: founder@startup.com
Message: quick follow up on the data room

• predicted reply: 84 percent
• expected response: ~3 hours
• relationship score: 88, very strong
• send window: 18:00 to 21:00
                    </p>
                  </div>
                </div>
              </section>

              <!-- Features -->
              <section style="display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:16px; margin-bottom:32px;">
                <div style="background:#020617; border-radius:10px; padding:14px 16px; border:1px solid #1f2937;">
                  <h3 style="margin:0 0 4px 0; font-size:15px;">Smart delay sending</h3>
                  <p style="margin:0; font-size:13px; color:#9ca3af;">
                    Learns when a recipient usually reacts and recommends a send window that fits their routine.
                  </p>
                </div>
                <div style="background:#020617; border-radius:10px; padding:14px 16px; border:1px solid #1f2937;">
                  <h3 style="margin:0 0 4px 0; font-size:15px;">Predictive reply engine</h3>
                  <p style="margin:0; font-size:13px; color:#9ca3af;">
                    Estimates reply probability and response time using message structure and semantic clues.
                  </p>
                </div>
                <div style="background:#020617; border-radius:10px; padding:14px 16px; border:1px solid #1f2937;">
                  <h3 style="margin:0 0 4px 0; font-size:15px;">Relationship scoring</h3>
                  <p style="margin:0; font-size:13px; color:#9ca3af;">
                    Approximates the long term strength of a connection using domain affinity and message richness.
                  </p>
                </div>
                <div style="background:#020617; border-radius:10px; padding:14px 16px; border:1px solid #1f2937;">
                  <h3 style="margin:0 0 4px 0; font-size:15px;">Personality mirroring</h3>
                  <p style="margin:0; font-size:13px; color:#9ca3af;">
                    Suggests tone, sentence length and emoji intensity that match the recipient style.
                  </p>
                </div>
              </section>

              <!-- Form -->
              <section style="background:#020617; border-radius:12px; padding:18px 18px 20px 18px; border:1px solid #1f2937;">
                <h2 style="font-size:18px; margin:0 0 10px 0;">Try it with your own email</h2>
                <p style="margin:0 0 10px 0; font-size:13px; color:#9ca3af;">
                  Enter a recipient address and a message. The worker will prepare a payload plus simulated analytics.
                </p>

                <form method="POST" action="/send">
                  <label style="font-size:13px;">
                    Recipient email
                    <br />
                    <input 
                      name="to" 
                      type="email" 
                      required 
                      placeholder="example@novasbe.pt" 
                      style="width: 100%; padding: 10px; margin: 6px 0 10px 0; border-radius:8px; border:1px solid #374151; background:#020617; color:#e5e7eb;"
                    />
                  </label>

                  <label style="font-size:13px;">
                    Message
                    <br />
                    <textarea 
                      name="message" 
                      rows="6" 
                      required 
                      placeholder="Short project update, follow up or even a personal note." 
                      style="width: 100%; padding: 10px; margin: 6px 0 14px 0; border-radius:8px; border:1px solid #374151; background:#020617; color:#e5e7eb;"
                    ></textarea>
                  </label>

                  <button 
                    type="submit" 
                    style="padding: 10px 20px; border: none; background: #38bdf8; color: #020617; border-radius: 999px; cursor: pointer; font-weight:600;"
                  >
                    Generate preview
                  </button>
                </form>

                <p style="margin-top:10px; font-size:12px; color:#6b7280;">
                  All analytics are synthetic and meant for experimentation and academic style projects.
                </p>
              </section>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf8" } }
      );
    }

    // Handle submit
    if (url.pathname === "/send" && request.method === "POST") {
      const formData = await request.formData();
      const to = formData.get("to");
      const message = formData.get("message") || "";

      const smartDelay = getSmartDelayProfile(to, message);
      const predictive = getPredictiveReply(to, message);
      const relationship = getRelationshipScore(to, message);
      const personality = getPersonalityProfile(to);

      const text = `
S.S.Y Cloud Email Worker, Email Payload Preview

Recipient: ${to}

Message:
${message}

Synthetic intelligence insights
Smart delay window: ${smartDelay.window}
Smart delay description: ${smartDelay.description}

Predicted reply probability: ${(predictive.probability * 100).toFixed(1)} percent
Predicted response time: about ${predictive.expectedHours} hour(s)
Reply likelihood category: ${predictive.label}

Relationship score: ${relationship.score} out of 100
Relationship status: ${relationship.status}

Personality mirroring profile
Preferred tone: ${personality.tone}
Preferred sentence style: ${personality.sentenceLength}
Estimated emoji tolerance: ${personality.emojiUsage}

All scores are generated deterministically for demonstration and research, 
they do not use real behavioral data.
      `;

      return new Response(
        `
        <html>
          <head>
            <meta charset="utf8" />
            <title>S.S.Y Email Preview</title>
          </head>
          <body style="font-family: system-ui; background:#0f172a; color:#e5e7eb; margin:0;">
            <div style="max-width: 900px; margin: 0 auto; padding: 32px 16px 64px 16px;">
              <a href="/" style="color:#38bdf8; text-decoration:none; font-size:13px;">← Back to simulation</a>
              <h1 style="margin-top:12px; font-size:24px;">Email payload ready</h1>
              <p style="font-size:13px; color:#9ca3af;">
                Below is the composed email payload and the generated analytics bundle.
              </p>

              <pre style="background:#020617; padding:16px; border-radius:12px; white-space:pre-wrap; border:1px solid #1f2937; font-size:13px;">
${text}
              </pre>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf8" } }
      );
    }

    return new Response("Not found", { status: 404 });
  },
};