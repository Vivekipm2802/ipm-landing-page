import { useEffect, useState } from 'react';
import CustomSelect from '../components/CustomSelect';
import { supabase } from '../utils/supabaseClient';

import styles from './Leads.module.css'


function Leads(){

const [leads,setLeads] = useState();

async function getLeads(){
    const {data,error} = await supabase.from('ipm_leads').select('*');

    if(data){
        console.log(data)
        setLeads(data)
    }
}

useEffect(() => {
 

    
}, [])

function getLocalDate(a){
    const b = new Date(a);
    return [ b.toLocaleTimeString()   ,b.toLocaleDateString() ];
}


    return <div className={styles.main}>
       

    </div>
}

export default Leads;