import Head from 'next/head';
import Link from 'next/link';

const selections = [
  { name: 'S. Nikhilesh', rank: 'AIR 1', id: '2501123' },
  { name: 'Akshat Attri', rank: 'AIR 7', id: '2501245' },
  { name: 'Kopal Gupta', id: '2501367' },
  { name: 'Karthik Madhu', id: '2501458' },
  { name: 'Aanya Jain', id: '2501529' },
  { name: 'Tanish Khetan', id: '2501652' },
  { name: 'Vasu Raghani', id: '2501736' },
  { name: 'Kishore Kumaran V S', id: '2501842' },
  { name: 'Bharath Balaji', id: '2501931' },
  { name: 'Divy Goyal', id: '2502047' },
  { name: 'Advik Suhas Mali', id: '2502175' },
  { name: 'Rimmalapudi Saketh', id: '2502286' },
  { name: 'Aditi Verma', id: '2502393' },
  { name: 'Harshita Deepak Kate', id: '2502439' },
  { name: 'Bandaru Rithik', id: '2502548' },
  { name: 'Prashasti Soumya', id: '2502637' },
  { name: 'Sadhana S', id: '2502741' },
  { name: 'Sarvesh M', id: '2502855' },
  { name: 'Vinuvarsith CP', id: '2502963' },
  { name: 'Amritansh Nautiyal', id: '2503081' },
  { name: 'Tannay Mourya', id: '2503142' },
  { name: 'Satvik Bhukya', id: '2503278' },
  { name: 'Raghav Maheshwari', id: '2503354' },
  { name: 'Piyush Chaudhary', id: '2503496' },
  { name: 'Harsh Bansal', id: '2503579' },
  { name: 'Dhananjay Deshmukh', id: '2503624' },
  { name: 'Anju Subramanian', id: '2503762' },
  { name: 'Sayan Das', id: '2503827' },
  { name: 'Shweta Singh', id: '2503958' },
  { name: 'Bhavya Kumar', id: '2504072' },
  { name: 'Utsav', id: '2504128' },
  { name: 'Harshita Jain', id: '2504236' },
  { name: 'Tanishk Tambi', id: '2504345' },
];

export default function DelhiResults() {
  return (
    <>
      <Head>
        <title>IPMAT 2025 Selections — IPM Careers</title>
        <meta name="description" content="IPM Careers produced AIR 1 and 33 IIM Indore selections in IPMAT 2025. See the full list of our students who cracked IPMAT." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:ital,wght@0,700;0,800;0,900;1,800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-[#0F121E] text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* Nav */}
        <nav className="absolute top-0 w-full z-50 py-6 px-6 lg:px-12 flex justify-between items-center text-white/90">
          <div className="flex items-center gap-2">
            <Link href="/new-delhi" className="inline-block">
              <img src="https://register.ipmcareer.com/whitelogoipm.svg" alt="IPM Careers" className="h-10 lg:h-12" />
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/new-delhi" className="hover:text-white transition-colors">Home</Link>
            <Link href="/new-delhi/results" className="text-[#E89624] font-semibold">Results</Link>
          </div>
          <Link
            href="/new-delhi#registration-form"
            className="bg-[#E89624] text-[#0F121E] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#F2A63B] transition-colors"
          >
            Register Now →
          </Link>
        </nav>

        {/* Hero */}
        <section className="pt-32 pb-16 px-6 lg:px-12 text-center bg-[#0F121E]">
          <div className="inline-flex items-center gap-2 bg-[#E89624]/10 border border-[#E89624]/20 rounded-full px-4 py-1.5 text-xs font-semibold text-[#E89624] mb-6 uppercase tracking-widest">
            IPMAT 2025 · IIM Selections
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            33 IIM Indore<br />
            <span style={{ color: '#E89624' }}>Selections.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Including <span className="text-white font-bold">All India Rank 1</span> — from the same coaching batch you can join today.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {[
              { num: 'AIR 1', label: 'All India Rank 1' },
              { num: 'AIR 7', label: 'All India Rank 7' },
              { num: '33', label: 'IIM Indore Selections' },
              { num: '6th', label: 'Consecutive Year of Results' },
            ].map(({ num, label }) => (
              <div key={num} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 min-w-[130px]">
                <div className="text-2xl font-black" style={{ color: '#E89624', fontFamily: "'Montserrat', sans-serif" }}>{num}</div>
                <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* AIR 1 & AIR 7 spotlight */}
        <section className="px-6 lg:px-12 pb-14 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* AIR 1 */}
            <div className="relative rounded-2xl overflow-hidden border border-[#E89624]/30 bg-gradient-to-br from-[#E89624]/10 to-transparent p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-[#E89624] mb-2">All India Rank 1</div>
              <div className="text-2xl font-black mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>S. Nikhilesh</div>
              <div className="text-sm text-gray-400">IIM Indore · IPMAT 2025</div>
              <div className="text-xs text-gray-500 mt-1">1-Year Classroom Program</div>
              <div className="absolute top-4 right-4 text-5xl font-black text-[#E89624]/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>1</div>
            </div>
            {/* AIR 7 */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">All India Rank 7</div>
              <div className="text-2xl font-black mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>Akshat Attri</div>
              <div className="text-sm text-gray-400">IIM Indore · IPMAT 2025</div>
              <div className="text-xs text-gray-500 mt-1">2-Year Classroom Program</div>
              <div className="absolute top-4 right-4 text-5xl font-black text-white/10" style={{ fontFamily: "'Montserrat', sans-serif" }}>7</div>
            </div>
          </div>
        </section>

        {/* Full selections grid */}
        <section className="px-6 lg:px-12 pb-20 max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-6">
            All 33 Selections — IIM Indore 2025
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selections.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 hover:bg-white/[0.07] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#E89624]/10 border border-[#E89624]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#E89624]">IIM</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {s.rank ? <span className="text-[#E89624] font-bold">{s.rank} · </span> : null}
                    IPM ID: {s.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 lg:px-12 pb-20 text-center">
          <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-10">
            <div className="text-2xl font-black mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Your name could be<br /><span style={{ color: '#E89624' }}>on this list.</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">Join the same Director's Special Batch that produced AIR 1 in 2025.</p>
            <Link
              href="/new-delhi#registration-form"
              className="inline-flex bg-[#E89624] text-[#0F121E] font-bold px-8 py-4 rounded-xl text-sm hover:bg-[#F2A63B] transition-colors"
            >
              Register for the Batch →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 px-6 lg:px-12 py-6 text-center text-xs text-gray-600">
          © 2026 IPM Careers Delhi Centre · All rights reserved
        </footer>
      </div>
    </>
  );
}
