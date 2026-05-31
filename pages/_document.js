import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head >
      {/* Site-wide Organization (EducationalOrganization) structured data — renders on every page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "@id": "https://register.ipmcareer.com/#organization",
            name: "IPM Careers",
            alternateName: "IPMCareers",
            url: "https://register.ipmcareer.com/",
            logo: "https://register.ipmcareer.com/whitelogoipm.svg",
            description:
              "IPM Careers is India's dedicated IPMAT coaching brand, built by IIM alumni. It prepares Class 10/11/12 students and droppers to crack IPMAT Indore, IPMAT Rohtak and JIPMAT and earn a seat in an IIM 5-year integrated BBA+MBA (IPM) programme. One integrated programme covers all three exams. Produced All India Rank 1 and 1,000+ IIM selections.",
            knowsAbout: [
              "IPMAT Indore",
              "IPMAT Rohtak",
              "JIPMAT",
              "IIM IPM admissions",
              "5-year integrated BBA MBA",
            ],
            sameAs: [
              "https://www.ipmcareer.com/",
              "https://www.youtube.com/@IPMCareers",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "admissions",
              telephone: "+91-82994-70392",
              availableLanguage: ["en", "hi"],
            },
          }),
        }}
      ></script>

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
        
        <Main />
        <NextScript />
        <noscript dangerouslySetInnerHTML={{__html:`<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N57BJSC"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`}}></noscript>
      </body>
    </Html>
  )
}
