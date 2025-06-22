import { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { supabase } from "../../../../utils/supabaseClient";

import { toast } from 'react-hot-toast';
import { Button, Input } from "@nextui-org/react";
import axios from 'axios'
import {useRouter} from 'next/router'
export default function Accept({from,to}){


const [loading,setLoading] = useState(true)
const [data,setData] = useState();
const [toData,setToData] = useState();
const [accepted,setAccepted] = useState(false);
const [isAccepted,setIsAccepted] = useState(false)
const [formData,setFormData] = useState()
useEffect(()=>{
    getData()
    getAccepted()
    getToData()
},[])

async function getAccepted(){

    const {data,error} = await supabase.from('admit_connects ').select('accepted').eq('from',from).eq('to',to);
    if(data){
        setAccepted(data[0].accepted)
    }
    if(error){

    }
}

async function getData(){

    const {data,error} =await supabase.from('admit_cards').select('appno,name,id,created_at').eq('uid',from)
    if(data){
        setData(data[0])
        setLoading(false)
    }
    if(error){
        setLoading(false)
        toast.error('Unable to Load Request')
    }
}


async function getToData(){

    const {data,error} =await supabase.from('admit_cards').select('appno,name,id,created_at').eq('uid',to)
    if(data){
        setToData(data[0])
        setLoading(false)
    }
    if(error){
        setLoading(false)
        toast.error('Unable to Load Request')
    }
}



async function acceptRequest(){


    const r = toast.loading('Submitting Accept Request');
    try {
        const { data } = await axios.post('/api/acceptRequest', {
            from: from,
            to: to,
            password: formData?.password
        });
        if (data) {
            setIsAccepted(true);
            toast.remove(r);
            toast.success(data?.data?.message);
        }
    } catch (error) {
        toast.remove(r);
        
        toast.error(error.response.data.error.message);
    }
    
}



if(accepted) {

    return <div className="w-full flex flex-col justify-center items-center bg-gray-200 h-screen">
        <div className="max-w-[800px] w-full p-4 rounded-lg shadow-md bg-white font-sans text-sm text-center">

            This request has already been accepted and the chat link was shared to both parties on their emails.
        </div>

    </div>
}


    return <div className={"w-full font-sans h-screen flex flex-col justify-center  transition-all ease-in-out items-center "+(isAccepted ? ' bg-green-400':'') }>
       {loading ? <div className="w-6 h-6 animate-spin"><img src="/load.png" /></div>:''}
       {!loading && data ? <div className="w-full max-w-[600px] bg-white shadow-md flex flex-col justify-center items-center rounded-lg p-4 min-h-[200px]">
      
      {isAccepted ? <div className="text-center justify-center items-center flex flex-col">
        <h2 className="text-2xl text-primary font-bold text-center">Accepted! Thank you</h2>
        <p className="text-sm">Check your Email for the chat link.</p>
      </div>:<>
        <h2 className="text-lg font-bold">{data.name} wants to connect with you.</h2>
        <p className="text-sm">Please accept the request to start talking.</p>
        <h2 className="m-1 p-1 rounded-md border-1 border-secondary bg-primary text-white text-sm px-4 my-2">Your Application No : {toData?.appno}</h2>
        <Input maxLength={10} onChange={(e)=>{setFormData(res=>({...res,password:e.target.value}))}} size="sm" className="my-2 mx-auto" placeholder="Enter Password on Admit Card to Accept"></Input>
        <Button size="sm" color="secondary" onPress={()=>{acceptRequest()}}>Accept Request</Button></>}
       
       
       </div>:''}
       
    </div>
}


export async function getServerSideProps(context) {
    const { from, to } = context.query;
    const targetFrom = from.replace('.js', ''); // Clean up the 'from' parameter if needed
    const targetTo = to;

    // Construct the redirect URL on the target domain with the same path
    const redirectUrl = `https://cattutorials.com/accept/request/${targetFrom}/${targetTo}`;

    // Return a redirect response
    return {
        redirect: {
            destination: redirectUrl,
            permanent: false // Set to true if this should be a permanent redirect (301)
        }
    };
}