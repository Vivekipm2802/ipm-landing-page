



import { Avatar, Button, ButtonGroup, Checkbox, Chip, Divider, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spacer, Spinner } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import "tailwindcss/tailwind.css";
import axios from "axios";
import { cities } from "../utils/cities";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import ShareButton from "../components/ShareButton";
import { Document, Page ,pdfjs,View} from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import 'swiper/css'
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay'


function AdmitCard({isContinue}){


const [loading,setLoading] = useState(false);
const [bgActive,setBGActive] = useState(true)
const [activeButton,setActiveButton] = useState(0);
const [formData,setFormData] = useState() 
const [open,setOpen] = useState(false)
const [testing,setTesting] = useState(false)
const isDev = process.env.NODE_ENV == "development";
const [url,setURL] = useState();
const [count,setCount] = useState()
const [data,setData] = useState();
const [rawData,setRawData] = useState()
const [isSubmitted,setSubmitted] = useState(false);
const [filename,setFileName] = useState();
const [isPrint,setIsPrint] = useState(false);
const [aspirants,setAspirants] = useState()
const [tipsModal,setTipsModal] = useState(false)
const [tips,setTips] = useState(false)
const [callCount, setCallCount] = useState(0);
const [sent,setSent] = useState([])
const [consent,setConsent] = useState(false)


const router = useRouter()

function isValidURL(url) {
    // Regular expression to match URLs
    var urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
    
    // Test the URL against the pattern
    return urlPattern.test(url);
}
function isValidEmail(email) {
   
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
  
    return emailPattern.test(email);
}
function isValidPhoneNumber(phoneNumber) {
    // Regular expression to match phone numbers (supports various formats)
    var phonePattern = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
    
    // Test the phone number against the pattern
    return phonePattern.test(phoneNumber);
}
useEffect(()=>{
    getCount()
},[])
async function getCount(){

    const{data,error} = await supabase.from('admit_cards').select('id',{count:true})
    if(data){
        setCount(data.length)
    }else{}
}
useEffect(()=>{

    if(router?.query?.continue != undefined){

        checkNumber(router.query.continue)
    }
    if(router.query.testing != undefined){
        setTesting(true)
    }
},[router])
useEffect(() => {
    // Define your getAspirants function here
   
if(data != undefined && rawData != undefined && aspirants == undefined && callCount < 10){
    // Run the getAspirants function every 5 seconds
    const intervalId = setInterval(async () => {
      await getAspirants(data.uid);
      setCallCount(res=>res+1)
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup function
    return () => {
      clearInterval(intervalId); // Clear the interval on component unmount
    };
}}, [data]);

async function checkNumber(a){

    const {data,error} = await supabase.from('admit_cards').select('*').eq('uid',a);
    if(data && data?.length > 0 ){

        setRawData(data[0].data)
        setData(data[0])
    }
 
   
}

async function getData(a){

    const {data,error} = await supabase.from('admit_cards').select('*').eq('appno',a)
    if(data){
        setData([data[0]])
    }if(error){
        toast.error('Error Occured')
    }
}

async function getAdmit(url,a){

    if(url == undefined || !isValidURL(url)){
toast.error('URL is Empty or Invalid')
        return null
    }
if(a == undefined){
    toast.error('Please fill all the details')
    return null
}
if(!a?.email || !isValidEmail(a?.email)){
    toast.error('Email invalid or Empty')
    return null
}
if(!a?.phone || !isValidPhoneNumber(a?.phone)){
    toast.error('Phone invalid or Empty')
    return null
}
    setLoading(true)
   const {data,success} = await axios.post('/api/getAdmit',{url:url,
email:a.email,
phone:a.phone,

})
   if(data){
toast.success('Successfully fetched your Admit Card Details')
setData(data.data)
setLoading(false)
   }
   if(success == false){
    toast.error('Unable to get your Admit Card Details !! Please check your URL')
    setLoading(false)
   }

}

function cityUtility(){

    const data = cities;
    return {
        getStates:()=>{
            return Object.keys(data).sort((a, b) => a.localeCompare(b))
        },
        getCities:(e)=>{
            if(e == undefined){
                return []
            }
            return data[e]
        }
    }
}

async function submitPrintRequest(a,b,c,d){
    
if(a == undefined){
toast.error('Please fill all the details.')
    return null
}

if(!a?.address){
    toast.error('Please fill your Address')
        return null
    }
    if(!a?.state){
        toast.error('Please select your state')
            return null
        }
        if(!a?.city){
            toast.error('Please select your city')
                return null
            }
            if(!a?.pincode || a?.pincode?.length < 6){
                toast.error('Please enter a valid pincode')
                    return null
                }
    if(b == undefined){
        toast.error('Application Number missing , please try reloading page ')
        return null
    }


    setLoading(true)
    const r = toast.loading('Submitting Request')
    const {data,error} = await supabase.from('print_requests').insert({
        address:a.address,
        state:a.state,
        city:a.city,
        pincode:a.pincode,
        uid:c,
        application_no:b
    }).select()

    if(data){
toast.success('Successfully Submitted your Request')
        toast.remove(r)
        setLoading(false)
        setSubmitted(true)
    }
    if(error){
        if(error.code == 23505){
            toast.error('Your print request already exists! We will update your status soon')
            toast.remove(r)
            setLoading(false)
            return null

        }
        toast.remove(r)
        toast.error('Error Occured')
        setLoading(false)
    }
}
const [text, setText] = useState('');
/* 
const extractTextFromPDF = async (pdfUrl) => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    const loadingTask = pdfjs.getDocument(pdfUrl);
    try {
      const pdf = await loadingTask.promise;
      let pdfText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        content.items.forEach(item => {
          pdfText += item.str + ' ';
        });
      }
      setText(pdfText);
    } catch (error) {
      console.error('Error while extracting text:', error);
    }
  }; */


async function uploadPDF(a){




  
    setLoading(true)
    if(!a){
        alert('File Empty')
        setLoading(false)
return 
    }
    if (a.size > 1548576) {
        alert('File size exceeds the limit of 1.5MB');
        setLoading(false)
        return; // Stop executing the function
      }


     setFileName(a?.name || 'your_filename.pdf') 

     

     
    const imageData = new FormData;
    
    
    imageData.append('field',a);
    imageData.append('title','Test')
 
    
    axios.post('https://supabase.pockethost.io/api/collections/pdfsd/records',imageData,{
        headers: {
            
            'Content-Type': 'multipart/form-data'
          }
    }).then(resa=>{
        setLoading(false)
        const r = resa.data;
        loadPDFData(`https://supabase.pockethost.io/api/files/${r.collectionId}/${r.id}/${r.field}`)
        setFileName(r.field)
      
    }).catch(res=>{
        setLoading(false)
    })
    
    
    
    }

    async function loadPDFData(a){

        setRawData()
        if(a == undefined){
            toast.error('Error reading admit card please upload different file')
            return null
        }
        const r  = toast.loading('Reading your Admit Card')
        await axios.post('https://pdfreader-vxz5.onrender.com/pdfReader',{
            url:a
        }).then(res=>{
            toast.success('Successfully Read your Admit Card')
            setRawData(res.data)
            setFileName(`${res?.data?.sData?.name || 'user'}'s Admit Card`)
            setFormData(res=>({...res,pdfurl:a}))
            toast.remove(r)
        }).catch(err=>{

            toast.error('Only IPMAT Indore Admit Card PDF allowed')
            setFileName()
            setRawData()
            toast.remove(r)

        })

       
    }
    async function uploadData(a,b){
        if(!consent){
            toast.error('Please check Terms & Conditions Consent Box')
            return null
        }
        if(b == undefined || a == undefined ){
toast.error('Please upload your Admit Card PDF & wait for scanning')
            return null
        }
        const r= toast.loading('Uploading Data');
        const{data,error} = await supabase.from('admit_cards').insert({
            url:a?.pdfurl,
            phone:a?.phone,
            email:a?.email,
            name:b?.sData?.name,
            data:b,
        }).select();
        if(data){
            
            setData(data[0]);
            
            getAspirants(data[0].uid)
            toast.success('Successfully Uploaded Data')
            toast.remove(r)
        }
        if(error){
            toast.error('Unable to Upload Data , Please try again')
            toast.remove(r)
        }

    }
async function loadTips(){

  
    const {data,error} = await supabase.from('experts_tips').select('*');
    if(data){
        setTips(data)
        setTipsModal(true)
    }
    if(error){
        toast.error("Error Loading Tips")
    }
}
    async function getAspirants(a){
        if(callCount >10){
            toast.error('No Aspirant Found even after refresh.')
            return null

        }
        
if(a== undefined){
  /*   toast.error('Admit Card ID not found') */

}
        const r = toast.loading('Loading Common Apsirants')
        const {data,error} = await supabase.rpc('get_admit_cards',{unique_id:a})
        if(data){
            setAspirants(data)
            toast.remove(r)
            /* toast.success('Refreshed Aspirants List') */
        }
        if(error){
            toast.remove(r)
             

        }
    }



function getUnique(a){

    if(a == undefined){
        return []
    }
    const uniqueAppnoMap = new Map();

  // Loop through each object in the array
  a.forEach(obj => {
    // Check if the appno already exists in the map
    if (!uniqueAppnoMap.has(obj.appno)) {
      // If not, add it to the map
      uniqueAppnoMap.set(obj.appno, obj);
    }
  });

  // Extract the values (objects) from the map
  const uniqueAppnos = Array.from(uniqueAppnoMap.values());

  return uniqueAppnos.filter(item=>item.appno != data.appno);
}
const y= data;
async function connectFriend(a){

    if(a == undefined || !y?.uid == undefined){
        toast.error('Data Missing')
        return null
    }
    const r= toast.loading('Sending Connection Request')
    const{data,error} = await supabase.from('admit_connects').insert({
        from:y.uid,
        to:a
    }).select()

    if(data){
toast.remove(r)
setSent(res=>([...res,a]))
        toast.success('Successfully Sent Request')
    }
    if(error){
        toast.remove(r)
        if(error.code == "23505"){
            toast.error('You have already sent this user connect request')
            return null
        }
        toast.error('Unable to Connect Please Check Again Later')
    }
}

/* if( !isDev && !testing ){
    return <div className='w-full font-sans h-full min-h-[100vh] bg-white flex flex-col justify-center items-center align-middle'>
  <div className="fixed  top-8 left-0 w-full object-contain px-12" >
    <img src="/ipm_logo.svg" className="max-w-[200px]"/>
  </div>

<h2 className="font-bold text-xl my-4 text-center text-primary">IPMAT Special Admit Card Tool</h2>
<Button>Coming Soon</Button>
    
      </div>
} */


    return <div className="sf bg-gray-200 font-sans w-full h-full min-h-[100vh] flex flex-col items-stretch align-middle justify-center p-2 lg:p-5">
<Modal isOpen={tipsModal} onClose={()=>{setTipsModal(false)}}>
            <ModalContent  className="overflow-hidden font-sans">
                <ModalHeader>
                    Tips shared by the Experts
                </ModalHeader>
                <ModalBody >
                    {tips == undefined || tips.length == 0 ? <div className="w-full">No Tips Available Right Now</div> :''}
              {tips && tips.map((i,d)=>{
                return <div className="border-green-500 flex flex-row items-center bg-green-200 text-xs p-2 rounded-md mb-1 border-1"><strong className="mr-1">{d+1}. </strong> <div  dangerouslySetInnerHTML={{__html:i.content}}></div></div>
              })}
                </ModalBody>
                <ModalFooter></ModalFooter>
            </ModalContent>
        </Modal>
<Modal isOpen={open} onClose={()=>{setOpen(false)}}>
            <ModalContent  className="overflow-hidden">
                <ModalHeader>
                    {rawData?.sData?.name}'s Admit Card 
                </ModalHeader>
                <ModalBody >
                    
               {data != undefined ? 
                <div className="w-full h-full aspect-[1/1.4] z-0 overflow-hidden relative">
                    <Spinner className="absolute z-0 left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2"></Spinner>
    <iframe className="w-full h-full z-20 bg-white relative" src={data.url+"#toolbar=0&navpanes=0"}></iframe>   
    </div>:''}
                </ModalBody>
                <ModalFooter></ModalFooter>
            </ModalContent>
        </Modal>

<NextSeo
        title={'IPMAT Admit Card Tool | Get your IPMAT Admit Cards Printed for FREE!!'}
        description={'Generate your Special IPMAT Admit Card for FREE with extra tips , tracker, navigator and a lot more...'}
        openGraph={{
          title: 'IPMAT Admit Card Tool | Get your IPMAT Admit Cards Printed for FREE!!',
          description: 'Generate your Special IPMAT Admit Card for FREE with extra tips , tracker, navigator and a lot more...',
          images: [
            {
              url: '/admitool.png',
              width: 1200,
              height: 630,
              alt: 'IPM Careers Admit Card Tool'
            }
          ]
        }}
      />

       
<div className="w-full h-full absolute left-0 top-0 z-0 bg-repeat bg-[size:400px] mix-blend-multiply opacity-20" style={{backgroundImage:'url("/grid.jpg")'}}></div>

<div className={"w-full z-10  mx-auto flex-1 md:flex-0  h-full min-h-[95vh] p-4  lg:p-8 flex flex-col items-center align-middle justify-center " + (bgActive == true ?"rounded-2xl shadow-md bg-white" :'') }>
<div className="flex-0 w-full mb-2 md:flex flex-row justify-between">
<img src="/ipm_logo.svg" width={250}/>
<div></div>
</div>
<div className="flex-1 w-full flex flex-col items-center align-middle justify-center z-0">
    {data != undefined && !isSubmitted ? 
    <div className="flex md:hidden w-full h-[40vh] sticky top-0 flex-col ">
    <CentrePreview data={data}></CentrePreview>
    </div>:''}
    <div className="w-full flex bg-white z-10 flex-col md:flex-row">
   <div className="w-full  flex-1 items-start justify-start md:justify-center flex flex-col z-20  rounded-2xl p-0 md:p-4 py-6">
    {data == undefined && isContinue ? <div className="flex flex-row items-center justify-start">
        <Spinner></Spinner> Loading Data...
        </div>:''}
    {data == undefined && !isContinue ? <>
    <h2 className="text-2xl font-bold text-left text-black">Get your Special <br/><span className="text-primary">IPMAT Admit Card Now!!</span></h2>
    <Spacer y={2}></Spacer>    

<div className="w-full flex flex-row justify-start items-center relative my-2 p-4 bg-gray-100 hover:border-secondary border-1 border-transparent cursor-pointer rounded-lg">
    <div className="w-full flex flex-row pointer-events-none  h-full items-center justify-start">
        <h2 className={"text-sm font-bold " + (rawData || filename ? 'border-1  p-1 border-primary rounded-xl flex flex-row items-center px-4 bg-gray-200': '')}>
            {filename || rawData?  <svg className="mr-2" width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6a2 2 0 0 0 2 2h6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h6Z" fill="#222F3D"/><path d="M13.5 2.5V8a.5.5 0 0 0 .5.5h5.5l-6-6Z" fill="#222F3D"/></svg>:''}
            {filename == undefined ? 'Click Here to Upload your Admit Card PDF':filename}
      
        </h2>
       {rawData ? <div className="ml-auto flex flex-row justify-end items-center">
       <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.22 6.97-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06Z" fill="#2ECC70"/></svg>
       </div>:''}
        {loading ?  <Spinner className="ml-4" size="sm"></Spinner>:''}
    </div>
    <input onChange={(e)=>{uploadPDF(e.target.files[0])}}  type="file" accept=".pdf" className="w-full opacity-0 h-full flex flex-row cursor-pointer absolute left-0 top-0 "></input>
</div>
   {/* <Input value={url} 
   endContent={isValidURL(url || '')  ? <Tick></Tick>:''}
   size="sm" name="admit" className="font-sans mb-2" label="Admin Card URL" placeholder="Enter Admit Card URL (ends with .html)" onChange={(e)=>{setURL(e.target.value)}}></Input> */}
   <Input value={formData?.email} size="sm" name="email" className="font-sans mb-2"
   endContent={isValidEmail(formData?.email || '')  ? <Tick></Tick>:''}
   label="Email Address" placeholder="Enter your Email Address" onChange={(e)=>{setFormData(res=>({...res,email:e.target.value}))}}></Input>
   <Input name="phone" 
    endContent={isValidPhoneNumber(formData?.phone || '')  ? <Tick></Tick>:''}
   size="sm" className="font-sans mb-2" label="Phone Number" placeholder="Enter your Phone Number" onChange={(e)=>{setFormData(res=>({...res,phone:e.target.value}))}}></Input>
  <div className="text-sm flex flex-row items-center justify-start">
    <Checkbox isSelected={consent} onValueChange={(e)=>{setConsent(e)}} color="secondary" size="sm"></Checkbox>
    I have read all <Link href="/admit/tnc" target="_blank" className="text-sm ml-1">Terms & Conditions</Link>
  </div>
   <Spacer y={2}></Spacer>
   <div className="bg-secondary p-2 text-sm font-bold rounded-md w-full animate-pulse">
{count+551 || 'Loading..'} IPMAT Students have already got their <span className="   ">SPECIAL ADMIT CARDs</span>
   </div>
   <Spacer y={2}></Spacer>
   <div className="w-full flex-row flex justify-start items-center">
    
<Button isLoading={loading} className=" bg-gradient-purple" color="primary" onPress={()=>{uploadData(formData,rawData)}}>Get your FREE Admit Card</Button>
</div></>:''}
{data != undefined && !isSubmitted ?

<div className="w-full flex flex-col justify-start items-start">

{!router?.query?.continue ?
    <Button size="sm" variant="faded" className="mb-4" color="danger" onPress={()=>{setData()}}>Go Back</Button>:''}
    <Divider></Divider>
    <div className="flex flex-col md:flex-row w-full mt-4">
        <div className="flex flex-col flex-1">
            {isPrint ? <Button color="danger" className="mr-auto" variant="ghost" size="sm" onPress={()=>{setIsPrint(false)}}>Go Back to Tool</Button>:''}
            {isPrint ? <>
<h2 className="text-2xl font-bold text-left text-primary mt-4">Your Admit Card is Ready !!</h2>
<h2 className="text-2xl font-bold text-left text-black mb-4">Claim FREE Print Now</h2>


<Input value={formData?.address} name="address" size="sm" className="font-sans mb-2" label="Address" placeholder="Enter your Address" onChange={(e)=>{setFormData(res=>({...res,address:e.target.value}))}}></Input>
<Spacer y={2}></Spacer>
<Select selectedKeys={[formData?.state || null]} title="State" label="State"  placeholder="Select your State" onChange={(e)=>{setFormData(res=>({...res,state:e.target.value}))}}>
    {cities && cityUtility().getStates().map((i,d)=>{

        return <SelectItem key={i} value={i}>{i}</SelectItem>
    })}
</Select> <Spacer y={2}></Spacer>
{formData?.state? 
<Select selectedKeys={[formData?.city]} label="City" placeholder="Select your City" onChange={(e)=>{setFormData(res=>({...res,city:e.target.value}))}}>
    {cities && cityUtility().getCities(formData?.state).map((i,d)=>{

        return <SelectItem key={i} value={i}>{i}</SelectItem>
    })}
</Select>:''} <Spacer y={2}></Spacer>
   <Input value={formData?.pincode} size="sm" type="number" endContent={

formData?.pincode?.length == 6 ? <Tick></Tick>:''
   } maxLength={6} name="pincode" className="font-sans mb-2" label="PIN Code" placeholder="Enter your Pincode" onChange={(e)=>{setFormData(res=>({...res,pincode:e.target.value}))}}></Input>
    <Spacer y={2}></Spacer>
    <p className="text-xs mb-4">Get your Special IPMAT Admit card delivered at your doorstep for free!!</p>
<Button onPress={()=>{submitPrintRequest(formData,data.appno,data.uid,data)}} isLoading={loading} className=" bg-gradient-purple text-white">Get FREE Print </Button>

</> :
<div className="flex flex-col min-h-[300px] w-full">
    
    <h2 className="text-lg text-left font-bold text-primary">
        Hi {rawData?.sData?.name},<br/>
        Your Special Admit Card is ready
    </h2>
    
<h2 className="text-lg font-medium mt-4">Admit Card Tools</h2>
<Divider></Divider>
<div className="flex flex-row flex-wrap items-center justify-start my-2">
<Button size="sm" className=" text-xs text-white bg-gradient-purple" onPress={()=>{setIsPrint(true)}}>Claim your FREE Print</Button>

<Spacer x={2}></Spacer>
<Button className="flex  bg-secondary m-1 md:m-0 text-black" size="sm" onClick={()=>{setOpen(true)}}>Preview
<svg width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.669 14.923a1 1 0 0 1 1.414 1.414l-2.668 2.667H8a1 1 0 0 1 .993.884l.007.116a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v1.587l2.669-2.668Zm8.336 6.081a1 1 0 1 1 0-2h1.583l-2.665-2.667a1 1 0 0 1-.083-1.32l.083-.094a1 1 0 0 1 1.414 0l2.668 2.67v-1.589a1 1 0 0 1 .883-.993l.117-.007a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4ZM8 3a1 1 0 0 1 0 2H6.417l2.665 2.668a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.414 0L5 6.412V8a1 1 0 0 1-.883.993L4 9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4Zm12.005 0a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V6.412l-2.668 2.67a1 1 0 0 1-1.32.083l-.094-.083a1 1 0 0 1 0-1.414L17.589 5h-1.584a1 1 0 0 1-.993-.883L15.005 4a1 1 0 0 1 1-1h4Z" fill="#000"/></svg>
</Button></div>
<h2 className="text-lg font-medium">Book a Cab to your Exam Centre</h2>
<Divider></Divider>
<ButtonGroup  className="mr-auto my-4">
    <Button as={Link} target="_blank" href={`/admit/book/uber/${data?.uid}`} startContent={

<svg
xmlns="http://www.w3.org/2000/svg"
width="34px"
height="34px"
viewBox="0 0 34 34"

>

<g
  id="Page-1"
  stroke="none"
  strokeWidth={1}
  fill="none"
  fillRule="evenodd"
>
  <g id="uber_rides_api_icon">
    <rect
      id="Rectangle-path"
      fill="#000"
      x={0.5}
      y={0.5}
      width={24}
      height={24}
      rx={2.5}
    />
    <path
      d="M31 1a2 2 0 012 2v28a2 2 0 01-2 2H3a2 2 0 01-2-2V3a2 2 0 012-2h28zm0-1H3a3 3 0 00-3 3v28a3 3 0 003 3h28a3 3 0 003-3V3a3 3 0 00-3-3z"
      id="Shape"
      fill="#FFF"
    />
    <path
      d="M17 7a10 10 0 00-9.95 9H14v-1.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5V18H7.05A10 10 0 1017 7z"
      id="Shape"
      fill="#FFF"
    />
  </g>
</g>

</svg>
    } className="bg-black text-white">Book Uber</Button>
    <Button as={Link} target="_blank" href={`/admit/book/ola/${data?.uid}`} startContent={
        <svg
        xmlns="http://www.w3.org/2000/svg"
        data-name="Layer 1"
        viewBox="0 0 510.04 493.07"
       width={24}
       height={24}
      >
        <path
          d="M506 218c-.93-12.25-4.07-28.46-8.77-44.05A223.59 223.59 0 00448 87.32c-11.91-12.84-25.38-24.78-45.45-38.85Q379.6 37.15 357.44 24.3c-9.71-5.51-21.31-12.25-36.65-17.14a265.11 265.11 0 00-55.47-7 243.24 243.24 0 00-53.88 4.29c-18.44 3.02-33.85 7.91-54.22 12.81-46.06 19.88-81.77 49.87-112.48 89.65-107.16 149.61-10.33 359.2 168.57 384a242.23 242.23 0 0086.79-4l19.74-5.2a5.89 5.89 0 012.19-.62l22.57-8.56c1.24-.62 2.19-.93 3.44-1.53l9.4-4.29A257.4 257.4 0 00407.89 434a288 288 0 01-45.75 33.95l.93.62c3.15-.93 6-1.85 9.09-2.45 0 0 0 4.89-.62 4-5 3.68 2.83.31 12.85-4.9a158.63 158.63 0 0028.51-19c12.86-10.7 24.13-22.34 40.11-41.29 16.29-28.47 36.67-53.25 46.07-86.6a199.62 199.62 0 0011-63A251.13 251.13 0 00506 218zM274.1 469.48c54.83-8.58 100.89-38.86 138.49-80.17 10.34-15 18.49-28.77 28.51-43.75 12.53-30.61 11.6-57.83 15.66-77.1 5-34.9-6.88-63-16.9-93-15.36-34.88-35.73-60.88-71.45-81.07-90.24-55.71-213.06-40.12-271.65 43.11-.31 0-1.89 2.14-5 6.42 4.07-17.12 14.42-27.22 24.75-37 30.71-25.08 66.44-45 107.17-54.76 46.07-4.9 91.79 0 132.84 19.89 61.4 34.85 102.14 89.63 112.48 154.47v60c-12.85 98.22-97.45 172.88-194.89 183zm225.29-223.37C497.19 102.32 354 5.33 214.57 24.92 173.84 35 129.33 55.2 97.69 83.35c-15.35 10.08-22.55 28.76-37.91 43.74C-1.64 216.75 9 331.49 85.47 401.26a295.28 295.28 0 0031.33 26.92C52.9 389.92 24.06 332.08 14 261.73c0-25.1 5-49.88 10.33-75C60.11 76.92 172.58-2.94 295.1 17.26c20.37 4.9 40.74 10.1 61.43 15 25.69 10.08 51.06 25.08 71.43 45s35.72 45 51.08 69.74c10.33 19.9 15.35 45 20.36 64.87a210.94 210.94 0 010 34.28z"
          fillRule="evenodd"
        />
        <path
          d="M372.16 248.25c0 61.82-52 112-116.24 112s-116.24-50.17-116.24-112 52-112 116.24-112 116.24 50.18 116.24 112z"
          fill="#fff"
          fillRule="evenodd"
        />
        <path
          d="M372.8 229.28c-1.57-8.56-4.08-15.29-6.58-24.77-10-20.82-24.75-37-44.19-50.8-72.68-48-172.64-1.83-183.28 80.18-4.06 32.43 7.52 63.64 28.2 87.51-6.27-6.43-13.15-13.15-17.85-20.81l-.62.62c.62 1.83 3.13 3.05 3.75 4.88 0 0-2.51 0-1.88-.31-1.87-2.12-.31 1.25 2.5 5.82a62.12 62.12 0 009.4 12.86 138.09 138.09 0 0020.37 18.06c13.8 7 26 16.2 42 20.49 4.38 1.24 9.4 2.45 14.42 3.36a90 90 0 0016 1.24 100 100 0 0017.85-1.86 129.52 129.52 0 0021-4.26 109 109 0 0041.37-23.27c5.95-5.49 14.42-12.53 21-21.72 5.34-10.39 6-15.6 8.47-20.19s5.63-9.79 7.84-16.83a144.68 144.68 0 003.13-25.39c-.31-8.57-.93-16.83-2.82-24.79zm-74.58-56.89c10.66 6.11 12.22 7 6.58 3.05 8.16 1.83 13.17 6.42 18.18 11 12.22 13.77 22.24 30 27.25 48.64 2.82 21.11.62 42.22-8.45 60.9-16.29 28.44-42.3 47.41-73.32 52.61-3.45 0-7.2 0-10.66.31 8.78-1.53 14.42-7 30.4-12.86 17.22-6.04 36.65-34.54 46.07-51.04 27.56-45-5-86.59-36-112.58zm-58.89 176.83c-47.62-4.89-84.29-43.75-89.3-88.73 4.37 25.1 19.42 44.36 39.78 61.5 7.22 4.59 17.86 11 25.07 15.61 12.22 4.59 19.42 9.49 31.33 11.63h-6.88zm128.13-81.69c-2.17 9.5-4.37 18.66-6.57 28.16-4.7 11.63-11.59 23.56-21 33s-21.31 16.83-33.21 23.87c-9.4 4.88-21.31 7.33-31 9.77-5.65.62-12.22-1.83-17.87-2.13 69.56-1.8 117.19-66.34 106.85-130.3-5-18.66-15.05-34.88-27.27-51.09-5-7-14.74-11.32-21.94-18.37-43.55-27.22-101.19-21.71-134.09 14.09a149.15 149.15 0 00-12.86 15c17.56-25.7 45.76-43.74 79.59-48.95 11.91-.31 24.13 1.84 36 4 52.65 15.9 91.81 66.7 83.34 123z"
          fill="#d7df23"
          fillRule="evenodd"
        />
      </svg>
    } className="bg-yellow-500 text-black">Book OLA</Button>
</ButtonGroup>

<h2 className="text-lg font-medium">Find Common Aspirants from your Centre</h2>

<Divider></Divider>
<Spacer y={4}></Spacer>
{aspirants != undefined ? <div className="flex flex-col overflow-y-auto max-h-[50vh]">

    {aspirants && getUnique(aspirants).map((i,d)=>{
        return <div className="flex flex-row text-xs my-1">
            <Avatar
            src={i?.picture || "https://t4.ftcdn.net/jpg/04/10/43/77/360_F_410437733_hdq4Q3QOH9uwh0mcqAhRFzOKfrCR24Ta.jpg"}>

            </Avatar>
            <div className="flex flex-col ml-2"><h2 className={"font-bold text-sm"}>{i.name}</h2>
            <div className="text-gray-500">{i.appno} </div></div>
            {sent && sent.some(item=>item == i.uid) ?
            <Button size="sm" className="ml-auto" color="success" >Sent</Button> :
            <Button size="sm" className="ml-auto" color="secondary" onPress={()=>{connectFriend(i.uid)}}>Connect</Button>}
        </div>
    })}
</div>:""}
{aspirants == undefined || aspirants?.length == 0 || getUnique(aspirants || [])?.length == 0 ? <>
<div className="text-sm p-2 w-full text-center">No Common Aspirant Found Yet. <br/> 😎 Check back again this list will be updated automatically</div>


</> 
:''}
<Button className="text-black bg-secondary mr-auto" size="sm" onPress={()=>{getAspirants(data.uid)}}>Refresh</Button>
<Spacer y={4}></Spacer>

<h2 className="text-lg font-medium">Experts Tips to Excel your IPMAT Exams</h2>

<Divider></Divider>
<div className="flex flex-row w-full  my-3">

<div className="border-1 m-2 border-green-500 p-3 rounded-xl text-xs bg-green-200">
    <h2 className="text-green-600 font-bold text-lg">Do's</h2>
    <p>•Revise Properly </p>
<p>•Give Regular Mocks</p>
<p>•Solve PYQs</p>
<p>•Stay Calm and Relax</p>
<p>•Maintain Healthy Routine</p>
</div>
<div className="border-1 m-2 border-red-500 p-3 rounded-xl text-xs bg-red-200">
    <h2 className="text-red-600 font-bold text-lg">Dont's</h2>
    <p>•Do not start any new topic</p>
<p>•Do not Overthink</p>
<p>•Do not spend too much time on Social Media</p>
<p>•Do not stay up late</p>
<p>•Do not skip meals</p>

</div>
    </div>

<h2 className="text-lg font-medium">Share this Tool with Your Friends</h2>

<Divider></Divider>
<ShareButton></ShareButton>
</div>


}
</div>
<div className="flex-1 ml-8 md:flex hidden border-1 border-gray-500 rounded-xl shadow-md">
    <div className="w-full bg-gray-50  max-w-[500px] flex h-full relative">
<CentrePreview data={data}></CentrePreview>
{/* <AdmitPreview onClick={()=>{setOpen(true)}} data={rawData} url={data?.url+"#toolbar=0&navpanes=0"} ></AdmitPreview> */}

    </div>
</div>
</div> 
</div>
: ''}


{isSubmitted ? 
<div className="flex flex-col md:flex-row items-center w-full justify-center">
    <img className="w-full md:w-[400px] max-h-[50vw]" src="/printing.svg"/>
<div className=" flex flex-col">
    <h2 className="text-2xl font-bold text-primary">Yay ! We have received your print request</h2>
    <p className="text-xs ">Your Admit Card will be printed and delivered to you shortly.</p>
    <div className="w-full flex flex-row flex-wrap my-3">
    <Button as={Link} target="_blank" href={`/admit/${data?.uid}`} className=" bg-gradient-purple text-white" size="sm">View Admit Card</Button>
    <Button as={Link} target="_blank" href={`/admit/track/${data.appno}`} className=" bg-secondary text-white ml-2" size="sm">Track Request</Button></div>
    </div>
</div>
:''}





</div>
{data == undefined || rawData == undefined?
<div className="flex-1 max-h-[50vh] relative rounded-lg shadow-md flex flex-col items-center justify-center ml-2">
    <img  className="w-auto h-full object-cover" src="https://www.ipmcareer.com/wp-content/uploads/2024/05/Special-Revision-Batch-copy-1.jpg"/>
    </div> :''}</div>
    <Spacer y={6}></Spacer>
    <Divider></Divider>

<div className="hidden md:flex flex-row justify-center items-center text-[#222] text-xs mt-4">
<svg width="24" height="24" fill="none" className="mr-2 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a4 4 0 0 1 4 4v2h2.5A1.5 1.5 0 0 1 18 9.5V11c-.319 0-.637.11-.896.329l-.107.1c-.812.845-1.656 1.238-2.597 1.238-.783 0-1.4.643-1.4 1.416v2.501c0 2.374.924 4.22 2.68 5.418L3.5 22A1.5 1.5 0 0 1 2 20.5v-11A1.5 1.5 0 0 1 3.5 8H6V6a4 4 0 0 1 4-4Zm8.284 10.122c.992 1.036 2.091 1.545 3.316 1.545.193 0 .355.143.392.332l.008.084v2.501c0 2.682-1.313 4.506-3.873 5.395a.385.385 0 0 1-.253 0c-2.476-.86-3.785-2.592-3.87-5.13L14 16.585v-2.5c0-.23.18-.417.4-.417 1.223 0 2.323-.51 3.318-1.545a.389.389 0 0 1 .566 0ZM10 13.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM10 4a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2Z" /></svg>
    Your data is end-to-end encrypted


</div>



</div>
<div className="flex-0 hidden md:block h-[80px] w-full"></div>

</div>



    </div>
}

export default AdmitCard;


const CentrePreview = ({data})=>{

const [loading,setLoading] = useState(true)
const [rData,setRData] = useState();
const [count,setCount] = useState(0);
const[active,setActive] = useState(false);
const [distance,setDistance] = useState()
useEffect(()=>{
setRData(data)
getData(data.uid)

},[])
let timeoutId; 


function resizeImage(url, targetWidth, targetHeight) {
    const regex = /=(w\d+)-(h\d+)/;
    const match = url.match(regex);

    if (match) {
        const widthParam = match[1];
        const heightParam = match[2];

        const aspectRatio = targetWidth / targetHeight;
        const newWidth = Math.round(targetHeight * aspectRatio);

        const newUrl = url.replace(regex, `=${widthParam}-h${targetHeight}-w${newWidth}`);
        return newUrl;
    }

    return url;
}

async function getData(a){

    clearTimeout(timeoutId)
    const {data,error} = await supabase.from('admit_cards').select('*').eq('uid',a)
    if(data){
        setRData(data[0])
        if((data[0]?.images == undefined || data[0]?.images == null) && count < 10){
          timeoutId =  setTimeout(()=>{
                getData(data[0]?.uid)
                setCount(res=>res+1)
            },2000)
        }else{
            setLoading(false)
        }
    }
    if(error){

    }


}

let getLocationPromise = new Promise((resolve, reject) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position?.coords?.latitude;
            const long = position?.coords?.longitude;

            // Here, both lat and long are defined
            resolve({ latitude: lat, longitude: long });
        });
    } else {
        alert('Your browser is not providing valid information.');
        reject("Your browser doesn't support the geolocation API.");
    }
});

