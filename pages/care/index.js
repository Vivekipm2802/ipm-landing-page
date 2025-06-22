import { useEffect, useRef, useState } from 'react';
import styles from './Care.module.css'
import Login from '../../components/Login';
import { supabase } from '../../utils/supabaseClient';
import Head from 'next/head';



function Care(props){

const [loggedIn,setLoggedIn] = useState()
const [users,setUsers] = useState();
const [activeUser,setActiveUser] = useState();
const [userData,setUserData] = useState();
const [msg,setMsg] = useState();
const [messages,setMessages] = useState();
const msgTextInputRef = useRef(msg);
const [highlight,setHighlight] =useState();
const [sending,setSending] = useState(false);
function getLoginState(){
    const login = localStorage.getItem('LoggedInCare');
    if(login != undefined){
        setLoggedIn(JSON.parse(login))
    }
}

async function getUsers(){
    const {data,error} = await supabase.from('gptlogins').select('*')
    if(data){
        setUsers(data)
    }else{

    }
}
useEffect(() => {
    // Update the ref when msgtext state changes
    msgTextInputRef.current = msg;
  }, [msg]);
const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      // Access the latest msgtext value from the ref
      const currentMsgText = msgTextInputRef.current;
      sendCustomer(currentMsgText,userData?.phone)
    }
  };

useEffect(() => {
    window.addEventListener('keydown', handleEnterKeyPress);
  
    return () => {
      window.removeEventListener('keydown', handleEnterKeyPress);
    };
  }, [handleEnterKeyPress]);
async function getMessages(){
    const {data,error} = await supabase.from('ipmcare').select('*').limit(200)
    if(data){
        setMessages(data)
    }else{

    }
}
useEffect(()=>{
getLoginState();
getUsers()
SubscribeCare();
getMessages()

},[])

const messagesRef = useRef(null); const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  function sortArrayByMessages(array1, array2) {
    // Create a mapping of phone numbers to corresponding messages
    const messageMap = {};
    array2.forEach(message => {
      const userKey = message.user; // Assuming 'user' is the key in array2 corresponding to phone in array1
      if (!messageMap[userKey]) {
        messageMap[userKey] = [];
      }
      messageMap[userKey].push(message.created_at);
    });
  
    // Sort array1 based on the latest message timestamp for each user
    array1.sort((a, b) => {
      const messagesA = messageMap[a.phone] || [];
      const messagesB = messageMap[b.phone] || [];
      const latestMessageA = Math.max(...messagesA, 0);
      const latestMessageB = Math.max(...messagesB, 0);
  
      return latestMessageB - latestMessageA; // Sort in descending order (recent first)
    });
  
    return array1;
  }
function sortUsers(a,b){
    if(b == undefined){
        return a
    }
    else{
        const sorted = sortArrayByMessages(a,b)
        
       return sorted;
        
    }
}
useEffect(()=>{
    scrollToBottom();

},[activeUser,userData])
function SubscribeCare(){
    supabase
    .channel('any')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ipmcare' }, payload => {
      console.log('Change received!', payload);
      setMessages(res=>([...res,payload.new]))
      checkIfNotExists(payload.new);
      setHighlight(payload.new.user)
      
    })
    .subscribe()
  }
  function checkIfNotExists(a) {
    // Assuming users is an array of objects with a 'phone' key
    if (users != undefined && !users.some(user => user.phone === a.user)) {
        // The user with matching 'phone' key doesn't exist in the array
        // Add your logic here if needed
        
    } else {
        // The user with matching 'phone' key exists in the array
        // Add your logic here if needed
       getUsers()
    }
}


useEffect(()=>{
    if(loggedIn != undefined){
        getUsers
    }
},[loggedIn])

function MessagesFilter(a,b){

    if(b == undefined){
        return []
    }
const final = a.filter(res=>res.user == b)

return final;

}

async function sendCustomer(a,b){
    if(a == null || a?.length < 2 || a == undefined){
      /* setNotification('Empty Message') */
      return null;
    }
    setSending(true)
    const {error} = await supabase.from('ipmcare').insert({
    
      message:a,
      type:1,
      assistant:loggedIn?.email,
      user:b
    });
    if(!error){
      /* getCustomerMessages(LoggedIn?.phone); */
      setMsg('')
      setSending(false);
      scrollToBottom()
    }else{
   /*  setNotification('error loading message')   */
   setSending(false)
   scrollToBottom()
    }
    
    }
useEffect(()=>{

    if(activeUser != undefined){
        setUserData(users[activeUser])
    }
},[activeUser])

