
import { Button, Input, ScrollShadow, Spacer } from "@nextui-org/react";
import { supabase, supabaseServer } from "../../../../utils/supabaseClient";
import "tailwindcss/tailwind.css";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export default function Chat({id,uid,data}){

const [messages,setMessages] = useState()
const [isFrom,setIsFrom] = useState();
const [formData,setFormData] = useState() 

function handleUpdate(a){

    console.log(a)
}
const t= data;




async function sendMessage(a){

    const r = toast.loading('Sending Message')
    const {data,error} = await supabase.from('admit_messages').insert({
        chat_id:id,
       content:a?.message,
       from:uid
    }).select()
    if(data){
        toast.success('Sent Successfully')
        setFormData()
        scrollToBottom()
        toast.remove(r)
    }
}

async function getChats(){

    const {data,error} = await supabase.from('admit_messages').select('*').eq('chat_id',id);
    if(data){
        setMessages(data)
    }if(error){
        toast.error('Unable to Load Previous Chats')
    }
}

useEffect(()=>{
    supabase
    .channel('room1')
    .on('postgres_changes', { event: 'INSERT', schema: 'public' , table:'admit_messages' }, payload => {
      setMessages(res=>([...res,payload.new])),scrollToBottom()
    })
    .subscribe()
},[])

useEffect(()=>{
getChats()
setType()

},[])
const bottomRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current.scrollHeight + 200;
    }
  };
function setType(){

    if(uid == data.from.uid){
        setIsFrom(true)
    }
    else{
        setIsFrom(false)
    }
}

if(isFrom == undefined){
    return <div></div>
}
const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
     sendMessage(formData)
    }
  }
 
return <div className="w-full  h-screen bg-gray-200 p-2 font-sans flex flex-col justify-center items-center">
    <div className="bg-white w-full max-w-[500px] p-4 flex flex-col shadow-md rounded-xl min-h-[200px] ">
        <div>
            <img className="w-[200px] h-auto" src="/ipm_logo.svg"/>
        </div>
        <Spacer y={4}></Spacer>
        <div className="border-1 border-green-600 bg-green-200 flex flex-row text-xs font-medium items-center mr-auto mb-2 px-4 rounded-full">
            <p>{data.from.name}</p>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.502 3.003a3.5 3.5 0 0 0-3.5 3.5v6a3.5 3.5 0 0 0 3.5 3.5H7v-2h-.497a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-1.506v2h1.506a3.5 3.5 0 0 0 3.5-3.5v-6a3.5 3.5 0 0 0-3.5-3.5h-6Z" fill="#222F3D"/><path d="M10 11.5a1.5 1.5 0 0 1 1.5-1.5h1.499V8H11.5A3.5 3.5 0 0 0 8 11.5v6a3.5 3.5 0 0 0 3.5 3.5h6a3.5 3.5 0 0 0 3.5-3.5v-6A3.5 3.5 0 0 0 17.5 8h-.495v2h.495a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-6Z" fill="#222F3D"/></svg>
            <p>{data.to.name}</p>
        </div>
<h2 className="text-xs text-gray-500">You both share same centre : {data.from.location.split(',')[0]}</h2>
<ScrollShadow ref={bottomRef}>
        <div className="p-4 rounded-lg bg-gray-100 my-2 min-h-[60vh] overflow-y-auto flex-1 flex flex-col justify-end items-start" x>

{
    messages && messages.map((i,d)=>{
        return <Bubble uid={uid} data={i}></Bubble>
            
    })
}
        </div>
        </ScrollShadow>
        <div className="flex flex-row">
            <Input value={formData?.message} onKeyDown={handleKeyDown} placeholder="Enter your message...." size="sm" onChange={(e)=>{setFormData(res=>({...res,message:e.target.value}))}}></Input>
            <Button size="sm" className="ml-4 rounded-full p-2 bg-gradient-purple text-white" isIconOnly onPress={()=>{sendMessage(formData)}}><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.815 12.197-7.532 1.256a.5.5 0 0 0-.386.318L2.3 20.728c-.248.64.421 1.25 1.035.943l18-9a.75.75 0 0 0 0-1.342l-18-9c-.614-.307-1.283.304-1.035.943l2.598 6.957a.5.5 0 0 0 .386.319l7.532 1.255a.2.2 0 0 1 0 .394Z" fill="#fff"/></svg></Button>
        </div>
    </div>
</div>



}

const Bubble = ({data,align,uid})=>{


    return <div className={"w-full flex flex-col justify-center text-xs " + (uid == data.from ? ' items-end':' items-start')}>
{uid == data.from ? <div className=" bg-gradient-purple rounded-l-xl rounded-br-xl p-2 px-4 my-1 w-auto relative text-white">
<div className="  w-2 h-2 absolute bg-primary -right-1 rotate-45 top-1"></div>
    {data.content}
    
    </div>
    
    :<div className=" bg-gray-300 relative rounded-r-xl rounded-bl-xl p-2 px-4 my-1">
    <div className=" bg-gray-300 w-2 h-2 absolute -left-1 rotate-45 top-1"></div>
    {data.content}</div>}
    </div>
}

export async function getServerSideProps(context){

    const {id,uid} = context.query;


    const {data,error} = await supabaseServer.from('admit_connects').select('*,from(name,appno,location,uid),to(name,appno,location,uid)').eq('id',id)
    if(data == undefined || data?.length ==0){
return {notFound:true}
    }

    if(error){
        return {notFound:true}
    }

    console.log(data)

    return {props:{id:id.replace('.js',''),uid:uid,data:data[0]}}
}