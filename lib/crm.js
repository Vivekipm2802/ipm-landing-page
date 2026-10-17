// Browser-side CRM push. Fire-and-forget: never awaited, never throws, no key.
// Runs next to each form's existing submission (FormSubmit, Supabase, APIs) and
// never replaces it. If the CRM is slow or down, the form behaves exactly as before.
//
// Test switch: open any page with ?crm_dry_run=1 and every CRM call from that tab
// carries dry_run: true (the CRM saves and sends nothing). Close the tab to end it.
const CRM_URL = 'https://clat-tribe-crm-eight.vercel.app/api/leads/inbound';

function isDryRun() {
  try {
    if (/[?&]crm_dry_run=1(&|$)/.test(window.location.search)) {
      window.sessionStorage.setItem('ipm_crm_dry_run', '1');
      return true;
    }
    return window.sessionStorage.getItem('ipm_crm_dry_run') === '1';
  } catch (e) {
    return false;
  }
}

export function sendLeadToCrm(fields, formName) {
  try {
    const f = fields || {};
    const a =
      typeof window.ipmAttribution === 'function' ? window.ipmAttribution() : {};
    const body = {
      name: f.name || '',
      phone: f.phone || '',
      email: f.email || '',
      city: f.city || '',
      target: f.target || '',
      class: f.class || '',
      page: window.location.href,
      form: formName,
      landing_page: a.landing_page || '',
      referrer: a.referrer || '',
      utm_source: a.utm_source || '',
      utm_medium: a.utm_medium || '',
      utm_campaign: a.utm_campaign || '',
      utm_term: a.utm_term || '',
      utm_content: a.utm_content || '',
      gclid: a.gclid || '',
      gbraid: a.gbraid || '',
      wbraid: a.wbraid || '',
      fbclid: a.fbclid || '',
      company: f.company || '', // honeypot field if the form has one
      via: 'website',
    };
    if (isDryRun()) body.dry_run = true;
    fetch(CRM_URL, {
      method: 'POST',
      keepalive: true, // still delivered if the page moves on (thank-you page, payment link)
      headers: { 'Content-Type': 'application/json' }, // CORS is set up for this origin
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch (e) {
    /* never block the form */
  }
}

