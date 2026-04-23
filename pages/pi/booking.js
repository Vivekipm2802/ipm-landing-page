import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import styles from './PIPrep.module.css';
import { NextSeo } from 'next-seo';

// ── Expert Profiles (editable — add/remove experts here) ──
const EXPERTS = [
  {
    id: 'vivek',
    name: 'Vivek Sharma',
    title: 'Founder & Lead PI Coach',
    photo: '/experts/vivek.jpg',
    bio: 'IIM Indore IPM alumnus. 5+ years coaching IPMAT aspirants. Has trained 200+ students who cracked IPM interviews. Specializes in SOP strategy, mock PI, and confidence building.',
    specialties: ['Full Mock PI', 'SOP Review', 'Career Guidance'],
    rating: 4.9,
    sessions: 350,
    price: 499,
    slots: {
      Mon: ['4:00 PM', '5:00 PM', '6:00 PM'],
      Wed: ['4:00 PM', '5:00 PM', '6:00 PM'],
      Fri: ['4:00 PM', '5:00 PM'],
      Sat: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM'],
    },
    phone: '918299470392',
  },
  {
    id: 'expert2',
    name: 'Priya Mehta',
    title: 'PI Strategy Expert',
    photo: '/experts/priya.jpg',
    bio: 'MBA from IIM Lucknow. Former corporate recruiter turned PI coach. Expert at turning average profiles into compelling stories. Known for her "Story-First" SOP approach.',
    specialties: ['SOP Deep-Dive', 'Profile Building', 'HR Questions'],
    rating: 4.8,
    sessions: 210,
    price: 399,
    slots: {
      Tue: ['4:00 PM', '5:00 PM', '6:00 PM'],
      Thu: ['4:00 PM', '5:00 PM', '6:00 PM'],
      Sat: ['3:00 PM', '4:00 PM', '5:00 PM'],
    },
    phone: '918299470392',
  },
  {
    id: 'expert3',
    name: 'Arjun Kapoor',
    title: 'GK & Current Affairs Coach',
    photo: '/experts/arjun.jpg',
    bio: 'UPSC prelims cleared. Deep expertise in current affairs, economics, and polity. Prepares students for the GK grilling that trips most IPM candidates.',
    specialties: ['Current Affairs', 'GK Prep', 'Opinion Questions'],
    rating: 4.7,
    sessions: 180,
    price: 349,
    slots: {
      Mon: ['5:00 PM', '6:00 PM', '7:00 PM'],
      Wed: ['5:00 PM', '6:00 PM', '7:00 PM'],
      Fri: ['5:00 PM', '6:00 PM'],
    },
    phone: '918299470392',
  },
];

