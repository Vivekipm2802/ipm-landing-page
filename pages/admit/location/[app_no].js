import { useEffect, useState } from "react"
import { supabase, supabaseServer } from "../../../utils/supabaseClient"
import "tailwindcss/tailwind.css";
import { CtoLocal } from "../../../utils/DateUtil";
import { toast } from "react-hot-toast";
import { Button, Divider, Spinner } from "@nextui-org/react";
import Link from "next/link";
import axios from "axios";
export default function Track({data}){

    const [bgActive,setBGActive] = useState(false)
const [dat,setDat] = useState()
const [distance,setDistance] = useState(<Spinner color="white"></Spinner>)



const z= data;
async function getData(){
    
    const  {data,error} = await supabaseServer.from('admit_cards').select('*').eq('appno',z.application_no).limit(1).single()
    if(data){
        setDat(data)
        getDistance(z,data)
    }if(error){
        
    }
}

useEffect(()=>{
    getData()
},[])



async function getDistance(a,v){
const l = `${a.address}, ${a.state}`;
const m =`${v?.data?.tData?.location}`;

function r(inputString) {
    // Replace commas with spaces and forward slashes with plus signs
    return inputString.replace(/,/g, ' ').replace(/\//g, '+');
}

    
    const d = await axios.post('https://generate.your-domain.com/getDistance',{
        "place1":r(l),
        "place2":r(m)
    })

    if(d.data){
        setDistance(d.data.distance)
    }
}

    return <div className="sf bg-gray-200 font-sans w-full h-full fixed min-h-[100vh] flex flex-col items-stretch align-middle justify-center p-2 lg:p-5">


       
    <div className="w-full h-full absolute left-0 top-0 z-0 bg-repeat bg-[size:400px] mix-blend-multiply opacity-20" style={{backgroundImage:'url("/grid.jpg")'}}></div>
    
    <div className={"w-full z-10 max-w-[800px] mx-auto  h-full min-h-[95vh] p-4  lg:p-8 flex flex-col items-center align-middle justify-center " + (bgActive == true ?"rounded-md shadow-md bg-white" :'') }>
    <div className="flex-0 w-full flex flex-row justify-between">
<img src="/ipm_logo.svg" width={250}/></div>
<div className="flex flex-1 flex-col flex-wrap w-full justify-center items-center">
<div className="w-full rounded-2xl shadow-md bg-white p-4 py-6">

<h2 className="text-2xl text-primary font-bold">Distance from your location<br/> to your Centre</h2>
<div className="border-1  shadow-md text-sm p-3 rounded-md my-2">
{dat != undefined ? <>
    <h2 className="my-1"><strong className="text-primary">Name</strong> : {dat.name}</h2>
    <Divider></Divider>
    <h2 className="my-1"><strong className="text-primary">Application Number</strong> : {dat.appno}</h2>
    
    
    </>
:''}

<h2 className="my-1"><strong className="text-primary">Your Address</strong>:</h2>
<p>{z.address},{z.city},{z.state} - {z.pincode}</p>

</div>

<div className="w-full rounded-xl p-3 px-5 bg-gradient-purple min-h-[150px] items-start justify-center flex flex-col">
   
    <h2 className="text-2xl text-white font-bold">Distance from your home to center is : {distance}</h2>

</div>

</div>
</div>
<div className="flex-0 h-[80px] w-full"></div>

  
    </div></div>
}

export async function getServerSideProps(context){

const number = context.query.app_no;



const {data,error} = await supabaseServer.from('print_requests').select('*').eq('application_no',number).single()

if(data){

    console.log(data)
}


if(error){
   console.log(error)
return {notFound:true}
}



    return {props:{
        data:data
    }}
}