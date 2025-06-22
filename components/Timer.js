import React, { useEffect, useState } from 'react';

function Timer() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const countdownDate = new Date('June 16, 2023 16:00:00').getTime();

    // Update the timer every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      // Calculate the days, hours, minutes, and seconds left
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Format the time left
      const formattedTimeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // Update the state with the formatted time left
      setTimeLeft(formattedTimeLeft);

      // If the countdown is over, clear the interval
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('Countdown over');
      }
    }, 1000);

    // Clean up the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div>{timeLeft}</div>;
}

export default Timer;
