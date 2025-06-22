import { useState } from "react";
import CustomSelect from "../components/CustomSelect";
import Timer from "../components/Timer";
import styles from './TestPredictor.module.css'
import axios from "axios";

function TestPredictor(){


    const [data,setData] = useState();
    const [formData,setFormData] = useState();
    const [loading,setLoading] = useState(false)
    const categories = [
        
        { value: 'gen', title: 'GEN' },
        { value: 'ews', title: 'EWS' },
        { value: 'obc', title: 'OBC' },
        { value: 'pwd', title: 'PWD' },
        { value: 'sc', title: 'SC' },
        { value: 'st', title: 'ST' }
      ] 

      function TestApi(){
setLoading(true)
        axios.post('/api/predictor', formData)
        .then(response => {
          // Handle successful response
         
          setData(response?.data?.colleges)
          setLoading(false)
        })
        .catch(error => {
          // Handle error
          setLoading(false)
         
        })
      }

    return <>
    <div className={styles.mainholder}>
   
  {/*  <input className={styles.input} placeholder="Enter QA Marks" name="va" type="number" min={20} max={200} onChange={(e)=>{setFormData(res=>({...res,qa:e.target.value}))}}></input>
   <input className={styles.input} placeholder="Enter SA Marks" name="va" type="number" min={20} max={200} onChange={(e)=>{setFormData(res=>({...res,sa:e.target.value}))}}></input>
   <input className={styles.input} placeholder="Enter VA Marks" name="va" type="number" min={20} max={200} onChange={(e)=>{setFormData(res=>({...res,va:e.target.value}))}}></input>
   <CustomSelect mainout defaultText={'Select Category'} objects={
    categories
   } setSelect={(e)=>{setFormData(res=>({...res,category:e}))}}/>
   <button className={styles.sp} onClick={()=>{TestApi()}}>Submit & Test</button>


   {data? 
   <div>
    {data && data.map((i,d)=>{
        return <li>{i}</li>
    })}
    </div>
   :''} */}
   </div>
    </>
}

export default TestPredictor;