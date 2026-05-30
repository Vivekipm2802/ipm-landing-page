import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head >
      <script dangerouslySetInnerHTML={{__html:"(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-KVQP6G3S');"}}></script>


      <script
            dangerouslySetInnerHTML={{
              __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1089694632450183');
              fbq('track', 'PageView');
              `,
            }}
          ></script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src="https://www.facebook.com/tr?id=1089694632450183&ev=PageView&noscript=1"
            />
          </noscript>

      </Head>
      <body>

        {/* ipm-answer-key-banner-v1 */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            if (window.location.pathname === '/response') {
              var b = document.createElement('div');
              b.style.cssText = 'background:#1a1a2e;border-bottom:1px solid rgba(249,160,27,.3);padding:10px 20px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:13px;flex-wrap:wrap;font-family:sans-serif;';
              b.innerHTML = '<span style="color:#f9a01b;font-weight:600;">IPMAT 2026 Answer Key & Official Cutoffs</span> <a href="https://register.ipmcareer.com/magazine/ipmat-indore-answer-key-2026-response-sheet-score-calculator" style="color:#fff;text-decoration:underline;font-weight:500;">Read the complete analysis →</a>';
              document.body.insertBefore(b, document.body.firstChild);
            }
          })();
        ` } />
        <Main />
        <NextScript />
        <noscript dangerouslySetInnerHTML={{__html:`<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N57BJSC"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`}}></noscript>
      </body>
    </Html>
  )
}
