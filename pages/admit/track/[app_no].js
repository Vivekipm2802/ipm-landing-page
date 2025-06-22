import { useEffect, useState } from "react"
import { supabase, supabaseServer } from "../../../utils/supabaseClient"
import "tailwindcss/tailwind.css";
import { CtoLocal } from "../../../utils/DateUtil";
import { toast } from "react-hot-toast";
import { Button, Divider } from "@nextui-org/react";
import Link from "next/link";
export default function Track({data}){

    const [bgActive,setBGActive] = useState(false)
const [dat,setDat] = useState()
const z= data;
async function getData(){
    
    const  {data,error} = await supabaseServer.from('admit_cards').select('*').eq('appno',z.application_no).limit(1).single()
    if(data){
        setDat(data)
    }if(error){
        
    }
}

useEffect(()=>{
    getData()
},[])

    return <div className="sf bg-gray-200 font-sans w-full h-full fixed min-h-[100vh] flex flex-col items-stretch align-middle justify-center p-2 lg:p-5">


       
    <div className="w-full h-full absolute left-0 top-0 z-0 bg-repeat bg-[size:400px] mix-blend-multiply opacity-20" style={{backgroundImage:'url("/grid.jpg")'}}></div>
    
    <div className={"w-full z-10 max-w-[800px] mx-auto  h-full min-h-[95vh] p-4  lg:p-8 flex flex-col items-center align-middle justify-center " + (bgActive == true ?"rounded-md shadow-md bg-white" :'') }>
    <div className="flex-0 w-full flex flex-row justify-between">
<img src="/ipm_logo.svg" width={250}/></div>
<div className="flex flex-1 flex-col flex-wrap w-full justify-center items-center">
<div className="w-full rounded-2xl shadow-md bg-white p-4 py-6">

<h2 className="text-2xl text-primary font-bold">Your Admit Card<br/>Print Status</h2>
<div className="border-1  shadow-md text-sm p-3 rounded-md my-2">
{dat != undefined ? <>
    <h2 className="my-1"><strong className="text-primary">Name</strong> : {dat.name}</h2>
    <Divider></Divider>
    <h2 className="my-1"><strong className="text-primary">Application Number</strong> : {dat.appno}</h2>
    <Divider></Divider>
    
    </>
:''}
<h2 className="my-1"><strong className="text-primary">Submitted</strong> : {CtoLocal(data.created_at).dayName} , {CtoLocal(data.created_at).date} {CtoLocal(data.created_at).monthName}, {CtoLocal(data.created_at).year}</h2>
<Divider></Divider>
{data?.tracking == undefined ? <h2 className="my-1"><strong className="text-primary">Status</strong> : {data.status} | You will receive tracking link soon</h2>:''}
{data?.tracking  != undefined ? <div className="p-4 rounded-md bg-gradient-purple text-white flex flex-row items-center justify-center">
    <h2 className="text-lg font-medium">Tracking Your Shipment : </h2>
    <Button className="bg-white ml-4 text-primary font-medium" as={Link} href={data.tracking} target="_blank">Track Now</Button>
</div>:''}
</div>

<div className="w-full rounded-xl p-3 px-5 bg-gradient-purple min-h-[150px] items-start justify-center flex flex-col">
    <p className="text-secondary">#1 IPMAT Coaching in India</p>
    <h2 className="text-2xl text-white font-bold">Explore our Courses</h2>
<Button size="sm" as={Link} target="_blank" href="https://ipmcareer.com/courses" className="mt-2 text-primary bg-white">Explore Now</Button>
</div>

</div>
</div>
<div className="flex-0 h-[80px] w-full"></div>

  
    </div></div>
}

export async function getServerSideProps(context){

const number = context.query.app_no



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