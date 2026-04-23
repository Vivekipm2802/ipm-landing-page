import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './AppShell.module.css';

const AppShell = ({ activePage, children, pageTitle, breadcrumb, showBack }) => {
  const router = useRouter();
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

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push('/response');
    }
  };

  // Auto-derive page title from route if not provided
  const routeTitleMap = {
    '/response': 'Score Analyzer',
    '/pi/profile': 'My Profile',
    '/pi/sop': 'SOP Builder',
    '/pi/mock': 'AI Mock Interview',
    '/pi/questions': 'Question Bank',
    '/pi/booking': 'Expert Booking',
    '/pi/sessions': 'Sessions',
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
    return router.pathname.startsWith(path);
  };

  const navItems = [
    { icon: '📊', label: 'Score Analyzer', path: '/response' },
    { icon: '📋', label: 'My Report', path: '/report', disabled: false },
    { icon: '🏆', label: 'Topper List', path: '/topperlist' },
    { icon: '🎯', label: 'College Predictor', path: '/call' },
    { separator: true, label: 'PI Prep' },
    { icon: '🧑‍🎓', label: 'My Profile', path: '/pi/profile' },
    { icon: '✍️', label: 'SOP Builder', path: '/pi/sop' },
    { icon: '🤖', label: 'AI Mock Interview', path: '/pi/mock' },
    { icon: '📚', label: 'Question Bank', path: '/pi/questions' },
    { icon: '📅', label: 'Expert Booking', path: '/pi/booking' },
    { icon: '📹', label: 'Sessions', path: '/pi/sessions' },
  ];

  const topNavItems = [
    { label: 'Score Analyzer', path: '/response' },
    { label: 'PI Prep', path: '/pi/profile' },
    { label: 'AI Mock', path: '/pi/mock' },
    { label: 'Topper List', path: '/topperlist' },
  ];

  return (
    <div className={styles.shell}>
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
            {(showBack !== false && router.pathname !== '/response' && router.pathname !== '/') && (
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
                src="/hd-logo.svg"
                alt="IPM Careers"
                className={styles.logoImg}
              />
              <span className={styles.logoText}>IPM Careers</span>
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

          {/* Right: CTA Button */}
          <Link href="/pi-batch" className={styles.ctaButton}>
            Enroll in PI Batch
          </Link>
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
              {navItems.map((item, idx) => (
                item.separator ? (
                  <div key={item.label} className={styles.mobileNavSeparator}>
                    <span>{item.label}</span>
                  </div>
                ) : (
                <Link
                  key={item.path}
                  href={item.disabled ? '#' : item.path}
                  className={`${styles.mobileNavItem} ${
                    isActive(item.path) ? styles.mobileNavItemActive : ''
                  } ${item.disabled ? styles.mobileNavItemDisabled : ''}`}
                  onClick={(e) => { if (item.disabled) { e.preventDefault(); } else { setMobileMenuOpen(false); } }}
                >
                  <span className={styles.mobileNavIcon}>{item.icon}</span>
                  <span className={styles.mobileNavLabel}>
                    {item.label}
                    {item.disabled && <span className={styles.comingSoonMobile}>Soon</span>}
                  </span>
                </Link>
                )
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
                {navItems.map((item, idx) => (
                  item.separator ? (
                    <div key={item.label} className={styles.sidebarSeparator}>
                      {sidebarOpen && <span>{item.label}</span>}
                      {!sidebarOpen && <div className={styles.sidebarSepLine}></div>}
                    </div>
                  ) : (
                  <Link
                    key={item.path}
                    href={item.disabled ? '#' : item.path}
                    className={`${styles.sidebarItem} ${
                      isActive(item.path) ? styles.sidebarItemActive : ''
                    } ${item.disabled ? styles.sidebarItemDisabled : ''}`}
                    onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                  >
                    <span className={styles.sidebarIcon}>{item.icon}</span>
                    {sidebarOpen && (
                      <span className={styles.sidebarLabel}>
                        {item.label}
                        {item.disabled && <span className={styles.comingSoon}>Soon</span>}
                      </span>
                    )}
                  </Link>
                  )
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
