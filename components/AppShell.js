import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import lightStyles from './AppShell.module.css';
import darkStyles from './AppShellDark.module.css';

// Score-calculator pages use the ipmcareer.com theme (near-black, gold, Fraunces)
const DARK_ROUTES = ['/response', '/jipmat', '/response-v1', '/report', '/jipmat-report', '/iimb-report', '/cat-score-calculator', '/cat-report', '/mba-application-forms', '/cat-exam-day-planner', '/cat-exam-centres'];

const AppShell = ({ activePage, children, pageTitle, breadcrumb, showBack }) => {
  const router = useRouter();
  const isDark = DARK_ROUTES.some((r) => router.pathname === r || router.pathname.startsWith(r + '/'));
  const styles = isDark ? darkStyles : lightStyles;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  // Detect if user has browser history to go back to
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanGoBack(window.history.length > 1 && document.referrer !== '');
    }
  }, [router.asPath]);

  // CAT pages get their own, separate menu (CAT calculator + Contact Us only)
  const isCatPage = router.pathname === '/cat-score-calculator' || router.pathname.startsWith('/cat-report') || router.pathname === '/mba-application-forms' || router.pathname.startsWith('/cat-exam-day-planner') || router.pathname.startsWith('/cat-exam-centres');

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push(isCatPage ? '/cat-score-calculator' : '/response');
    }
  };

  // Auto-derive page title from route if not provided
  const routeTitleMap = {
    '/response': 'IPMAT Score Analyzer',
    '/jipmat': 'JIPMAT Score Calculator',
    '/cat-score-calculator': 'CAT 2026 Score Calculator',
    '/cat-report': 'CAT 2026 Report',
    '/mba-application-forms': 'MBA Forms & Deadlines',
    '/jipmat-report': 'JIPMAT Report',
    '/report': 'My Report',
    '/interview-prep': 'AI Mock Interview',
    '/topperlist': 'Topper List',
    '/call': 'College Predictor',
    '/pi-batch': 'PI Preparation Batch',
    '/': 'Home',
  };
  const derivedTitle = pageTitle || Object.entries(routeTitleMap).find(([path]) =>
    router.pathname === path || router.pathname.startsWith(path + '/')
  )?.[1] || '';

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll effect on top bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === '/response') {
      return router.pathname === '/response';
    }
    if (path === '/cat-score-calculator') {
      return router.pathname === '/cat-score-calculator' || router.pathname.startsWith('/cat-report');
    }
    return router.pathname.startsWith(path);
  };

  const ipmNavItems = [
    { icon: '📊', label: 'IPMAT Score Analyzer', path: '/response' },
    { icon: '📝', label: 'JIPMAT Score Calculator', path: '/jipmat' },
    { icon: '🏛️', label: 'IIM-B UG Score Calculator', path: '/response-v1' },
    { icon: '📋', label: 'My Report', path: '/report', disabled: false },
    { icon: '🤖', label: 'AI Mock Interview', path: '/interview-prep' },
    { icon: '🏆', label: 'Topper List', path: '/topperlist' },
    { icon: '🎯', label: 'College Predictor', path: '/call' },
    { icon: '📚', label: 'PI Batch', path: '/pi-batch' },
  ];

  const ipmTopNavItems = [
    { label: 'IPMAT Score', path: '/response' },
    { label: 'JIPMAT Score', path: '/jipmat' },
    { label: 'IIM-B UG Score', path: '/response-v1' },
    { label: 'AI Interview', path: '/interview-prep' },
    { label: 'College Predictor', path: '/call' },
  ];

  const catNavItems = [
    { icon: '🎓', label: 'CAT 2026 Score Calculator', path: '/cat-score-calculator' },
    { icon: '🧭', label: 'CAT Exam Day Planner', path: '/cat-exam-day-planner' },
    { icon: '📍', label: 'CAT Exam Centres', path: '/cat-exam-centres' },
    { icon: '🗓️', label: 'MBA Forms & Deadlines', path: '/mba-application-forms' },
  ];
  const catTopNavItems = [
    { label: 'CAT 2026 Score Calculator', path: '/cat-score-calculator' },
    { label: 'Exam Day Planner', path: '/cat-exam-day-planner' },
    { label: 'MBA Forms & Deadlines', path: '/mba-application-forms' },
  ];

  const navItems = isCatPage ? catNavItems : ipmNavItems;
  const topNavItems = isCatPage ? catTopNavItems : ipmTopNavItems;

  return (
    <div className={styles.shell}>
      {isDark && (
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
          <meta name="theme-color" content="#0b0b0c" />
        </Head>
      )}
      {/* Top Navigation Bar */}
      <header className={`${styles.topbar} ${isScrolled ? styles.topbarScrolled : ''}`}>
        <div className={styles.topbarContent}>
          {/* Left: Back + Logo + Mobile Menu Toggle */}
          <div className={styles.topbarLeft}>
            {isMobile && (
              <button
                className={styles.hamburger}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
              </button>
            )}
            {(showBack !== false && router.pathname !== '/response' && router.pathname !== '/cat-score-calculator' && router.pathname !== '/') && (
              <button
                className={styles.backBtn}
                onClick={handleBack}
                aria-label="Go back"
                title="Back"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span className={styles.backBtnLabel}>Back</span>
              </button>
            )}
            <Link href="/" className={styles.logo}>
              <img
                src={isDark ? "/whitelogoipm.svg" : "/hd-logo.svg"}
                alt="IPM Careers"
                className={styles.logoImg}
              />
{/* Logo text removed per user request */}
            </Link>
            {derivedTitle && !isMobile && (
              <div className={styles.breadcrumb}>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbCurrent}>{breadcrumb || derivedTitle}</span>
              </div>
            )}
          </div>

          {/* Center: Navigation (Desktop Only) */}
          {!isMobile && (
            <nav className={styles.topbarNav}>
              {topNavItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.topbarLink} ${
                    isActive(item.path) ? styles.topbarLinkActive : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right: CTA Button (IPM pages only) */}
          {!isCatPage ? (
            <Link href="/pi-batch" className={styles.ctaButton}>
              Enroll in PI Batch
            </Link>
          ) : (
            <a href="tel:8299470392" className={styles.ctaButton}>
              Contact Us
            </a>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.mobileMenuContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileMenuHeader}>
              <h3>Menu</h3>
              <button
                className={styles.mobileMenuClose}
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <nav className={styles.mobileNavList}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.mobileNavItem} ${
                    isActive(item.path) ? styles.mobileNavItemActive : ''
                  } ${item.disabled ? styles.mobileNavItemDisabled : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.mobileNavIcon}>{item.icon}</span>
                  <span className={styles.mobileNavLabel}>{item.label}</span>
                </Link>
              ))}
              <div className={styles.mobileNavDivider}></div>
              <a
                href="tel:8299470392"
                className={styles.mobileNavItem}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={styles.mobileNavIcon}>📞</span>
                <span className={styles.mobileNavLabel}>Contact Us</span>
              </a>
            </nav>
          </div>
        </div>
      )}

      <div className={styles.container}>
        {/* Left Sidebar (Desktop Only) */}
        {!isMobile && (
          <aside
            className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}
          >
            <div className={styles.sidebarContent}>
              <nav className={styles.sidebarNav}>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${styles.sidebarItem} ${
                      isActive(item.path) ? styles.sidebarItemActive : ''
                    } ${item.disabled ? styles.sidebarItemDisabled : ''}`}
                  >
                    <span className={styles.sidebarIcon}>{item.icon}</span>
                    {sidebarOpen && (
                      <span className={styles.sidebarLabel}>{item.label}</span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className={styles.sidebarDivider}></div>

              <a
                href="tel:8299470392"
                className={`${styles.sidebarItem} ${styles.sidebarContact}`}
                title="Call us"
              >
                <span className={styles.sidebarIcon}>📞</span>
                {sidebarOpen && (
                  <span className={styles.sidebarLabel}>Contact Us</span>
                )}
              </a>
            </div>

            {/* Sidebar Footer */}
            <div className={styles.sidebarFooter}>
              <button
                className={styles.collapseToggle}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? '◀' : '▶'}
              </button>
              {sidebarOpen && (
                <div className={styles.sidebarInfo}>
                  <p className={styles.poweredBy}>Powered by IPM Careers</p>
                  <p className={styles.version}>v1.0.0</p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`${styles.main} ${!sidebarOpen && !isMobile ? styles.mainExpanded : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
export { AppShell };
