import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './Login.module.css'

const Login = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const {data,error } = await supabase.from('assistants').select('id,username,email,fullname').match({email:email,password:password});

      if(data && data?.length > 0) {
        // Save user information to local storage
        localStorage.setItem('LoggedInCare', JSON.stringify(data[0]));
        props.onComplete()
        console.log('Login successful:', data);
      }else{
        console.log('Login Error')
      }
    } catch (error) {
      console.error('Login error:', error.message);
    }
  };

  return (
    <div className={styles.main}>
      <h2>Login as Assistant</h2>
      <form>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="button" onClick={login}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
