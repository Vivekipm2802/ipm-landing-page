import { useCallback, useEffect, useRef, useState } from "react";
import Timer from "../components/Timer";
import st from './TestPredictor.module.css'
import styles from './Call.module.css'
import Head from "next/head";
import { NextSeo } from 'next-seo';
import CustomSelect from "../components/CustomSelect";
import Marquee from "react-fast-marquee";
import axios from "axios";
import { supabase } from "../utils/supabaseClient";

import { useRouter } from "next/router";
import "tailwindcss/tailwind.css";
import { Input, Select, SelectItem, Spacer } from "@nextui-org/react";
import Confetti from "../components/CanvasCofetti";
function Call(){
    
    const [data,setData] = useState();
    const [formData,setFormData] = useState();
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState();
    const [count,setCount] = useState('loading');
    const scrolldiv = useRef(null);
    const [isVisible,setIsVisible] = useState(false)
    const categories = [ 
        
        { value: 'gen', title: 'GEN' },
        { value: 'ews', title: 'EWS' },
        { value: 'obc', title: 'OBC' },
        { value: 'pwd', title: 'PWD' },
        { value: 'sc', title: 'SC' },
        { value: 'st', title: 'ST' }
      ] 
      const genders = [
              
        { value: 'male', title: 'Male' },
        { value: 'female', title: 'Female' },
        { value: 'nos', title: 'Not Specified' }
        
      ] 
const inputs  = [

    {
        label:"Full Name",
        placeholder:'Enter your Full Name',
        name:'fullname',
        key:'fullname',
        type:'text'
      
        
    },
   
     {
        label:"Category",
        placeholder:'Select your Category',
        name:'category',
        key:'category',
        type:'select',
        objects:categories,
        
    },
    {
        label:"Gender",
        placeholder:'Select your Gender',
        name:'gender',
        key:'gender',
        type:'select',
        objects:genders,
        
    },
    {
        label:"Mobile Number",
        placeholder:'Enter your Mobile Number',
        name:'phone',
        key:'phone',
        type:'tel',
        
    },
    {
        label:"Email",
        placeholder:'Enter your Email Address',
        name:'email',
        key:'email',
        type:'email',
        
    },
    {
        label:"Quanitative Apitutde MCQ",
        placeholder:'Enter Quanitative Apitutde MCQ Marks',
        name:'qa',
        key:'qa',
        type:'number',
        
    },
    {
        label:"Quantitative Ability SA",
        placeholder:'Enter Quantitative Ability SA Marks',
        name:'sa',
        key:'sa',
        type:'number',
        
    },
    {
        label:"Verbal Ability VA",
        placeholder:'Enter Verbal Ability VA Marks',
        name:'va',
        key:'va',
        type:'number',
        
    },

]

async function getCount(){
    const {data,error} = await supabase.from('predictor').select('id', { count: 'exact',head:false, })
    
    if(data){
      
    setCount(550+data.length)
    
    }if(error){
      
    }
    }

    useEffect(()=>{
        getCount()
    },[])
function cronberryTrigger(username, u_email, u_mobile, u_year, u_city, linke) {

    
  
    var id = Date.now();
    var data = JSON.stringify({
        "projectKey": "VW50aXRsZSBQcm9qZWN0MTY1MDAxMzUxMDU5MQ==",
        "audienceId": id,
        "name": username,
        "email": u_email,
        "mobile": u_mobile,
        "ios_fcm_token": "",
        "web_fcm_token": "",
        "android_fcm_token": "",
        "profile_path": "",
        "active": "",
        "audience_id": "",
        "paramList": [{
                "paramKey": "source",
                "paramValue": ""
            },
            {
                "paramKey": "city",
                "paramValue": u_city
            },
            {
                "paramKey": "postcode",
                "paramValue": ""
            },
            {
                "paramKey": "total_amount",
                "paramValue": ""
            },
            {
                "paramKey": "abondon_cart",
                "paramValue": true
            },
            {
                "paramKey": "preparing_for_which_year",
                "paramValue": ""
            },
            {
                "paramKey": "subject",
                "paramValue": ""
            },
            {
                "paramKey": "formurl",
                "paramValue": linke
            },
            {
                "paramKey": "formname",
                "paramValue": "Call Predictor"
            }
        ]
    });
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function() {
  
        if (this.readyState === 4) {
            
            
           
  
        }
    });
    xhr.open("POST", "https://register.cronberry.com/api/campaign/register-audience-data");
    xhr.setRequestHeader("Content-Type", "application/json");
  
  
    xhr.send(data);
  }
  
function validatePhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  }
  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
async function TestApi(a){
    setData()
if(a == undefined){
setError('Everything is Empty , Please Fill the form')
return 
}
if(a.fullname == undefined || !validateName(a?.fullname)){
    setError('Name is Empty or Invalid')
    return 
    }
 
        if(a.category == undefined){
            setError('Please Select Category from the DropDown')
            return 
            }
            if(a.gender == undefined){
                setError('Please Select Gender from the DropDown')
                return 
                }
                if(a.phone == undefined || !validatePhone(a.phone)){
                    setError('Phone Invalid or Empty Please Fill correctly. Do not use country code or 0 as prefix')
                    return 
                    }
        if(a.email == undefined || !validateEmail(a.email)){
            setError('Email Invalid or Empty Please Fill correctly.')
            return 
            }
           
                if(a.qa == undefined ){
                    setError('Please Enter your QA Marks between 0 - 100')
                    return 
                    }
                    if(a.sa == undefined ){
                        setError('Please Enter your SA Marks between 0 - 100')
                        return 
                        }
                        if(a.va == undefined ){
                            setError('Please Enter your VA Marks between 0 - 100')
                            return 
                            }
                      

    setLoading(true)
    submitLead(a);
            await axios.post('/api/predictor', {
                category:a.category,
                sa:a.sa,
                va:a.va,
                qa:a.qa,
            })
            .then(response => {
              // Handle successful response
             
              cronberryTrigger(a.fullname, a.email,a.phone, 'Not Specified', 'https://register.ipmcareer.com/call')
              setData(response?.data?.colleges)
              if(response?.data?.colleges?.length > 0){
              setIsVisible(true)
              setTimeout(()=>{
                handleScrollTop()
              },500)
            
            }
              setLoading(false)
            })
            .catch(error => {
              // Handle error
              setLoading(false)
             
            })
          }

         
    async function submitLead(a){

        const {error} = await supabase.from('predictor').insert({
            fullname:a.fullname,
            va:a.va,
            sa:a.sa,
            qa:a.qa,
            matric:a.matric,
            intermediate:a.intermediate,
            email:a.email,
            phone:a.phone,
            age:a.age,
            gender:a.gender,
            category:a.category
        })


        if(!error){
          
        }
    }

    function validateName(name) {
        const minLength = 2;
        const maxLength = 50;
        const regex = /^[a-zA-Z\s]+$/;
    
        if (name.length < minLength || name.length > maxLength) {
            return false;
        }
        if (!regex.test(name)) {
            return false;
        }
        return true;
    }
const images = [
    '/7dr.png',
    '/1dr_1.png',
    
    '/3dr.png',
    '/4dr.png',
    '/5dr.png',
    '/6dr.png',
    'https://www.ipmcareer.com/wp-content/uploads/2024/03/coppred.png',
    
]
const collegesData = {
    "IIM Indore": {
        title:'IIM Indore',
        location:'Indore, Madhya Pradesh ',
        picture:'https://www.iimidr.ac.in/wp-content/uploads/NIRF_IIMIndore.jpg'
    },
    "IIM Ranchi": {
        title:'IIM Ranchi',
        location:'Ranchi , Jharkhand',
        picture:'https://upload.wikimedia.org/wikipedia/commons/0/0c/IIM_Ranchi_Academic_Building.png'
    },
    "NALSAR": {
        title:'NALSAR',
        location:'Hyderabad, Telangana',
        picture:'https://www.indcareer.com/files/notices/2015-03/nalsar-university-law-hyderabad.jpg'
    },
    "IIFT": {
        title:'IIFT',
        location:'Multiple Locations',
        picture:'https://images.collegedunia.com/public/college_data/images/appImage/25453_IIFTD_NEW.jpg'
    },
    "NIRMA": {
        title:'NIRMA',
        location:'Ahmedabad, Gujrat',
        picture:'https://nirmawebsite.s3.ap-south-1.amazonaws.com/wp-content/uploads/2022/07/Homepage-NU-950x732.jpg'

    },
    "TAPMI": {
        title:'TAPMI',
        location:'Manipal, Karnataka',
        picture:"https://www.tapmi.edu.in/wp-content/uploads/2018/04/Tapmi-Images09.jpg"
    },
    
};

