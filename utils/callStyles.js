export const callGlobalStyles = `

/* ── Keyframes ── */
@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes meshFloat {
  0%, 100% { transform: rotate(0deg) scale(1); }
  33% { transform: rotate(2deg) scale(1.04); }
  66% { transform: rotate(-1.5deg) scale(0.97); }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px rgba(131,53,137,0.5); }
  50% { opacity: 0.4; transform: scale(1.5); box-shadow: 0 0 16px rgba(131,53,137,0.7); }
}
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes glowOrb1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-25px, 20px) scale(1.15); }
}
@keyframes glowOrb2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -30px) scale(1.2); }
}
@keyframes glowOrb3 {
  0%, 100% { transform: translate(0, 0) scale(0.85); }
  50% { transform: translate(-12px, 12px) scale(1.08); }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes inputFocusGlow {
  0%, 100% { box-shadow: 0 0 0 3px rgba(131,53,137,0.08); }
  50% { box-shadow: 0 0 0 5px rgba(131,53,137,0.15); }
}
@keyframes btnShine {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* ── Base ── */
  .cp-root * { box-sizing: border-box; }
  .cp-root {
    font-family: 'DM Sans', sans-serif;
    background: linear-gradient(165deg, #FAF5FB 0%, #fff 35%, #F3E8F5 70%, #FAF5FB 100%);
    color: #1a0a1e;
    min-height: 100vh;
    position: relative;
    overflow: hidden;
  }

  /* Animated gradient mesh background */
  .cp-root::before {
    content: '';
    position: fixed;
    inset: -50%;
    background:
      radial-gradient(ellipse 55% 45% at 25% 30%, rgba(131,53,137,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 45% 55% at 75% 25%, rgba(168,85,181,0.09) 0%, transparent 50%),
      radial-gradient(ellipse 40% 35% at 50% 75%, rgba(245,166,35,0.06) 0%, transparent 45%),
      radial-gradient(ellipse 30% 30% at 80% 70%, rgba(34,197,94,0.05) 0%, transparent 45%);
    animation: meshFloat 14s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  .cp-hero {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    z-index: 1;
  }

  .cp-left {
    padding: 48px 40px 60px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
  }

  /* ── Floating glow orbs ── */
  .cp-root::after {
    content: '';
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(131,53,137,0.15), rgba(168,85,181,0.08), transparent 65%);
    top: -80px;
    right: -100px;
    filter: blur(60px);
    animation: glowOrb1 7s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Eyebrow badge with shimmer ── */
  .cp-eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #833589;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
    display: inline-block;
    padding: 6px 0;
    animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .cp-eyebrow::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #833589, #A855B5, transparent);
    border-radius: 2px;
  }

  /* ── Heading with gradient accent ── */
  .cp-heading {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 800;
    line-height: 1.05;
    color: #1a0a1e;
    margin: 0 0 8px;
    animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
  }
  .cp-heading span {
    background: linear-gradient(135deg, #833589, #A855B5, #C084CF, #833589);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 5s ease-in-out infinite;
    position: relative;
  }

  /* ── Subheading ── */
  .cp-subheading {
    font-size: 15px;
    color: #6B4D72;
    margin-bottom: 28px;
    line-height: 1.6;
    animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  }

  /* ── Counter badge — glassmorphism ── */
  .cp-counter {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(240, 224, 244, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1.5px solid rgba(217, 179, 224, 0.5);
    border-radius: 100px;
    padding: 10px 20px;
    font-size: 13px;
    color: #6B4D72;
    margin-bottom: 32px;
    width: fit-content;
    animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .cp-counter:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(131,53,137,0.1);
  }
  .cp-counter::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(131,53,137,0.08), transparent);
    animation: shimmer 4s ease-in-out infinite 1.5s;
  }
  .cp-counter strong { color: #833589; font-weight: 800; }
  .cp-counter-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #833589;
    animation: pulse 2s infinite;
  }

  /* ── Form — glassmorphism card ── */
  .cp-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1.5px solid rgba(229, 201, 234, 0.4);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 8px 32px rgba(131,53,137,0.06), 0 1px 4px rgba(131,53,137,0.04);
    animation: fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
    transition: box-shadow 0.3s;
  }
  .cp-form:hover {
    box-shadow: 0 12px 40px rgba(131,53,137,0.1), 0 2px 8px rgba(131,53,137,0.06);
  }

  .cp-field { display: flex; flex-direction: column; gap: 6px; }
  .cp-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    color: #833589;
    text-transform: uppercase;
  }

  /* ── Inputs with focus animation ── */
  .cp-input, .cp-select {
    background: rgba(255, 255, 255, 0.8);
    border: 1.5px solid #E5C9EA;
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 14px;
    color: #1a0a1e;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s, transform 0.15s;
    width: 100%;
    appearance: none;
  }
  .cp-input:focus, .cp-select:focus {
    border-color: #833589;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(131,53,137,0.1), 0 4px 12px rgba(131,53,137,0.06);
    transform: translateY(-1px);
  }
  .cp-input:hover, .cp-select:hover {
    border-color: #B07AB8;
  }
  .cp-input::placeholder { color: #C9A0D0; }
  .cp-select option { background: #fff; color: #1a0a1e; }
  .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .cp-marks-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

  /* ── Marks divider with accent ── */
  .cp-marks-divider {
    border-top: 1.5px solid rgba(229,201,234,0.5);
    padding-top: 18px;
    margin-top: 4px;
  }
  .cp-marks-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #833589;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cp-marks-title::before {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #833589;
  }

  /* ── Error ── */
  .cp-error {
    background: rgba(254, 242, 242, 0.8);
    border: 1px solid #FECACA;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #DC2626;
    animation: fadeSlideUp 0.3s ease;
  }

  /* ── CTA Button with shine effect ── */
  .cp-btn {
    background: linear-gradient(135deg, #833589, #9B45A3);
    color: #fff;
    border: none;
    border-radius: 14px;
    padding: 16px 24px;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 6px;
    box-shadow: 0 4px 16px rgba(131,53,137,0.25), 0 1px 3px rgba(131,53,137,0.15);
    position: relative;
    overflow: hidden;
  }
  .cp-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: btnShine 3s ease-in-out infinite 2s;
  }
  .cp-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(131,53,137,0.35), 0 2px 6px rgba(131,53,137,0.2);
  }
  .cp-btn:active { transform: translateY(-1px); }
  .cp-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .cp-btn:disabled::after { display: none; }
  .cp-btn-secondary {
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(10px);
    border: 1.5px solid #E5C9EA;
    color: #833589;
    box-shadow: none;
  }
  .cp-btn-secondary::after { display: none; }
  .cp-btn-secondary:hover { border-color: #833589; background: rgba(250,245,251,0.9); box-shadow: 0 4px 12px rgba(131,53,137,0.08); }

  /* ── Results ── */
  .cp-results { padding: 0; }
  .cp-results-header { margin-bottom: 20px; }
  .cp-congrats {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #1a0a1e;
    line-height: 1.3;
    margin-bottom: 4px;
  }
  .cp-congrats-sub { font-size: 14px; color: #6B4D72; }

  /* ── College Cards — glassmorphism ── */
  .cp-college-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  @media (max-width: 500px) { .cp-college-grid { grid-template-columns: 1fr; } }

  .cp-dark-card {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1.5px solid rgba(229, 201, 234, 0.45);
    border-radius: 18px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
    animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
    position: relative;
    overflow: hidden;
  }
  .cp-dark-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #833589, #A855B5, #C084CF);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .cp-dark-card:hover {
    border-color: #B07AB8;
    transform: translateY(-4px);
    box-shadow: 0 8px 28px rgba(131,53,137,0.12), 0 2px 8px rgba(131,53,137,0.06);
  }
  .cp-dark-card:hover::before { opacity: 1; }

  .cp-dark-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #1a0a1e;
    margin: 0;
    line-height: 1.3;
  }
  .cp-dark-card-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cp-dark-card-icon {
    font-size: 14px;
    opacity: 0.6;
    flex-shrink: 0;
  }
  .cp-dark-card-label {
    font-size: 13px;
    color: #6B4D72;
    flex-shrink: 0;
  }
  .cp-dark-card-value {
    font-size: 13px;
    font-weight: 700;
    color: #1a0a1e;
    margin-left: auto;
    text-align: right;
  }
  .cp-dark-card-date {
    font-size: 13px;
    font-weight: 700;
    margin-left: auto;
    text-align: right;
  }
  .cp-dark-card-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #E5C9EA, transparent);
  }
  .cp-dark-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cp-dark-card-status {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 4px 12px;
    border-radius: 8px;
    text-transform: uppercase;
  }
  .cp-dark-card-link {
    font-size: 13px;
    font-weight: 600;
    color: #833589;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: opacity 0.2s, transform 0.2s;
  }
  .cp-dark-card-link:hover {
    opacity: 0.7;
    transform: translateX(2px);
  }

  /* ── No results ── */
  .cp-no-result { text-align: center; padding: 32px 16px; }
  .cp-no-result img { width: 80px; margin-bottom: 16px; }
  .cp-no-result h2 {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 700;
    color: #1a0a1e; margin-bottom: 8px;
  }
  .cp-no-result p { font-size: 14px; color: #6B4D72; line-height: 1.6; }

  /* ── Spinner ── */
  .cp-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* ── Results full width ── */
  .cp-hero-results { grid-template-columns: 1fr !important; }
  .cp-hero-results .cp-left { max-width: 900px; margin: 0 auto; width: 100%; }
  .cp-hero-results .cp-college-grid { grid-template-columns: 1fr 1fr; }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .cp-left { padding: 24px 16px 40px; }
    .cp-heading { font-size: clamp(28px, 7vw, 40px); }
    .cp-form { padding: 20px; border-radius: 16px; }
    .cp-row { grid-template-columns: 1fr; }
    .cp-marks-row { grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .cp-hero-results .cp-college-grid { grid-template-columns: 1fr; }
    .cp-college-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 480px) {
    .cp-left { padding: 16px 12px 32px; }
    .cp-heading { font-size: 28px; }
    .cp-form { padding: 16px; }
    .cp-marks-row { grid-template-columns: 1fr; }
    .cp-counter { font-size: 12px; padding: 8px 14px; }
  }
`;