function getNextDates(dayName, count = 3) {
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const targetDay = dayMap[dayName];
  const dates = [];
  const today = new Date();
  let d = new Date(today);

  // Start from tomorrow
  d.setDate(d.getDate() + 1);

  while (dates.length < count) {
    if (d.getDay() === targetDay) {
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatSlotDate(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatSlotDateShort(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ExpertBooking() {
  const router = useRouter();
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingStep, setBookingStep] = useState('browse'); // browse, slots, confirm, done
  const [bookedSessions, setBookedSessions] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');

  // Load student info from profile
  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('pi_profile') || '{}');
      if (profile.name) setStudentName(profile.name);
      if (profile.phone) setStudentPhone(profile.phone);
    } catch {}
    try {
      const bookings = JSON.parse(localStorage.getItem('pi_bookings') || '[]');
      setBookedSessions(bookings);
    } catch {}
  }, []);

  // Generate available dates for selected expert
  const availableDates = useMemo(() => {
    if (!selectedExpert) return [];
    const dates = [];
    const expert = EXPERTS.find(e => e.id === selectedExpert);
    if (!expert) return [];

    Object.keys(expert.slots).forEach(day => {
      getNextDates(day, 2).forEach(date => {
        dates.push({
          date,
          day,
          times: expert.slots[day],
          formatted: formatSlotDate(date),
          dateStr: date.toISOString().split('T')[0],
        });
      });
    });

    dates.sort((a, b) => a.date - b.date);
    return dates;
  }, [selectedExpert]);

  const expert = EXPERTS.find(e => e.id === selectedExpert);

  const confirmBooking = () => {
    if (!selectedExpert || !selectedDate || !selectedTime) return;

    const booking = {
      id: Date.now().toString(),
      expertId: selectedExpert,
      expertName: expert.name,
      date: selectedDate,
      time: selectedTime,
      studentName,
      studentPhone,
      bookedAt: new Date().toISOString(),
    };

    const updated = [...bookedSessions, booking];
    setBookedSessions(updated);
    localStorage.setItem('pi_bookings', JSON.stringify(updated));
    setBookingStep('done');
  };

  const sendWhatsApp = () => {
    if (!expert) return;
    const dateObj = availableDates.find(d => d.dateStr === selectedDate);
    const msg = encodeURIComponent(
      `Hi, I'd like to book a PI coaching session.\n\n` +
      `📅 Date: ${dateObj ? dateObj.formatted : selectedDate}\n` +
      `🕐 Time: ${selectedTime}\n` +
      `👤 Expert: ${expert.name}\n` +
      `🧑‍🎓 Student: ${studentName || 'N/A'}\n` +
      `📱 Phone: ${studentPhone || 'N/A'}\n\n` +
      `Please confirm my slot. Thank you!`
    );
    window.open(`https://wa.me/${expert.phone}?text=${msg}`, '_blank');
  };

  const resetBooking = () => {
    setSelectedExpert(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingStep('browse');
  };

  return (
    <AppShell>
      <NextSeo title="Expert Booking — PI Prep | IPM Careers" />
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Book an Expert</h1>
          <p className={styles.pageSubtitle}>
            1-on-1 PI coaching with IIM alumni and interview experts. Pick your expert, choose a slot, and book instantly.
          </p>
        </div>

        {/* ── Step: Browse Experts ── */}
        {bookingStep === 'browse' && (
          <>
            {/* Upcoming Bookings */}
            {bookedSessions.length > 0 && (
              <div className={styles.card} style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <div className={styles.cardTitle}>📋 Your Bookings</div>
                {bookedSessions.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #dcfce7' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#166534' }}>{b.expertName}</span>
                      <span style={{ color: '#15803d', fontSize: '0.85rem', marginLeft: 8 }}>
                        📅 {b.date} at {b.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expert Cards */}
            <div className={styles.expertGrid}>
              {EXPERTS.map(exp => (
                <div key={exp.id} className={styles.expertCard}>
                  <div className={styles.expertHeader}>
                    <div className={styles.expertAvatar}>
                      {exp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={styles.expertHeaderInfo}>
                      <h3 className={styles.expertName}>{exp.name}</h3>
                      <p className={styles.expertTitle}>{exp.title}</p>
                      <div className={styles.expertStats}>
                        <span>⭐ {exp.rating}</span>
                        <span>🎙 {exp.sessions} sessions</span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.expertBio}>{exp.bio}</p>
                  <div className={styles.expertSpecialties}>
                    {exp.specialties.map(s => (
                      <span key={s} className={styles.expertSpecTag}>{s}</span>
                    ))}
                  </div>
                  <div className={styles.expertFooter}>
                    <div className={styles.expertPrice}>
                      <span className={styles.priceAmount}>₹{exp.price}</span>
                      <span className={styles.priceUnit}>/session</span>
                    </div>
                    <button
                      className={styles.btnPrimary}
                      onClick={() => { setSelectedExpert(exp.id); setBookingStep('slots'); }}
                    >
                      View Slots →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Step: Pick Slot ── */}
        {bookingStep === 'slots' && expert && (
          <>
            <button className={styles.btnSecondary} onClick={resetBooking} style={{ marginBottom: '1rem' }}>
              ← Back to Experts
            </button>

            <div className={styles.card}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div className={styles.expertAvatar} style={{ width: 56, height: 56, fontSize: '1.2rem' }}>
                  {expert.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e' }}>{expert.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{expert.title} · ₹{expert.price}/session</p>
                </div>
              </div>

              <div className={styles.cardTitle} style={{ marginTop: 8 }}>Pick a Date</div>
              <div className={styles.dateGrid}>
                {availableDates.map(d => (
                  <button
                    key={d.dateStr}
                    className={`${styles.dateSlot} ${selectedDate === d.dateStr ? styles.dateSlotActive : ''}`}
                    onClick={() => { setSelectedDate(d.dateStr); setSelectedTime(null); }}
                  >
                    <div className={styles.dateSlotDay}>{d.day}</div>
                    <div className={styles.dateSlotDate}>{formatSlotDateShort(d.date)}</div>
                  </button>
                ))}
              </div>

              {selectedDate && (
                <>
                  <div className={styles.cardTitle} style={{ marginTop: 20 }}>Pick a Time</div>
                  <div className={styles.timeGrid}>
                    {(availableDates.find(d => d.dateStr === selectedDate)?.times || []).map(time => (
                      <button
                        key={time}
                        className={`${styles.timeSlot} ${selectedTime === time ? styles.timeSlotActive : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedDate && selectedTime && (
                <div className={styles.btnRow} style={{ marginTop: 20 }}>
                  <button className={styles.btnPrimary} onClick={() => setBookingStep('confirm')}>
                    Continue to Book →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Step: Confirm Booking ── */}
        {bookingStep === 'confirm' && expert && (
          <>
            <button className={styles.btnSecondary} onClick={() => setBookingStep('slots')} style={{ marginBottom: '1rem' }}>
              ← Change Slot
            </button>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Confirm Your Booking</div>

              <div className={styles.bookingSummary}>
                <div className={styles.bookingSummaryRow}>
                  <span className={styles.bookingSummaryLabel}>Expert</span>
                  <span className={styles.bookingSummaryValue}>{expert.name}</span>
                </div>
                <div className={styles.bookingSummaryRow}>
                  <span className={styles.bookingSummaryLabel}>Date</span>
                  <span className={styles.bookingSummaryValue}>
                    {availableDates.find(d => d.dateStr === selectedDate)?.formatted || selectedDate}
                  </span>
                </div>
                <div className={styles.bookingSummaryRow}>
                  <span className={styles.bookingSummaryLabel}>Time</span>
                  <span className={styles.bookingSummaryValue}>{selectedTime}</span>
                </div>
                <div className={styles.bookingSummaryRow}>
                  <span className={styles.bookingSummaryLabel}>Fee</span>
                  <span className={styles.bookingSummaryValue} style={{ color: '#22c55e', fontWeight: 700 }}>₹{expert.price}</span>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Your Name</label>
                    <input className={styles.input} placeholder="Enter your name" value={studentName} onChange={e => setStudentName(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>WhatsApp Number</label>
                    <input className={styles.input} type="tel" placeholder="+91 98765 43210" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className={styles.btnRow} style={{ marginTop: 20 }}>
                <button className={styles.btnPrimary} onClick={() => { confirmBooking(); sendWhatsApp(); }} disabled={!studentName || !studentPhone}>
                  ✅ Confirm & Book on WhatsApp
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
                You'll be redirected to WhatsApp to confirm the booking with the expert
              </p>
            </div>
          </>
        )}

        {/* ── Step: Done ── */}
        {bookingStep === 'done' && expert && (
          <div className={styles.card} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
              Booking Requested!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto 24px' }}>
              Your session request has been sent to {expert.name} on WhatsApp. They will confirm your slot shortly.
            </p>

            <div className={styles.bookingSummary} style={{ maxWidth: 320, margin: '0 auto 24px' }}>
              <div className={styles.bookingSummaryRow}>
                <span className={styles.bookingSummaryLabel}>Date</span>
                <span className={styles.bookingSummaryValue}>
                  {availableDates.find(d => d.dateStr === selectedDate)?.formatted || selectedDate}
                </span>
              </div>
              <div className={styles.bookingSummaryRow}>
                <span className={styles.bookingSummaryLabel}>Time</span>
                <span className={styles.bookingSummaryValue}>{selectedTime}</span>
              </div>
            </div>

            <div className={styles.btnRow} style={{ justifyContent: 'center', gap: 12 }}>
              <button className={styles.btnPrimary} onClick={resetBooking}>
                Book Another Session
              </button>
              <button className={styles.btnSecondary} onClick={() => router.push('/pi/mock')}>
                Practice with AI Mock →
              </button>
            </div>
          </div>
        )}

        {/* Help Banner */}
        {bookingStep === 'browse' && (
          <div className={styles.card} style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <div className={styles.cardTitle} style={{ textAlign: 'center' }}>Not sure which expert to pick?</div>
            <div className={styles.cardSubtitle} style={{ textAlign: 'center' }}>
              Call us and we'll match you with the right coach based on your profile and interview date
            </div>
            <div className={styles.btnRow} style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <a href="tel:8299470392" className={styles.btnPrimary}>
                📞 Call 82994 70392
              </a>
              <a href="https://wa.me/918299470392?text=Hi%2C%20I%20need%20help%20choosing%20a%20PI%20coach" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