function resetForm(){
    setData();
    setFormData();
}

const router = useRouter();
useEffect(()=>{

if(router?.query?.live){
    setLive(router.query.live)
}
},[router])
    const [live,setLive] = useState(true);
    const handleScrollTop = () => {
        // Scroll to the top of the scrollable div
        scrolldiv.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
      };
    return <>
    {live ?
    <div className={styles.mainholder}>
<Head>
        <link rel="icon" href={'/favicon_ipm.svg'} />
        </Head>
        {isVisible ? <Confetti></Confetti>:''}
       
         <NextSeo
        title='IPMAT Call Predictor - Best & Easy to Use Predictor'
        description='IPMAT Call Predictor is a tool for IPMAT Aspirants using which they can analyse their profile and explore their chances of landing an admission in IIM or any equivalent colleges across India.'
        canonical='https://register.ipmcareer.com/call'
        openGraph={{
          url: 'https://register.ipmcareer.com/call',
          title: 'IPMAT Call Predictor - Best & Easy to Use Predictor',
          description: 'IPMAT Call Predictor is a tool for IPMAT Aspirants using which they can analyse their profile and explore their chances of landing an admission in IIM or any equivalent colleges across India.',
          images: [
            {
              url: '/callpred.jpg',
              width: 1200,
              height: 630,
              alt: 'IPMAT Call Predictor Tool',
            },
          ],
        }}
       ></NextSeo>
       
<div className={styles.semi}></div>
<div className={styles.inputsholder}>
<div className={styles.logo}>

<img src='/hd-logo.svg'/>
</div>
<p className={styles.callpara}>Welcome to our</p>
<h2 className={styles.callheading + " font-bold"}>IPMAT 
    <br/>
    <div className="w-full text-black max-h-[0px] pointer-events-none text-xs overflow-hidden text"><Content></Content></div>
    <span className={styles.col2}>Call Predictor</span></h2>
    <div className={styles.inputs} ref={scrolldiv}>
      
        
        
      
        
        {data ? 
        <div className={styles.colleges}>
           <div className={styles.empty}>
            {data && data.length == 0 ? 
            <div>
                <img src="/cry.gif"/>
                <h2>As per your submitted data, We couldn't find any college you are likely to get a call from.</h2>
                <h1>But You would get a Call from IPM Careers to help you prepare better for your next attempt.</h1>

            </div>
            :''}</div>
            {data && data.length >0 ? 
            <div>
                <Spacer y={4}></Spacer>
                <h1 className={styles.congrats + " !text-2xl font-bold"}>YAY !! Congratulations , You are likely to get {data.length > 1 ? "": 'a'} call{data.length > 1 ? "s": ''} from {data.length > 1 ? data.length : 'a'} College{data.length > 1 ? "s": ''} listed below.</h1>
                <p className="font-medium text-lg mt-2">IPM Career Congratulates you for your Hard Work & Success.</p>
                <Spacer y={4}></Spacer>
            </div>
            :''} 
{data && data.map((i,d)=>{
    const c = collegesData[i]
    return <div className={styles.card}>
        <img src={c.picture}/>
        
        <div className={styles.cardcontent }>
            <h3 className="text-2xl font-bold">{c.title}</h3>
            <p className="!text-sm !font-medium">Location : {c.location}</p>
        </div>
        </div>
})}
        </div>
        :<>
    {inputs && inputs.map((i,d)=>{
        if(i.type == "text" || i.type  == "number" || i.type == "email" || i.type =="tel"){
            return <div style={{animationDelay:`${(d+1)*100}ms`}} className={styles.animate}>
            <Input   placeholder={i.placeholder} label={i.label} className="my-2" type={i.type} name={i.name} id={i.name} onChange={(e)=>{setError(),setFormData(res=>({...res,[i.key]:e.target.value}))}}></Input>
            </div>}
        else if(i.type == "select"){
            return <div style={{animationDelay:`${(d+1)*100}ms`}} className={styles.animate}>
         
             <Select placeholder={i.placeholder} className="my-2" label={i.label}  onChange={(e)=>{setError(),setFormData(res=>({...res,[i.key]:e.target.value}))}}>
                {i.objects && i.objects.map((z,v)=>{
                    return <SelectItem key={z.value} value={z.value}>{z.title}</SelectItem>
                })}
             </Select>
            </div> }
    })}</>}
</div>
    <div className={styles.buttonsection}>
        <div className={styles.counter}>

        <Marquee  speed={80} gradient={false}>
        {count}+ Students have already predicted their call. &nbsp; &nbsp; &nbsp;
         {count}+ Students have already predicted their call. 
        
    </Marquee>
        </div>
       {error?   <p className={styles.error}>{error}</p>:''}
        <button className="mt-3" onClick={()=>{data ?  resetForm(): TestApi(formData)}}>
        {!data && !loading ? 
        <svg fill="#000000" height="16px" width="16px" version="1.1" id="Capa_1" viewBox="0 0 296.789 296.789" >
<g>
	<path d="M55.093,110.761l6.544,17.743c0.246,0.668,0.882,1.111,1.593,1.111c0.711,0,1.347-0.443,1.593-1.111l6.544-17.743   c5.297-14.364,16.62-25.687,30.983-30.983l17.743-6.544c0.667-0.246,1.11-0.882,1.11-1.593c0-0.711-0.443-1.347-1.11-1.593   l-17.744-6.544c-14.363-5.297-25.686-16.619-30.982-30.982l-6.544-17.743c-0.246-0.667-0.882-1.11-1.593-1.11   c-0.711,0-1.347,0.443-1.593,1.11l-6.544,17.743C49.796,46.885,38.474,58.207,24.11,63.504L6.366,70.048   c-0.667,0.246-1.11,0.882-1.11,1.593c0,0.711,0.443,1.347,1.11,1.593l17.743,6.544C38.473,85.074,49.796,96.396,55.093,110.761z"/>
	<path d="M198.948,185.703l-17.742-6.543c-14.364-5.297-25.687-16.619-30.983-30.982l-6.544-17.743   c-0.246-0.667-0.882-1.11-1.593-1.11c-0.711,0-1.347,0.443-1.593,1.11l-6.544,17.742c-5.297,14.364-16.62,25.686-30.983,30.983   l-17.743,6.543c-0.667,0.246-1.11,0.882-1.11,1.593c0,0.711,0.443,1.347,1.11,1.593l17.744,6.545   c14.363,5.297,25.685,16.619,30.982,30.982l6.544,17.744c0.246,0.667,0.882,1.11,1.593,1.11c0.711,0,1.347-0.443,1.593-1.11   l6.544-17.744c5.297-14.363,16.619-25.686,30.982-30.982l17.744-6.545c0.667-0.246,1.11-0.882,1.11-1.593   C200.059,186.585,199.615,185.949,198.948,185.703z"/>
	<path d="M290.778,109.811l-12.059-4.447c-9.761-3.6-17.456-11.295-21.056-21.056l-4.447-12.058c-0.168-0.453-0.6-0.755-1.083-0.755   c-0.483,0-0.915,0.302-1.083,0.755l-4.446,12.057c-3.6,9.762-11.295,17.457-21.057,21.057l-12.058,4.447   c-0.453,0.167-0.755,0.599-0.755,1.082s0.302,0.916,0.755,1.083l12.059,4.446c9.761,3.601,17.456,11.296,21.056,21.057l4.446,12.06   c0.168,0.453,0.6,0.755,1.083,0.755c0.483,0,0.915-0.302,1.083-0.755l4.447-12.06c3.6-9.762,11.294-17.456,21.056-21.056   l12.059-4.447c0.453-0.167,0.755-0.6,0.755-1.083S291.231,109.978,290.778,109.811z"/>
	<path d="M261.567,268.552l-8.412-3.103c-6.809-2.511-12.176-7.878-14.687-14.686l-3.103-8.41c-0.116-0.316-0.418-0.526-0.755-0.526   s-0.639,0.21-0.755,0.526l-3.103,8.41c-2.511,6.809-7.878,12.176-14.686,14.686l-8.412,3.103c-0.316,0.116-0.526,0.418-0.526,0.755   c0,0.337,0.21,0.639,0.526,0.755l8.411,3.103c6.81,2.511,12.177,7.879,14.688,14.688l3.103,8.411   c0.116,0.316,0.418,0.526,0.755,0.526s0.639-0.21,0.755-0.526l3.103-8.411c2.511-6.809,7.878-12.177,14.688-14.688l8.411-3.103   c0.316-0.116,0.526-0.418,0.526-0.755C262.094,268.97,261.884,268.668,261.567,268.552z"/>
	<path d="M199.533,26.726l-8.412-3.102c-6.809-2.511-12.176-7.878-14.686-14.687l-3.103-8.41C173.216,0.21,172.914,0,172.577,0   c-0.337,0-0.639,0.21-0.755,0.526l-3.102,8.409c-2.511,6.809-7.879,12.177-14.688,14.688l-8.412,3.102   c-0.316,0.116-0.526,0.418-0.526,0.755c0,0.337,0.21,0.639,0.526,0.755l8.411,3.103c6.81,2.511,12.178,7.879,14.689,14.689   l3.102,8.41c0.116,0.316,0.418,0.526,0.755,0.526c0.337,0,0.639-0.21,0.755-0.526l3.103-8.411   c2.511-6.81,7.878-12.177,14.688-14.687l8.411-3.103c0.316-0.116,0.526-0.418,0.526-0.755   C200.06,27.144,199.85,26.842,199.533,26.726z"/>
	<path d="M96.359,251.26l-10.58-3.9c-8.564-3.158-15.316-9.91-18.476-18.475l-3.901-10.58c-0.147-0.397-0.526-0.662-0.95-0.662   c-0.424,0-0.803,0.265-0.95,0.662l-3.901,10.579c-3.158,8.565-9.91,15.317-18.476,18.476l-10.578,3.9   c-0.399,0.146-0.662,0.526-0.662,0.95c0,0.424,0.264,0.804,0.662,0.95l10.579,3.902c8.564,3.158,15.316,9.91,18.475,18.475   l3.901,10.58c0.147,0.398,0.526,0.662,0.95,0.662c0.424,0,0.804-0.264,0.95-0.662l3.902-10.581   c3.158-8.564,9.909-15.315,18.474-18.474l10.581-3.902c0.398-0.146,0.662-0.526,0.662-0.95   C97.021,251.786,96.758,251.406,96.359,251.26z"/>
</g>
</svg>:''}
{loading?  <svg
                      className="spinner"
                     fill="white"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24">
                     
                      <g class="spinner_OSmW"><rect
                          x="11"
                          y="1"
                          width="2"
                          height="5"
                          opacity=".14" /><rect
                          x="11"
                          y="1"
                          width="2"
                          height="5"
                          transform="rotate(30 12 12)"
                          opacity=".29" /><rect
                          x="11"
                          y="1"
                          width="2"
                          height="5"
                          transform="rotate(60 12 12)"
                          opacity=".43" /><rect
                          x="11"
                          y="1"
                          width="2"
                          height="5"
                          transform="rotate(90 12 12)"
                          opacity=".57" /><rect
                          x="11"
                          y="1"
                          width="2"
                          height="5"
                          transform="rotate(120 12 12)"
                          opacity=".71" /><rect
                          x="11"
                          y="1"
                          width="2"
                          height="5"
                          transform="rotate(150 12 12)"
                          opacity=".86" /><rect
                          x="11"
                          y="1"
                          width="2"
                          height="5"
                          transform="rotate(180 12 12)" /></g>
                    </svg>:''}
            {data ? 'Predict Again':'Predict Now'}</button>
    </div>
</div>
<div className={styles.featuredmedia}>

    <div className={styles.media}>
    <Marquee autoFill={true} delay={-1} speed={80} gradient={false}>
{images && images.map((i,d)=>{
    
    return <img src={i}/>
})}

    </Marquee>
    <Marquee  autoFill={true} delay={-3} speed={80} gradient={false}>
{images && images.map((i,d)=>{
    return <img src={i}/>
})}

    </Marquee>
    <Marquee autoFill={true} delay={-5}  speed={80} gradient={false}>
{images && images.map((i,d)=>{
    return <img src={i}/>
})}

    </Marquee>
    <Marquee autoFill={true}  speed={80} gradient={false}>
{images && images.map((i,d)=>{
    return <img src={i}/>
})}

    </Marquee>
    <Marquee autoFill={true}  speed={80} gradient={false}>
{images && images.map((i,d)=>{
    return <img src={i}/>
})}

    </Marquee>
    
    </div>
    <div className={styles.mediashadow}></div>
    <div className={styles.featured_content}>
        <h2>Special PI Batch</h2>
        <p>for your IPMAT Personal Interview Preparation.</p>
        <a href="https://register.ipmcareer.com/pi-batch">Enroll Now @₹99</a>
    </div>
</div>
    </div> :

    <div className={st.mainholder}>
    <div className={st.logo}>

<img src='/hd-logo.svg'/>
</div>
    <h1>IPMAT Call Predictor Launching Soon</h1>
    <h2>Please Come Back Later</h2>
    <Timer/></div>
   } </>
}

