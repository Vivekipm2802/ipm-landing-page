/*! IPM Careers CRM push for pages outside the Next.js app (AIR 1 Command Center, static HTML).
 * Same logic as lib/crm.js. Exposes window.ipmSendLeadToCrm(fields, formName).
 * Fire-and-forget: never awaited, never throws, no key.
 */
(function () {
  'use strict';
  if (window.ipmSendLeadToCrm) return;
  var CRM_URL = 'https://clat-tribe-crm-eight.vercel.app/api/leads/inbound';

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

function sendLeadToCrm(fields, formName) {
  try {
    var f = fields || {};
    var a =
      typeof window.ipmAttribution === 'function' ? window.ipmAttribution() : {};
    var body = {
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
  window.ipmSendLeadToCrm = sendLeadToCrm;
})();