async function trackDistance(a){
setDistance()
    const p1= `${a?.latitude},${a?.longitude}`;
    getLocationPromise.then((location) => {
        call(location)
        

    }).catch((err) => {
       
    })

    async function call(v){

        const r= toast.loading('Calculating Distance')
        axios.post('https://generate.your-domain.com/getDistance',{
            place1:p1,
            place2:`${v?.latitude},${v?.longitude}`
        }).then(res=>{toast.success('Distance from your location to centre is '+res?.data?.distance),setDistance(res?.data?.distance),toast.remove(r)}).catch(err=>{toast.remove(r)})

       
    }
}

return <div className={"w-full h-auto bg-gray-100 rounded-lg flex flex-col justify-start items-start overflow-hidden relative "+ (loading ?'animate-pulse !bg-gray-500' :'')}>
    <Button className="md:hidden absolute left-2 top-2 flex bg-gradient-purple z-10 text-white " size="sm" onPress={()=>{setActive(res=>!res)}}>View Centre Details</Button>
    <div className={"w-full absolute left-0 bottom-0 min-h-[200px] bg-white z-10 p-4 transition-all ease-in-out -translate-x-[100%] md:-translate-x-[0%] " + (active? ' !-translate-x-[0%]':'')}>
<div className="flex flex-row md:hidden" onClick={()=>{setActive(false)}}>
<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.707 4.293a1 1 0 0 1 0 1.414L9.414 12l6.293 6.293a1 1 0 0 1-1.414 1.414l-7-7a1 1 0 0 1 0-1.414l7-7a1 1 0 0 1 1.414 0Z" fill="#222F3D"/></svg>
</div>
<h2 className="text-xs">
<strong>Centre:</strong> {rData?.data?.tData?.location}</h2>
<h2 className="text-xs">
<strong>Map Link:</strong> <Link href={rData?.map_url} target="_blank" className="text-xs">{rData?.map_url}</Link></h2>
<h2 className="text-xs">
<strong>Google Plus Code:</strong> {rData?.pluscode}</h2>
<h2 className="text-xs">
<strong>Centre City:</strong> {rData?.data?.tData?.city || 'Unable to Fetch'}</h2>
<h2 className="text-xs flex flex-col justify-start">
<strong>Centre Distance:</strong> {distance ? distance:''} <Button size="sm" color="primary" onPress={()=>{trackDistance(rData?.coordinates)}}> Click to Track</Button></h2>
    </div>
