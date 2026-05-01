import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MockRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/interview-prep');
  }, []);
  return null;
}
