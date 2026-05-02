export const callGlobalStyles = `

@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
  .cp-root * { box-sizing: border-box; }
  .cp-root {
    font-family: 'DM Sans', sans-serif;
    background: #FAF5FB;
    color: #1a0a1e;
    min-height: 100vh;
  }
  .cp-hero {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
  @media (max-width: 768px) {
    .cp-hero { grid-template-columns: 1fr; }
    .cp-right { display: none; }
  }
  .cp-left {
    padding: 48px 40px 60px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
  }
  .cp-right {
    background: #F3E8F5;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    border-left: 1px solid #E5C9EA;
  }
  .cp-logo { width: 120px; margin-bottom: 32px; }
  .cp-eyebrow {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #833589;
    margin-bottom: 12px;
  }
  .cp-heading {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 800;
    line-height: 1.05;
    color: #1a0a1e;
    margin: 0 0 8px;
  }
  .cp-heading span { color: #833589; }
  .cp-subheading {
    font-size: 15px;
    color: #6B4D72;
    margin-bottom: 28px;
    line-height: 1.6;
  }
  .cp-counter {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #F0E0F4;
    border: 1px solid #D9B3E0;
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 13px;
    color: #6B4D72;
    margin-bottom: 28px;
    width: fit-content;
  }
  .cp-counter strong { color: #833589; }
  .cp-counter-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #833589;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .cp-form { display: flex; flex-direction: column; gap: 14px; }
  .cp-field { display: flex; flex-direction: column; gap: 6px; }
  .cp-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    color: #833589;
    text-transform: uppercase;
  }
  .cp-input, .cp-select {
    background: #FFFFFF;
    border: 1.5px solid #E5C9EA;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    color: #1a0a1e;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    appearance: none;
  }
  .cp-input:focus, .cp-select:focus {
    border-color: #833589;
    box-shadow: 0 0 0 3px rgba(131,53,137,0.1);
  }
  .cp-input::placeholder { color: #C9A0D0; }
  .cp-select option { background: #fff; color: #1a0a1e; }
  .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cp-marks-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .cp-marks-divider {
    border-top: 1.5px solid #E5C9EA;
    padding-top: 14px;
  }
  .cp-marks-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    color: #833589;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .cp-error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #DC2626;
  }
  .cp-btn {
    background: #833589;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: transform 0.15s, box-shadow 0.15s;
    margin-top: 4px;
    box-shadow: 0 4px 14px rgba(131,53,137,0.25);
  }
  .cp-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(131,53,137,0.35); }
  .cp-btn:active { transform: translateY(0); }
  .cp-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .cp-btn-secondary {
    background: #fff;
    border: 1.5px solid #E5C9EA;
    color: #833589;
    box-shadow: none;
  }
  .cp-btn-secondary:hover { border-color: #833589; background: #FAF5FB; box-shadow: none; }
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

  /* ---- College Grid: Air1CommandCenter-style cards (LIGHT) ---- */
  .cp-college-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  @media (max-width: 500px) { .cp-college-grid { grid-template-columns: 1fr; } }

  .cp-dark-card {
    background: #FFFFFF;
    border: 1.5px solid #E5C9EA;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    animation: slideIn 0.4s ease forwards;
    opacity: 0;
    position: relative;
  }
  .cp-dark-card:hover {
    border-color: #833589;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(131,53,137,0.12);
  }

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
    background: #E5C9EA;
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
    border-radius: 6px;
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
    transition: opacity 0.2s;
  }
  .cp-dark-card-link:hover {
    opacity: 0.7;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cp-no-result { text-align: center; padding: 32px 16px; }
  .cp-no-result img { width: 80px; margin-bottom: 16px; }
  .cp-no-result h2 {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 700;
    color: #1a0a1e; margin-bottom: 8px;
  }
  .cp-no-result p { font-size: 14px; color: #6B4D72; line-height: 1.6; }
  .cp-right-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 48px 0 0;
  }
  .cp-right-title {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #B07AB8;
    padding: 0 32px;
    margin-bottom: 24px;
  }
  .cp-images-col {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 12px;
    mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  }
  .cp-marquee-img {
    height: 90px;
    width: 130px;
    object-fit: cover;
    border-radius: 12px;
    margin-right: 12px;
    flex-shrink: 0;
    border: 1px solid #E5C9EA;
  }
  .cp-promo {
    background: linear-gradient(135deg, #833589, #A855B5);
    border-radius: 16px;
    padding: 24px;
    margin: 24px;
    position: relative;
    overflow: hidden;
  }
  .cp-promo::before {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 100px; height: 100px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }
  .cp-promo h2 {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800;
    color: #fff; margin-bottom: 4px;
  }
  .cp-promo p { font-size: 13px; color: rgba(255,255,255,0.85); margin-bottom: 14px; }
  .cp-promo a {
    display: inline-block;
    background: #fff;
    color: #833589;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    padding: 8px 18px;
    border-radius: 100px;
    text-decoration: none;
  }
  .cp-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .cp-hero-results { grid-template-columns: 1fr !important; }
  .cp-hero-results .cp-right { display: none !important; }
  .cp-hero-results .cp-left { max-width: 900px; margin: 0 auto; width: 100%; }
  .cp-hero-results .cp-college-grid { grid-template-columns: 1fr 1fr; }
  @media (max-width: 768px) {
    .cp-hero-results .cp-college-grid { grid-template-columns: 1fr; }
  }
`;