<div className="w-auto max-w-full flex relative">
<Swiper
 className="mySwiper"
     modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={10}
      slidesPerView={1}
      loop={true}
      autoplay={true}
      speed={1200}
      pagination={{ clickable: true }}
      centeredSlides={true}
      onSlideChange={() =>{}}
      onSwiper={(swiper) => {}}
      onInit={(swiper) => {
       
        swiper.navigation.update();
      }}
      navigation={{
        nextEl: '.next',
        prevEl: '.prev',
        clickable:true,
      }}
   
    >


     
      
      {rData && rData?.images && rData?.images?.map((item,index)=>{

return(<>

<SwiperSlide key={index} className="w-full h-full max-h-[60vh]"><img alt={''} width={200} className={"w-full aspect-[1/1] max-w-[400px] max-h-[700px] h-full object-contain"} src={resizeImage(item.src,1000,1000)||item.src}/></SwiperSlide>

</>)
})} 


    </Swiper></div>
</div>


}

const Tick = ()=>{

    return <svg width="24" className=" animate-appearance-in" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.22 6.97-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06Z" fill="#2ECC70"/></svg>
}


const AdmitPreview = ({data,url,onClick})=>{

const [test,setTest] = useState(true)

const [numPages, setNumPages] = useState();
const [pageNumber, setPageNumber] = useState(1);

function onDocumentLoadSuccess({numPages}) {
    setNumPages(numPages);
  }
 



pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax//libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

if(test){
    return <div className="w-full h-auto">

       
         
    <div className="w-full aspect-[1/1.4] rounded-lg overflow-hidden relative">
       
    <div className="w-full h-full aspect-[1/1.4] z-0 overflow-hidden" >
    <iframe className="w-full h-full" src={url}></iframe>   
    </div>
    
    </div>
    <Button onPress={()=>{onClick(true)}} startContent={<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.669 14.923a1 1 0 0 1 1.414 1.414l-2.668 2.667H8a1 1 0 0 1 .993.884l.007.116a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v1.587l2.669-2.668Zm8.336 6.081a1 1 0 1 1 0-2h1.583l-2.665-2.667a1 1 0 0 1-.083-1.32l.083-.094a1 1 0 0 1 1.414 0l2.668 2.67v-1.589a1 1 0 0 1 .883-.993l.117-.007a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4ZM8 3a1 1 0 0 1 0 2H6.417l2.665 2.668a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.414 0L5 6.412V8a1 1 0 0 1-.883.993L4 9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4Zm12.005 0a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V6.412l-2.668 2.67a1 1 0 0 1-1.32.083l-.094-.083a1 1 0 0 1 0-1.414L17.589 5h-1.584a1 1 0 0 1-.993-.883L15.005 4a1 1 0 0 1 1-1h4Z" fill="#fff"/></svg>} size="sm" color="primary" className=" z-99999 ">Open in Full Page</Button>
    </div>
}

    return <div className="w-[210mm] p-[10mm] h-[297mm] origin-top-left scale-[0.35]  absolute left-0 top-0">
        <div className="w-full flex flex-row h-[70mm]">
<div className="flex-0 h-full">
    <img src={data?.sData?.picture} className="aspect-square w-auto h-full object-cover rounded-full"/>
    
</div>
<div className="flex-1 flex flex-col justify-start text-xl items-start p-4 ">
    <h2><strong className="text-primary">Name :</strong> {data?.sData?.name}</h2>
    <h2><strong className="text-primary">Date of Birth :</strong>  {data?.sData?.dob}</h2>
    <h2><strong className="text-primary">Application Number :</strong> {data?.sData?.appno}</h2>
    <h2><strong className="text-primary">Category :</strong> {data?.sData?.category}</h2>
    <h2><strong className="text-primary">PwD :</strong> {data?.sData?.isPWD}</h2>
    {data?.sData?.signature != undefined ? <img src={data?.sData?.signature}/>:''}
    
</div>
        </div>

<div className="w-full border-1 rounded-xl p-4 my-[10mm] bg-white shadow-md">
<h2 className="text-2xl font-bold">
    Exam Details:
</h2>
<h2><strong className="text-primary">Name :</strong> {data?.tData?.date}</h2>
    <h2><strong className="text-primary">Reporting/Entry Time :</strong>  {data?.tData?.entry}</h2>
    <h2><strong className="text-primary">Gate Closing Time of Centre :</strong> {data?.tData?.closing}</h2>
    <h2><strong className="text-primary">Exam Session Time (Time Period) :</strong> {data?.tData?.period}</h2>
    <h2><strong className="text-primary">Centre Located in City :</strong> {data?.tData?.city}</h2>
    <h2><strong className="text-primary">Centre Location :</strong> {data?.tData?.location}</h2>
    <h2><strong className="text-primary">Centre Distance from your Location :</strong> {'Will be available in main preview'}</h2>
    <h2><strong className="text-primary">Centre Map Link :</strong> <a target="_blank" className="text-primary underline" href={data?.tData?.centreurl}>{data?.tData?.centreurl}</a></h2>
</div>

<div className="w-full border-1 rounded-xl p-4 my-[10mm] bg-white shadow-md">
<h2 className="text-2xl font-bold">
    Instructions to the Candidate:
   

</h2>
<div className="text-xs">
  <p>1. Print this Admit card (all 2 pages) on an A4 size paper using a laser printer.</p>
  <p>2. Admit Card is valid only if the candidate's photograph and signature images are legibly printed. Paste the photograph at the indicated place.</p>
  <p>3. The Admit Card is to be produced for verification at the time of the test. This Admit card is valid only for the test date and session time as specified above.</p>
  <p>4. The Admit Card is to be produced for verification at the time of the test along with the original (not scanned) valid (not expired) photo identification card (the original Id card should be the same as printed on the Admit Card).</p>
  <p>5. The candidate's photograph and signature should be legibly printed and visible on the photo ID card and should match the name on the Admit Card. The Photo ID card should not be damaged or smudged.</p>
  <p>6. The second page of the Admit Card (on which the ID proof of the candidate appears) must be self-attested by the Candidate.</p>
  <p>7. Candidates are advised to locate their test centre and its accessibility at least a day before the test so that they can reach the centre on time on the day of the test.</p>
  
</div>

</div>

    </div>
}

export async function getServerSideProps(context){

    const cont = context.query.continue;

    return {props:{isContinue:cont != undefined ? true : false}}
}