import { useEffect, useState } from 'react';
import CustomSelect from '../components/CustomSelect';
import { supabase } from '../utils/supabaseClient';

import styles from './Leads.module.css'
import { NextSeo } from 'next-seo';
import axios from 'axios'

function Leads(){

const [leads,setLeads] = useState();
const [formData,setFormData] = useState();
const [isOpen,setIsOpen] = useState();
const [innerLeads,setInnerLeads] = useState();
const [leadactive,setLeadActive] = useState();
useEffect(()=>{
    
    if(localStorage.getItem('isAuth-nmnVis-Bl')){
        setIsOpen(true)
        const r = localStorage.getItem('isAuth-nmnVis-El');
       
          
    }
    
    
    },[])

    async function getUserEmail(){
        const a = localStorage.getItem('isAuth-nmnVis-El')
       
    }
    useEffect(()=>{
        getUserEmail()
    })
    function extractJsonValue(jsonString, key) {
        try {
          const parsedJson = JSON.parse(jsonString);
          return parsedJson[key];
        } catch (error) {
          console.error('Error parsing JSON:', error);
          return null;
        }
      }   
async function Authenticate(a){

    const {data,error} = await axios.post('/api/auth',{
a
        
    })


    if(data && data.logged == true){
        
        localStorage.setItem('isAuth-nmnVis-Bl',data.logged)
        localStorage.setItem('isAuth-nmnVis-El',data.email)
        setIsOpen(data.logged);
        

    } else if(data && data.logged == false){
        alert(data.message)
    }
    if(error){
        alert('Something Went Wrong') 
    }

}

function calculateScores(d, subtractScore,addScore) {
    if (!d || !Array.isArray(d)) {
      return 0;
    }
  
    return d.reduce((sum, i) => {
      if (i.status === "Answered" || i.status === "Marked For Review" && (i.rightAnswer != undefined && i.givenAnswer != undefined) ) {
        if (i.rightAnswer == i.givenAnswer) {
          return sum + addScore; // Increase the score by 1 if the answer is correct
        } else if(i.rightAnswer != i.givenAnswer && subtractScore > 0) {
          return sum - subtractScore; // Subtract the given score if the answer is incorrect
        }
      }
      return sum; // Keep the same score for unanswered questions
    }, 0);
  }



async function getLeads(){
    const {data,error} = await supabase.from('responses').select('created_at,name,total,email,phone,link,category').order('total',{ascending:false});

    if(data){
        
        setLeads(data)
    }
}

async function getInnerLeads(){
    const {data,error} = await supabase.from('ipm_leads').select('*').order('created_at',{ascending:false}).limit(1000);

    if(data){
        
        setInnerLeads(data)
    }
}
function fireLeads(){

    getInnerLeads();
    setLeadActive(true)
}



useEffect(() => {
    if(isOpen != undefined && isOpen == true){
getLeads()}
    
}, [isOpen])

function getLocalDate(a){
    const b = new Date(a);
    return [ b.toLocaleTimeString()   ,b.toLocaleDateString() ];
}


    return <>{isOpen ? <div className={styles.main}>
        <NextSeo
        noindex={"true"}></NextSeo>
        <h2>Response Sheet Submissions</h2>
        <button onClick={()=>{
            fireLeads()
        }}>Open Leads</button>
        {innerLeads != undefined && leadactive == true ? 
        
        <div className={styles.fixed}>
            <h2>Leads from Database</h2>
<div className={styles.leadlist + " " + styles.heading}>
<p>Date</p>
      <p>Name</p>
      <p>Email</p>
      <p>Phone</p>
      
      <p>Source</p>
      
      <p>City</p>
    
     {/*  <p>Status</p> */}
      </div>
      {innerLeads && innerLeads.map((i,d)=>{

return <div className={styles.leadlist}>
    
    <p>{getLocalDate(i.created_at)}</p>
    <p>{i.name}</p>
    <p>{i.email}</p>
    <p>{i.phone}</p>
    
    <p>{i.source} </p>
    <p>{i.city}</p>
   
   {/*  <p>{i.status} <CustomSelect small></CustomSelect></p> */}
</div>
},[])}
        </div>
        :'' }
        <div className={styles.leadlist + " " + styles.heading}>
       
        <p>Name</p>
        <p>Email</p>
        <p>Phone</p>
        
        <p>Total</p>
        <p>Category</p>
        <p>Link</p>
      
       {/*  <p>Status</p> */}
        </div>
{leads && leads.map((i,d)=>{

    return <div className={styles.leadlist}>
        
        
        <p>{i.name}</p>
        <p>{i.email}</p>
        <p>{i.phone}</p>
        
        <p>{i.total} </p>
        <p>{i.category}</p>
        <p><a href={i.link}>Click to Open</a></p>
       {/*  <p>{i.status} <CustomSelect small></CustomSelect></p> */}
    </div>
},[])}

    </div>:
    <div className={styles.logform}>
    <h2>Please Login to Admin Panel</h2>
    <input type={"text"} placeholder="Enter Email" onChange={(e)=>{setFormData((res)=>({...res,email:e.target.value}))}}/>
    <input type={"password"} placeholder="Enter Password" onChange={(e)=>{setFormData((res)=>({...res,password:e.target.value}))}}/>
    <button onClick={()=>{
        Authenticate(formData)
    }}>Login</button>
    </div>}</>
}

export default Leads;