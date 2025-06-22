import { useEffect, useState } from 'react';
import styles from './Leads.module.css'
import { supabase } from '../../utils/supabaseClient';
import { CSVLink, CSVDownload } from "react-csv";
import Head from 'next/head';


function Leads(){

const [leads,setLeads] = useState();
const [date,setDate] = useState();
const [form,setForm] = useState();
const [selected,setSelected] = useState([]);

const [pagenumber,setPageNumber] = useState(0);
const [count,setCount] = useState(15)


function getFinalItems(a){

  
        
        const startIndex = pagenumber * count;
        const endIndex = startIndex + count ;
    
        // Ensure startIndex and endIndex are within valid bounds
        const validStartIndex = Math.max(0, Math.min(startIndex, a));
        const validEndIndex = Math.max(0, Math.min(endIndex, a));
    
        return a.slice(startIndex, endIndex );
    
    
}
function convertDateToISO(dateString) {
    console.log(dateString)
    const parts = dateString.split('-');
    
    // Ensure that the input is in the expected format
    if (parts.length !== 3) {
      throw new Error('Invalid date format. Please use dd-mm-yyyy.');
    }
  
    // Parse the date parts and create a new Date object
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-based in JavaScript
    const year = parseInt(parts[0], 10);
  
    const dateObject = new Date(year, month, day);
  
    // Check if the date is valid
    if (isNaN(dateObject.getTime())) {
      throw new Error('Invalid date.');
    }
  
    // Convert the Date object to ISO string
    const isoString = dateObject.toISOString();
  
    return isoString;
  }

useEffect(()=>{

    getLeads()
},[])

async function getLeads(a,b){

const query = supabase.from('pune_leads').select("*")
setSelected([])
    if(a != undefined && b != undefined){

        query.gte('created_at',b).lte('created_at',a).order('created_at',{ascending:false})
    }
    else{
query.order('created_at',{ascending:false}).limit(200)
    }

    const {data,error} = await query;
    if(data){
        setLeads(data)
    }
else if(error){

}
}

function convertUTCtoDateStr(utcTime) {
   // Convert UTC time to a Date object
   const utcDate = new Date(utcTime);

   // Format the output as "dd month name year and time"
   const options = {
       day: '2-digit',
       month: 'long',
       year: 'numeric',
       hour: '2-digit',
       minute: '2-digit',
       second: '2-digit',
       
   };

   const formattedOutput = utcDate.toLocaleString('en-US', options);

   return formattedOutput;
  }


  function getCSVData(a){

    const r = a.map((i,d)=>{
        return leads[parseInt(i)]
    })
    return r
  }

  const headers = [
    { label: "Student Name", key: "name" },
    { label: "Parent Name", key: "parentname" },
    { label: "Contact Number", key: "phone" },
    { label: "Class", key: "class" },
    { label: "Stream", key: "stream" },
    { label: "Area of Residence", key: "area" },
    { label: "Preference", key: "preference" }
  ]

    return <div className={styles.main}>
        <Head><meta name="robots" content="noindex" /></Head>
        <h1 className={styles.heading}>Pune Leads</h1>
        <div className={styles.dates}>
           
        <div>
        <label>Later than</label>
        <input placeholder="End Date" name='enddate' type="date" value={form?.end} onChange={(e)=>{setForm(res=>({...res,end:e.target.value}))}}></input></div>
        <div>
        <label>Earlier than</label>
        <input placeholder="Start Date" name='startdate' type="date" value={form?.start} onChange={(e)=>{setForm(res=>({...res,start:e.target.value}))}}></input></div>
       <div className={styles.filter} onClick={()=>{getLeads(convertDateToISO(form?.start),convertDateToISO(form?.end))}}>Apply Filter</div>
       {selected != undefined && selected?.length > 0 ?  <CSVLink data={selected != undefined ? getCSVData(selected):[]} headers={headers}><div className={styles.csv}>Download CSV</div></CSVLink>:''}
        </div>
        <div className={styles.mainwrap}>

        <div className={styles.header}>
            <input type="checkbox" onChange={(e)=>{e.target.checked ? setSelected(leads.map((i,d)=>{return d})) : setSelected([])}}></input>
            <h2>Date</h2>
            <h2>Name</h2>
            <h2>Parent Name</h2>
            <h2>Contact</h2>
           
            <h2>Class</h2>
            <h2>Stream</h2>
            <h2>Area</h2>
            <h2>Preference</h2>
        </div>
       {leads && getFinalItems(leads).map((i,d)=>{
        return  <div className={styles.lead}>
             <input type="checkbox" checked={selected && selected?.includes(d)} onChange={(e)=>{e.target.checked ? setSelected(res=>([...res,d])):setSelected(selected.filter(item => item !== d))}}></input>
             <p>{convertUTCtoDateStr(i?.created_at) || "Not Found"}</p>
        <p>{i?.name || "Not Found"}</p>
            <p>{i?.parentname || "Not Found"}</p>
            <p>{i?.phone || "Not Found"}</p>
            <p>{i?.clas || "Not Found"}</p>
           
            <p>{i?.stream || "Not Found"}</p>
            <p>{i?.area || "Not Found"}</p>
            <p>{i?.preference || "Not Found"}</p>
           

        </div>
       })}

<div className={styles.paginate}>
       <div onClick={()=>{setPageNumber(res=>res-1)}}
        disabled={pagenumber && pagenumber > 0 ? false : true} className={styles.prev}><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.707 4.293a1 1 0 0 1 0 1.414L9.414 12l6.293 6.293a1 1 0 0 1-1.414 1.414l-7-7a1 1 0 0 1 0-1.414l7-7a1 1 0 0 1 1.414 0Z" fill="#000"/></svg></div>
        {leads && leads?.length &&
            Array(Math.ceil(leads?.length/count)).fill().map((i,d)=>{
                return <div onClick={()=>{setPageNumber(d)}} className={styles.page + " " + (d == pagenumber ? styles.pagination_active :'' )}>{d+1}</div>
            })
        }
      <div className={styles.next} onClick={()=>{setPageNumber(res=>res+1)}}
       disabled={pagenumber != undefined && pagenumber < Math.round(leads?.length/count) - 1 ? false : true}
       ><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.293 4.293a1 1 0 0 0 0 1.414L14.586 12l-6.293 6.293a1 1 0 1 0 1.414 1.414l7-7a1 1 0 0 0 0-1.414l-7-7a1 1 0 0 0-1.414 0Z" fill="#000"/></svg></div>
     </div>
    </div>
    
 
  
    </div>
}

export default Leads;