if(loggedIn == undefined){
    return <Login onComplete={getLoginState}></Login>
}

    return <div className={styles.wrapperc}>
        <div className={styles.warning}>

            <h2>This panel doesn't work on mobile/tablet , please use desktop to use</h2>
            
        </div>
        <Head>
        <title>Customer Support IPM Careers</title>
        <meta name="description" content="IPM Careers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={'favicon_ipm.svg'} />
        </Head>
        <div className={styles.child}>
            <div className={styles.fixed}>
            <div className={styles.profile}>
                Logged in as : {loggedIn?.fullname}
            </div></div>
<div className={styles.main}>
<h2>IPM Careers Chat Support</h2>

<div className={styles.chats}>
{users != undefined && sortUsers(users,messages).map((i,d)=>{
    return <div className={styles.userc + " " + (activeUser == d ? styles.activeuser : '')  + " " + (highlight == i.phone ? styles.highlight:'')} onClick={()=>{setActiveUser(d),highlight == i.phone ? setHighlight(false):''}}>
        <h2>{i.name}</h2>
        <p>{i.phone}</p>
       {highlight == i.phone? <div className={styles.highlighted}></div>:''}
    </div>
})}</div>
</div>
<div className={styles.col}  >
    <div ref={messagesRef} className={styles.maincol}>
        <div className={styles.gradient}></div>
{messages != undefined && MessagesFilter(messages,userData?.phone).map((i,d)=>{
  return <div className={styles.message + " " + (i.type == 1 ? styles.left : styles.right)}>
    {i.type == 0 ? <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.754 14a2.249 2.249 0 0 1 2.25 2.249v.918a2.75 2.75 0 0 1-.513 1.599C17.945 20.929 15.42 22 12 22c-3.422 0-5.945-1.072-7.487-3.237a2.75 2.75 0 0 1-.51-1.595v-.92a2.249 2.249 0 0 1 2.249-2.25h11.501ZM12 2.004a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="#222F3D"/></svg>:''}
   <div className={styles.wrapper}> <div className={i.type == 0 ? styles.bot : styles.user} dangerouslySetInnerHTML={{__html:i.message}}></div>
   <div className={styles.bottom}>
    <p><strong>{i.type == 0 ? userData?.name: "You"}</strong></p><p>{i.time}</p> 
   </div>
   </div>

    {i.type == 1 ? <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.754 14a2.249 2.249 0 0 1 2.25 2.249v.918a2.75 2.75 0 0 1-.513 1.599C17.945 20.929 15.42 22 12 22c-3.422 0-5.945-1.072-7.487-3.237a2.75 2.75 0 0 1-.51-1.595v-.92a2.249 2.249 0 0 1 2.249-2.25h11.501ZM12 2.004a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="#222F3D"/></svg>:''}
    </div>
 })}
 </div>
<div className={styles.grid}></div>
<div className={styles.sendContainer}>
{sending ? <div className={styles.sending}>
            
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
      <style>
        {
          "@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}to{transform:rotate(360deg)}}"
        }
      </style>
      <g
        style={{
          transformOrigin: "center",
          animation: "spinner_T6mA .75s step-end infinite",
        }}
      >
        <path d="M11 1h2v5h-2z" opacity={0.14} />
        <path d="m16.634 1.974 1.732 1-2.5 4.33-1.732-1z" opacity={0.29} />
        <path d="m21.026 5.634 1 1.732-4.33 2.5-1-1.732z" opacity={0.43} />
        <path d="M23 11v2h-5v-2z" opacity={0.57} />
        <path d="m22.026 16.634-1 1.732-4.33-2.5 1-1.732z" opacity={0.71} />
        <path d="m18.366 21.026-1.732 1-2.5-4.33 1.732-1z" opacity={0.86} />
        <path d="M13 23h-2v-5h2z" />
      </g>
    </svg>
              Sending.....</div>:''}
<input value={msg} type='text' placeholder='Write your question here....'  onChange={(e)=>{setMsg(e.target.value),scrollToBottom()}}></input>
<div className={styles.sendButton} onClick={()=>{sendCustomer(msg,userData?.phone)}}>
<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.815 12.197-7.532 1.256a.5.5 0 0 0-.386.318L2.3 20.728c-.248.64.421 1.25 1.035.943l18-9a.75.75 0 0 0 0-1.342l-18-9c-.614-.307-1.283.304-1.035.943l2.598 6.957a.5.5 0 0 0 .386.319l7.532 1.255a.2.2 0 0 1 0 .394Z" fill="#ffffff"/></svg>
</div>
        </div>

</div>
</div>
    </div>
}

export default Care;