const Content = ()=>{

    return <>
    <p>
      <strong>IPM Call Predictor</strong>
    </p>
    <p>
      The IPM Call Predictor is one of the most important tools for determining
      the college into which you can be admitted after passing the entrance exam.
    </p>
    <p>
      The fundamental idea behind this call predictor is to estimate the
      likelihood that a candidate with a specific rank and exam score will be
      accepted into a particular college.
    </p>
    <p>
      <strong>
        IPM Careers has developed BEST IPMAT/IPM Prediction Tool so far
      </strong>
      <br />
      &nbsp;
    </p>
    <p>
      <strong>Do you know?</strong>&nbsp;
    </p>
    <p>
      <br />
      An IPMAT Aspirant dives into his/her IPMAT preparation without knowing
      various possibilities and the selection criteria of an IIM Call. IPM Careers
      has created an AI Based Profile Calculator called the IPM Call Predictor in
      order to assist them in learning their chances of receiving an IIM Call
      based on their target IPMAT Score and Profile using the data gathered over
      years of experience.
    </p>
    <p>
      Set a target percentile for yourself for your IPMAT preparation so that you
      can get into the IIM of your dreams.
    </p>
    <p>
      <strong>
        &nbsp;IPM Call Predictor offers common answers to inquiries like:
      </strong>
    </p>
    <ul>
      <li>With my current profile, can I expect a call from IIMs?</li>
      <li>How much do I need to score in order to get into my ideal IIM?</li>
      <li>
        Will IIMs call me based on my current profile and score, even though it's
        high?
      </li>
    </ul>
    <p>
      <strong>HOW THE IPM CALL PREDICTOR WORKS</strong>
    </p>
    <p>&nbsp;</p>
    <p>
      Each IIM has its own distinct set of admissions requirements. This selection
      criteria is the culmination of a number of variables that were taken into
      account. Here is a list of a few of those elements:
    </p>
    <ul>
      <li>
        Your Class X, Class XII, Graduation, and/or Post-Graduation Grades in the
        Past
      </li>
      <li>Category/ Sub Category</li>
      <li>Gender Diversity</li>
      <li>College Stream Diversity</li>
      <li>IPMAT Score</li>
    </ul>
    <p>
      IPM Call Predictor gives you almost accurate prediction of the IIM call you
      will receive based on the aforementioned criteria because it has been
      equipped with the selection criteria of IIMs. The IPM Call Predictor
      analyses your profile parameters and compares it with the selection criteria
      of IIMs and provides you the list of IIMs about your chances of getting a
      call and the IPMAT Score required for the same.&nbsp;
    </p>
    <p>&nbsp;</p>
    <p>
      <strong>IPM Call Predictor: IIM Indore</strong>
    </p>
    <p>
      The cutoff score announced by the appropriate authorities should always be
      the benchmark that candidates compare their final score to.
    </p>
    <p>
      The IPM call predictor will determine who gets an admissions offer if their
      tentative marks are higher than the minimum cutoff required for their
      category.
    </p>
    <figure className="table">
      <table className="ck-table-resized">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "25%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td>Category</td>
            <td>QA</td>
            <td>MCQ</td>
            <td>SA</td>
          </tr>
          <tr>
            <td>GEN</td>
            <td>24</td>
            <td>35</td>
            <td>130</td>
          </tr>
          <tr>
            <td>EWS</td>
            <td>16</td>
            <td>23</td>
            <td>90</td>
          </tr>
          <tr>
            <td>OBC</td>
            <td>12</td>
            <td>22</td>
            <td>70</td>
          </tr>
          <tr>
            <td>SC</td>
            <td>4</td>
            <td>12</td>
            <td>60</td>
          </tr>
          <tr>
            <td>ST</td>
            <td>4</td>
            <td>7</td>
            <td>30</td>
          </tr>
          <tr>
            <td>PwD</td>
            <td>8</td>
            <td>17</td>
            <td>65</td>
          </tr>
        </tbody>
      </table>
    </figure>
    <p>
      <strong>IPM Call Predictor: IIM Rohtak</strong>
    </p>
    <p>
      Candidates should compare their scores with their scorecards in order to
      determine whether they have a chance of receiving a final admission to the
      college according to the IPM call predictor.
    </p>
    <p>
      It is important to keep in mind the cutoff scores from the previous year,
      which we have already mentioned.&nbsp;
    </p>
    <figure className="table">
      <table>
        <tbody>
          <tr>
            <td>
              <strong>Category</strong>
            </td>
            <td>
              <strong>IPMAT Rohtak Cut Off</strong>
            </td>
          </tr>
          <tr>
            <td>General</td>
            <td>368</td>
          </tr>
          <tr>
            <td>NC-OBC</td>
            <td>314</td>
          </tr>
          <tr>
            <td>SC</td>
            <td>274</td>
          </tr>
          <tr>
            <td>ST</td>
            <td>201</td>
          </tr>
          <tr>
            <td>EWS</td>
            <td>338</td>
          </tr>
          <tr>
            <td>PwD</td>
            <td>185</td>
          </tr>
        </tbody>
      </table>
    </figure>
    <p>
      <br />
      &nbsp;
    </p>
    <p>&nbsp;</p>
    <p>
      <strong>How to Use IPM Call Predictor?</strong>
    </p>
    <p>
      The IPM Call Predictor is a crucial tool for determining a candidate's
      eligibility for admission to the desired college as well as information
      about the college.&nbsp;
    </p>
    <p>
      It is advantageous to have a predetermined understanding of the top
      universities so that a candidate is admitted.
    </p>
    <p>Refer to the steps listed here to predict the IIM Call getting:</p>
    <ul>
      <li>
        Click on the link-{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://register.ipmcareer.com/call"
        >
          <span style={{ color: "#ffcc00" }}>
            https://register.ipmcareer.com/call
          </span>
        </a>
      </li>
      <li>IPM Call Predictor page will appear.</li>
      <li>
        Fill in the information asked like Full Name, Age, Select your category,
        and select your gender and Mobile Number.
      </li>
      <li>Click on 'Predict Now'.</li>
    </ul>
    <p>
      <strong>Conclusion&nbsp;</strong>
    </p>
    <p>
      The IPM Call Predictor aids applicants in estimating their likelihood of
      admission (IIM).
    </p>
    <p>
      <br />
      To calculate the likelihood of admission, the candidate's profile and the
      cut-off from the previous year are considered.
    </p>
    <p>
      <br />
      It also offers details on the colleges, the cut-off, the placement
      opportunities, and other relevant data. Students can effectively learn about
      the admissions process and use it to inform their decisions.
    </p>
  </>
  
}

export default Call;