import { useState } from "react";
import PuneEvents from ".";
import { supabase } from "../../utils/supabaseClient";
import styles from './PuneEvents.module.css'
import Head from "next/head";
function Admin(props){

    const [isLoggedIn,setIsLoggedIn] = useState(false);
    const [data,setData] = useState();

if(!isLoggedIn){
    return <div className={styles.password}>
<Head><meta name="robots" content="noindex" /></Head>

        <input placeholder="Enter Password to Login" name="password" onChange={(e)=>{setData(res=>({...res,password:e.target.value}))}} className={styles.input}></input>
        <div className={styles.update} onClick={()=>{data?.password == "IPMPuneEdit1@" ? setIsLoggedIn(true):setIsLoggedIn(false)}}>Unlock</div>

    </div>
}

    return <PuneEvents data={props.data} admin={true}></PuneEvents>
}

export default Admin;

export async function getServerSideProps(){


    const {data,error} = await supabase.from('landing-page').select("*").eq('slug','pune-events');
    
    
    
    return {props:{data}}
    
    }