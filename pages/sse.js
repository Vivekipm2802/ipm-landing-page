// pages/index.js
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const IndexPage = () => {
  const [inputValue, setInputValue] = useState('');

  const handleButtonClick = async () => {
    
    const {data,error} = await supabase.from('blog_posts').select('*').textSearch('title',inputValue,{config:'english',type:'websearch'})
    if(data){
        console.log(data)
    }
  };

  return (
    <div>
      <h1>Next.js SSE Example</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleButtonClick}>Send to Server</button>
    </div>
  );
};

export default IndexPage;
