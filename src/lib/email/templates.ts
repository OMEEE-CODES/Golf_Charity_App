// ─── Email HTML Templates ───────────────────────────────────────────────────

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a1628;
  color: #ffffff;
  margin: 0;
  padding: 0;
`

const cardStyle = `
  background: #111c30;
  border-radius: 16px;
  padding: 32px;
  margin: 24px auto;
  max-width: 560px;
  border: 1px solid rgba(255,255,255,0.08);
`

const btnStyle = `
  display: inline-block;
  background: #10b981;
  color: #ffffff;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  margin-top: 20px;
`

const mutedStyle = `
  color: #6b7280;
  font-size: 13px;
  margin-top: 24px;
  text-align: center;
`

function header(title: string) {
  return `
    <div style="text-align:center; padding: 32px 0 8px;">
      <div style="width:48px;height:48px;background:#10b981;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="color:white;font-weight:bold;font-size:20px;">G</span>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 4px;">${title}</h1>
      <p style="color:#6b7280;font-size:14px;margin:0;">GolfHero — Play. Win. Give.</p>
    </div>
  `
}

function footer() {
  return `
    <p style="${mutedStyle}">
      © ${new Date().getFullYear()} GolfHero. All rights reserved.<br/>
      You're receiving this because you're a GolfHero member.
    </p>
  `
}

// ─── 1. Welcome Email ────────────────────────────────────────────────────────
export function welcomeEmail(name: string) {
  return {
    subject: '🏌️ Welcome to GolfHero — Play. Win. Give.',
    html: `
      <body style="${baseStyle}">
        <div style="${cardStyle}">
          ${header('Welcome to GolfHero!')}
          <div style="margin-top:24px;">
            <p style="color:#d1d5db;font-size:16px;line-height:1.6;">
              Hi <strong>${name}</strong>, welcome aboard! 🎉
            </p>
            <p style="color:#9ca3af;font-size:15px;line-height:1.7;">
              You've joined a community of golfers who play for prizes and make a difference.
              Here's what you can do:
            </p>
            <ul style="color:#9ca3af;font-size:14px;line-height:2;padding-left:20px;">
              <li>🏆 Enter monthly prize draws</li>
              <li>⛳ Track your Stableford scores</li>
              <li>❤️ Support a charity of your choice</li>
              <li>💰 Win prizes by matching winning scores</li>
            </ul>
            <div style="text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe" style="${btnStyle}">
                Subscribe & Start Playing
              </a>
            </div>
          </div>
          ${footer()}
        </div>
      </body>
    `,
  }
}

// ─── 2. Subscription Confirmation ────────────────────────────────────────────
export function subscriptionEmail(name: string, plan: string, amount: number, nextDraw: string) {
  const planLabel = plan === 'yearly' ? 'Yearly' : 'Monthly'
  return {
    subject: '✅ Subscription Confirmed — You\'re in the draw!',
    html: `
      <body style="${baseStyle}">
        <div style="${cardStyle}">
          ${header('Subscription Confirmed!')}
          <div style="margin-top:24px;">
            <p style="color:#d1d5db;font-size:16px;">Hi <strong>${name}</strong>,</p>
            <p style="color:#9ca3af;font-size:15px;line-height:1.7;">
              Your <strong style="color:#10b981;">${planLabel} plan</strong> is now active.
              You're officially entered into the next monthly draw!
            </p>

            <div style="background:#0a1628;border-radius:12px;padding:20px;margin:20px 0;border:1px solid rgba(255,255,255,0.06);">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="color:#6b7280;font-size:14px;padding:6px 0;">Plan</td>
                  <td style="color:#ffffff;font-size:14px;text-align:right;font-weight:600;">${planLabel}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:14px;padding:6px 0;">Amount Paid</td>
                  <td style="color:#10b981;font-size:14px;text-align:right;font-weight:700;">₹${amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:14px;padding:6px 0;">Prize Pool Contribution</td>
                  <td style="color:#fbbf24;font-size:14px;text-align:right;">₹${plan === 'yearly' ? '7,200' : '600'}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:14px;padding:6px 0;">Charity Contribution</td>
                  <td style="color:#f43f5e;font-size:14px;text-align:right;">₹${plan === 'yearly' ? '1,200' : '100'}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:14px;padding:6px 0;">Next Draw</td>
                  <td style="color:#a78bfa;font-size:14px;text-align:right;">${nextDraw}</td>
                </tr>
              </table>
            </div>

            <p style="color:#9ca3af;font-size:14px;">
              Next step: Add your golf scores to increase your chances of winning!
            </p>
            <div style="text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scores" style="${btnStyle}">
                Add My Scores
              </a>
            </div>
          </div>
          ${footer()}
        </div>
      </body>
    `,
  }
}

// ─── 3. Draw Results (No Win) ─────────────────────────────────────────────────
export function drawResultsEmail(name: string, month: string, winningScores: number[], userScores: number[], matched: number) {
  const matchedScores = userScores.filter(s => winningScores.includes(s))

  return {
    subject: `🎲 ${month} Draw Results — ${matched >= 3 ? '🏆 You Won!' : 'Better luck next time!'}`,
    html: `
      <body style="${baseStyle}">
        <div style="${cardStyle}">
          ${header(`${month} Draw Results`)}
          <div style="margin-top:24px;">
            <p style="color:#d1d5db;font-size:16px;">Hi <strong>${name}</strong>,</p>

            ${matched >= 3 ? `
              <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
                <p style="color:#10b981;font-weight:700;font-size:18px;margin:0;">🏆 Congratulations! You won!</p>
                <p style="color:#6ee7b7;font-size:14px;margin:4px 0 0;">You matched ${matched} scores — prize payment coming soon.</p>
              </div>
            ` : `
              <p style="color:#9ca3af;font-size:15px;line-height:1.7;">
                The ${month} draw has been completed. You matched <strong>${matched}</strong> out of 5 winning scores this month.
              </p>
            `}

            <div style="margin:20px 0;">
              <p style="color:#6b7280;font-size:13px;margin-bottom:10px;">🎯 WINNING SCORES</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${winningScores.map(score => `
                  <span style="
                    width:36px;height:36px;
                    background:${matchedScores.includes(score) ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.2)'};
                    border:1px solid ${matchedScores.includes(score) ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.3)'};
                    border-radius:8px;
                    display:inline-flex;align-items:center;justify-content:center;
                    color:${matchedScores.includes(score) ? '#10b981' : '#a78bfa'};
                    font-weight:700;font-size:14px;
                  ">${score}</span>
                `).join('')}
              </div>
              ${matchedScores.length > 0 ? `<p style="color:#10b981;font-size:12px;margin-top:8px;">✅ Green = your matched scores</p>` : ''}
            </div>

            ${userScores.length > 0 ? `
              <div style="margin:20px 0;">
                <p style="color:#6b7280;font-size:13px;margin-bottom:10px;">⛳ YOUR SCORES THIS MONTH</p>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  ${userScores.map(score => `
                    <span style="
                      width:36px;height:36px;
                      background:${winningScores.includes(score) ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'};
                      border:1px solid rgba(255,255,255,0.1);
                      border-radius:8px;
                      display:inline-flex;align-items:center;justify-content:center;
                      color:${winningScores.includes(score) ? '#10b981' : '#9ca3af'};
                      font-weight:700;font-size:14px;
                    ">${score}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <p style="color:#9ca3af;font-size:14px;margin-top:16px;">
              Keep tracking your scores to improve your chances next month!
            </p>
            <div style="text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="${btnStyle}">
                View Dashboard
              </a>
            </div>
          </div>
          ${footer()}
        </div>
      </body>
    `,
  }
}

// ─── 4. Winner Notification ───────────────────────────────────────────────────
export function winnerEmail(name: string, tier: string, prize: number, month: string, notes?: string) {
  return {
    subject: `🏆 Prize Verified — ₹${prize.toLocaleString('en-IN')} is on its way!`,
    html: `
      <body style="${baseStyle}">
        <div style="${cardStyle}">
          ${header('🎉 Your Prize is Verified!')}
          <div style="margin-top:24px;">
            <p style="color:#d1d5db;font-size:16px;">Hi <strong>${name}</strong>,</p>
            <p style="color:#9ca3af;font-size:15px;line-height:1.7;">
              Great news! Your prize from the <strong>${month}</strong> draw has been verified
              and payment is being processed.
            </p>

            <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
              <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">YOUR PRIZE</p>
              <p style="color:#10b981;font-size:40px;font-weight:800;margin:0;">₹${prize.toLocaleString('en-IN')}</p>
              <p style="color:#6ee7b7;font-size:14px;margin:8px 0 0;">${tier} winner — ${month} draw</p>
            </div>

            ${notes ? `
              <div style="background:#0a1628;border-radius:10px;padding:14px;margin:16px 0;border-left:3px solid #10b981;">
                <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">PAYMENT NOTE</p>
                <p style="color:#d1d5db;font-size:14px;margin:0;">${notes}</p>
              </div>
            ` : ''}

            <p style="color:#9ca3af;font-size:14px;line-height:1.7;">
              Payment will be processed within 7 business days.
              You can track the status in your winnings dashboard.
            </p>
            <div style="text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" style="${btnStyle}">
                View My Winnings
              </a>
            </div>
          </div>
          ${footer()}
        </div>
      </body>
    `,
  }
}
