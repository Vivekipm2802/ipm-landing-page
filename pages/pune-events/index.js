import { useEffect, useState } from 'react';
import FAQ from '../../components/FAQ';
import Review from '../../components/Review';
import Section from '../../components/Section';
import PuneLayout from '../../layouts/PuneLayout';
import styles from './PuneEvents.module.css'
import CustomSelect from '../../components/CustomSelect';
import { years } from '../../utils/years';
import { scroller } from 'react-scroll'
import AccModule from '../../components/AccModule';
import Offer from '../../components/OfferPopup';
import axios from 'axios';
import { supabase } from '../../utils/supabaseClient';
import Notifications from '../../components/Notification';
import GradientMarquee from '../../components/GradientMarquee';
import Head from 'next/head';
import {useRouter} from 'next/router'
import ImageUploader from '../../components/ImageUploader';
const Button = (props)=>{

    const a = props?.data;
    return <div className={styles.button}>
        <div onClick={()=>{props?.onClick()}}>{a.text} {a.price}</div>
        <p>{a.description}</p>
    </div>
}

function PuneEvents(props){
    const scrollToSection = (a) => {

        scroller.scrollTo(a,{
          duration: 400,
        delay: 0,
        smooth: true,
        
        offset: -10, 
        })
      }
const [formData,setFormData] = useState();
const [isSubmitted,setSubmitted] = useState(false);
const [isSubmitted2,setSubmitted2] = useState(false);
const [loader,setLoader] = useState(false);
const [notificationText,setNotificationText] = useState();
const [timeoutId, setTimeoutId] = useState(null);



const hero = {
  title:"Ultimate IPM Success Session",
  description:""
}



useEffect(()=>{
  if(props.data && props?.data[0]?.data != undefined){
  setDat(props?.data[0].data)}
},[])


function setNotification(de){
    if(timeoutId){
      clearTimeout(timeoutId)
    }
  
    setNotificationText(de);
     const id = setTimeout(()=>{setNotificationText(),setTimeoutId(null),console.log('notcall')},2500);
     setTimeoutId(id)
  }


const [dat,setDat] = useState({
    regiser:{
        formTitle:'Register for IPM Success Session Now',
        formPromoText:"Don't Miss ! Hurry Up Limited Seats Available",
        formBenefits:[
          "Ask me Anything",
          "Eligibility Criteria",
          "Admissions & Seats",
          "Common mistakes done by IPMAT aspirants",
          "How to crack IPMAT",
          "Comprehensive Preparation",
          "Use of Mnemonics",
          "Q & A - Opportunity to ask all Questions/ Doubts"
        ],
        redirect:{
          enabled:true,
          link:"https://www.instamojo.com/@DESIGN_CORP_CONSULTANCY/l1d591c9a6f1343d3898d79daa6f44648/"
        },
    },
    hero:{
        eventName:'Ultimate IPM Success Session',
        title:'',
        description:'The Game Changer Session for IPMAT Aspirants full of IPMAT Tips & Tricks shared by the experts',
        benefits:[
            'Mentors from multiple IIMs and IITs',
            'Comprehensive Guide for all IPMAT Aspirants',
            'Doubt Clearing Session',
            'Top Strategy & Tips for IPMAT 2024'
        ],
        
        date:'25-12-2023',
        time:'5:30 PM',
        branch:"Pimpri Branch",
        address:"XYZ addresss , Pune , Maharashta - 411018",
        map:"",
        video:'https://www.youtube.com/embed/6ZsYsn-ykpk',
        image:'https://images.unsplash.com/photo-1616400619175-5beda3a17896?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

    },
    
    promo:{
title:'IPM Success Session is just for you',
description:'In this powerpacked session you are going to learn about special strategy that you must apply to get into your Dream IIM',
image:'/39.jpg'
    
},

    button:{
        text:'Register Now for',
        price:'Rs.99',
        description:'Book your slot for Just Rs.99! We have limited seats available!',

    },
    reviews:[
        {
            "badge": "IIM Indore",
            "image": "https://www.ipmcareer.com/files/2022/08/WhatsApp-Image-2022-08-11-at-11.41.49-AM.jpeg",
            "rating": 5,
            "comment": "Faculty at IPM Career is extremely dedicated and hardworking.",
            "review_date": "2023-09-19",
            "reviewer_name": "Jiya Kejriwal"
        },
        {
            "badge": "IIM Rohtak",
            "image": "https://www.ipmcareer.com/files/2022/08/WhatsApp-Image-2022-07-30-at-8.26.20-PM.jpeg",
            "rating": 4,
            "comment": "My experience as an IPM aspirant was truly memorable, The faculty team was extremely supportive.",
            "review_date": "2023-09-18",
            "reviewer_name": "Juhi Mehra"
        },
        {
            "badge": "IIM Indore",
            "image": "https://www.ipmcareer.com/files/2023/01/WhatsApp-Image-2023-01-06-at-1.54.33-PM-e1673093647344.jpeg",
            "rating": 5,
            "comment": "I learned a lot of tips & tricks at IPM Careers which were really game changing and it boosted my perspective of learning along.",
            "review_date": "2023-09-17",
            "reviewer_name": "Akshita Maheshwari"
        }
      
    ],
    faqs:[
      {
        "question": "What is the marking scheme of IPMAT?",
        "answer": "For every correct response <b>+4 marks</b> are awarded. For incorrect response <b>1 mark</b> is deducted. However, there is <b>no negative marking</b> for SA questions."
      },
      {
        "question": "What is the selection process for the IPM program?",
        "answer": "The candidates need to appear for the Aptitude Test conducted by IIM-Indore (or SAT for international applicants). Shortlisted candidates will be called for a round of Personal Interview."
      },
      {
        "question": "What is the eligibility criteria for candidates?",
        "answer": "General and NC-OBC Category: Minimum <b>60%</b> in X and XII standards or equivalent examinations, Maximum <b>20 years</b> of age as of July 31, 2019. SC, ST, and DA Category: Minimum <b>55%</b> in X and XII or equivalent examinations, Maximum <b>22 years</b> of age as of July 31, 2019."
      },
      {
        "question": "What is the duration of the IPM program offered by IIM?",
        "answer": "IPM program is a <b>5-year program</b>. Total course is divided into <b>15 terms</b>. Each year, students have to clear <b>3 terms</b>."
      },
      {
        "question": "What is a good score in IPMAT?",
        "answer": "IPMAT 2023 Analysis and Cutoff: Moderate test with tough Quantitative Ability section - Quantitative Ability (SA) 20: 36-40, Quantitative Ability (MCQ) 40: 60-68, Verbal Ability (MCQ) 40: 112-120."
      },
      {
        "question": "How is the IPMAT cutoff marks decided?",
        "answer": "The IPMAT Cut off Marks are decided considering various factors like<ol><li>Total number of candidates appearing for IPMAT exam</li><li>Total number of available seats</li><li>The cutoff trends of the previous year</li><li>Reservation of seats</li><li>Marking scheme</li><li>The difficulty level of the exam</li><li>Performance of the applicants in the exam</li><li>Lowest and average marks attained by the aspirants in IPMAT</li></ol>"
      },
      {
        "question": "How many IIMs are offering the IPM program?",
        "answer": "With the official announcement by IIM Jammu, now we have a total of <b>5 IIMs</b> offering the IPM program:<ul><li>IIM INDORE</li><li>IIM ROHTAK</li><li>IIM RANCHI</li><li>IIM BODHGAYA</li><li>IIM JAMMU</li></ul>"
      }
    ],
    highligts:[
        {
            title:'Secret Strategies',
            image:'https://static.thenounproject.com/png/345852-200.png'
        },
        {
            title:'Top Notch Mentors',
            image:'https://static.thenounproject.com/png/1112698-200.png'
        },
        {
            title:'1-1 Doubt Clearing',
            image:'https://svgsilh.com/svg_v2/40876.svg'
        },
        {
            title:'Best IPMAT Session',
            image:'https://www.svgrepo.com/download/62895/book.svg'
        }
    ],
    batch:{
      title:"Ultimate Success Batch",
      prefix:"Batch starts from",
      date:"19-01-2024",
      time:"7:35",
      buttontext:"Enrol Now",
      link:""
      
    },
    sectionTitles:[
      
      {title:"Frequently Asked:Questions"},
      {title:"Students:Testimonials"},
      {title:"Our:Batches"}
    ],
    marqueeText:`Join Best IPMAT Event for all IPMAT Aspirants | `
});
const router = useRouter()
function cronberryTrigger(username, u_email, u_mobile, u_year, u_city, linke) {

    console.log(arguments)
  
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
                "paramValue": u_year
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
                "paramValue": "Main Landing Page"
            }
        ]
    });
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function() {
  
        if (this.readyState === 4) {
            
            setLoader(false)
            setNotification('Submitted Successfully')
            setSubmitted(true);
           
  
        }
    });
    xhr.open("POST", "https://register.cronberry.com/api/campaign/register-audience-data");
    xhr.setRequestHeader("Content-Type", "application/json");
  
  
    xhr.send(data);
  }
  
  
function validatePhone(phone) {
  const re =  /^(\+\d{1,4})?(?!0+\s+,?$)\d{10}\s*,?$/;
  return re.test(phone);
}

useEffect(()=>{
if(isSubmitted == true && isSubmitted2 == true){
  if(dat.regiser.redirect.enabled == true){
    router.push(dat.regiser.redirect?.link)
  }
}

},[
  isSubmitted,isSubmitted2
])

const formfields = [
  {
    name:"name",
    type:"text",
    label:"Student Name",
    placeholder:"Please enter your full name",
    key:"name"
    
  },
  {
    name:"parentname",
    type:"text",
    label:"Parent Name",
    placeholder:"Please enter your full name",
    key:"parentname" 
  },
  {
    name:"phone",
    type:"tel",
    label:"Contact Number",
    placeholder:"Please enter a 10 Digit mobile number",
    key:"phone" 
  },
  {
    name:"class",
    type:"radio",
    label:"Class Enrolled in",
    items:[
      {
        title:"11th Std",
        value:"11th Std"
      },
      {
        title:"12th Std",
        value:"12th Std"
      },
      {
        title:"Other",
        value:"Other"
      }
    ],
    key:"class", 
  },
  {
    name:"stream",
    type:"radio",
    label:"Stream",
    items:[
      {
        title:"Science",
        value:"Science"
      },
      {
        title:"Commerce",
        value:"Commerce"
      },
      {
        title:"Arts",
        value:"Arts"
      },
      {
        title:"Other",
        value:"Other"
      }
    ],
    key:"stream", 
  },
  {
    name:"area",
    type:"text",
    label:"Area of Residence in Pune",
    placeholder:"Please enter your area of residence",
    key:"area" 
  },
  {
    name:"preference",
    type:"radio",
    label:"Preference to Know More",
    items:[
      {
        title:"On Call",
        value:"On Call"
      },
      {
        title:"By visiting the centre",
        value:"By visiting the centre"
      }
    ],
    key:"preference", 
  }
]

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
async function SubmitContact(){
    if(formData == undefined){
      setNotification('All Fields are empty')
      return null
    }
    if (!formData.name || formData.name.trim() === '') {
      setNotification('Fullname field is empty');
      return null;
    }
    if (!formData.parentname || formData.parentname.trim() === '') {
      setNotification('Parent Name field is empty');
      return null;
    }
  
  
  
   
  
    
    if (!formData.phone || formData.phone.trim() === '') {
      setNotification('Phone field is empty');
      return null;
    }
  
    // Validate the phone number
    const phoneRegex = /^[0-9]{10}$/; // Change the regex pattern as needed
    if (!phoneRegex.test(formData.phone)) {
      setNotification('Phone number is not valid');
      return null;
    }
  
    // Check year
   /*  if (!formData.year || formData.year.trim() === '') {
      setNotification('Year field is empty');
      return null;
    } */
  
    // Validate the year
   /*  const year = parseInt(formData.year);
    if (isNaN(year) || year < 1900 || year > 2099) {
      setNotification('Year is not valid');
      return null;
    } */
  
    // Check city
    if (!formData.area || formData.area.trim() === '') {
      setNotification('Area field is empty');
      return null;
    }
    if (!formData.preference || formData.preference.trim() === '') {
      setNotification('Preference field is empty');
      return null;
    }
    if (!formData.class || formData.class.trim() === '') {
      setNotification('Please Select Class');
      return null;
    }
    if (!formData.stream || formData.stream.trim() === '') {
      setNotification('Please Select Stream');
      return null;
    }
  
      setLoader(true)
      
      
      triggerInterakt();
        /* await axios.post('/') */
        cronberryTrigger(formData.fullname,'undefined',formData.phone,'Not Applicable','Pune','https://register.ipmcareer.com/pune-events');
        const {data,error} = await supabase.from('pune_leads').insert({
          name:formData?.name,parentname:formData?.parentname,stream:formData?.stream,clas:formData?.class,preference:formData?.preference,area:formData?.area,phone:formData?.phone,
  
      }).select();
      if(data){
        console.log("inserted");
        setSubmitted2(true)
      }else if(error){
        console.log(error)
      }
   
   
  }

  
async function triggerInterakt(){
    axios.post('/api/interakt',{
      userId: Date.now(),
      phoneNumber: formData.phone,
      countryCode: "+91",
      event: "Campaign Notification",
      name: formData.fullname,
      email: formData.email,
  
      tag: "Landing Page, Pune"
    }).then(res=>{
      console.log(res)
    }).catch(res=>{
      console.log(res)})
  }
  function checkValueType(value) {
    if (typeof value === 'string' || value === '' || value?.length === 1) {
      return 'text';
    } else if (Array.isArray(value)) {
      return 'array';
    } else if (typeof value === 'object' && value !== null) {
      return 'object';
    } else {
      return 'unknown';
    }
  }
  function camelCaseToText(camelCaseString) {
    // Replace capital letters with space followed by the lowercase letter
    return camelCaseString.replace(/([A-Z])/g, ' $1')
                        // Capitalize the first letter
                        .replace(/^./, function(str){ return str.toUpperCase(); });
  }

  const [activeA,setActiveAContent] = useState();
const [activeAdmin,setActiveAdmin] = useState(false);


async function updateData(a){
  if(a == undefined ){
setNotification('Invalid JSON')
return null
  }

 
  const {data,error} = await supabase.from('landing-page').update({data:a}).eq("slug","pune-events").select();
  if(data){
    setNotification('Updated')
  }else{
    setNotification('Error Occured')
  }
}



    return <PuneLayout>

        <Head>
        <title>IPM Careers Pune</title>
        <meta name="description" content="IPM Careers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={'/favicon_active.svg'} />
      </Head>
      {props?.admin == true && !activeAdmin ? <div onClick={()=>{setActiveAdmin(true)}} className={styles.edit}><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.94 5 19 10.06 9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L13.938 5Zm7.09-2.03a3.578 3.578 0 0 1 0 5.06l-.97.97L15 3.94l.97-.97a3.578 3.578 0 0 1 5.06 0Z" fill="#222F3D"/></svg>EDIT PAGE</div>:""}
      {props?.admin == true ?  <div className={styles.admin + " " + (activeAdmin == true ? styles.activeAdmin : '')}>
<div className={styles.close} onClick={()=>{setActiveAdmin(false)}}><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 5a.75.75 0 0 0-.743.648l-.007.102v3.5h-3.5a.75.75 0 0 0-.102 1.493l.102.007h3.5v3.5a.75.75 0 0 0 1.493.102l.007-.102v-3.5h3.5a.75.75 0 0 0 .102-1.493l-.102-.007h-3.5v-3.5A.75.75 0 0 0 12 7Z" fill="#de2121"/></svg></div>
        {dat != undefined ? 
        <div>
{Object.entries(dat).map((i,d)=>{
  return <><h2 className={styles.adminheading}>{camelCaseToText(i[0])}</h2>
  <div className={styles.main}>
{checkValueType(i[1]) == "text" ? <>{i[0] == "image" ? <ImageUploader data={{image:i[1]}} onUploadComplete={(e)=>{setDat(res=>({...res,[i[0]]:e}))}}></ImageUploader>:<input type={["date","time"].includes(i[0])? i[0].toLowerCase  : "text"} className={styles.input + " " + styles.full} placeholder={`Edit ${i[0]} text`} value={i[1]} onChange={(e)=>{setDat(res=>({...res,[i[0]]:e.target.value}))}}></input>}</>:''}


{checkValueType(i[1]) == "array" ? <>


{i[1]?.map((g,t)=>{
  return <div className={styles.aitem}><div className={styles.actitle} onClick={()=>{setActiveAContent(res=>({...res,g:t,i:d}))}}>Item {t} </div> 
  {activeA?.g == t && activeA?.i == d ? "":<div className={styles.close + " " + styles.red} onClick={()=>{setDat((res) => ({
  ...res,
  [i[0]]: [
    ...res[i[0]].slice(0, t),
    ...res[i[0]].slice(t + 1),
  ],
}));}}>
    DELETE
  </div>}
  <div className={styles.acontent + " " + (activeA?.g == t && activeA?.i == d ? styles.activeacontent:'')}>
  {checkValueType(g) == "object" ? Object.entries(g).map((l,p)=>{
    return <>{l[0] == "image" ? <ImageUploader data={{image:l[1]}} onUploadComplete={(e)=>{setDat(

      (res) => ({
        ...res,
        [i[0]]: i[1].map((item, index) =>
          index === t
            ? {
                ...item,
                [l[0]]: e,
              }
            : item
        ),
      })
    )}}></ImageUploader>:
   <> <label>{l[0]}</label><input type={["date","time"].includes(l[0])? l[0].toLowerCase  : "text"} className={styles.input + " " + styles.full} placeholder={`Edit ${l[0]} text`} value={i[1][t][l[0]]} onChange={(e)=>{
      setDat(
        (res) => ({
          ...res,
          [i[0]]: i[1].map((item, index) =>
            index === t
              ? {
                  ...item,
                  [l[0]]: e.target.value,
                }
              : item
          ),
        })
      )
    
    }}></input></>}</>
  })
 
  :""}</div>
  
  </div>
})}
<div className={styles.add} onClick={()=>{
  setDat((res) => ({
    ...res,
    [i[0]]: [...res[i[0]], { ...res[i[0]][res[i[0]].length - 1] }],
  }));
  
  }}>Add More</div>
</>:""}



{checkValueType(i[1]) == "object" ? Object.entries(i[1]).map((z,v)=>{
  return <><h6 >{camelCaseToText(z[0])}</h6>{checkValueType(z[1]) == "text" ? <>{z[0] == "image" ? <ImageUploader data={{image:z[1]}} onUploadComplete={(e)=>{
    setDat(prevState => ({
      ...prevState,
      [i[0]]: {
        ...prevState[i[0]],
        [z[0]]: e, // Replace 'new value' with the actual value you want to set
      },
    }))

  }}></ImageUploader> :<input
  type={["date","time"].includes(z[0].toLowerCase) ? z[0].toLowerCase : "text"}
  className={styles.input + " " + styles.full} placeholder={`Edit ${z[0]} text`} value={i[1][z[0]]} onChange={(e)=>{setDat(prevState => ({
    ...prevState,
    [i[0]]: {
      ...prevState[i[0]],
      [z[0]]: e.target.value, // Replace 'new value' with the actual value you want to set
    },
  }))}}></input>}</>:''}
  
  {/* Object -> Array */}
  {checkValueType(z[1]) == "array" ? z[1]?.map((e,r)=>{
    console.log("Index :" + r + "Value : " + i[1][z[0]][r],checkValueType(e[1]))
return <>{checkValueType(e[1]) == "text" || e[1] == null ? <input style={{marginLeft:"5%", width:"95%" }}
type={["date","time"].includes(z[0].toLowerCase) ? z[0].toLowerCase : "text"}
className={styles.input + " " + styles.full} placeholder={`Edit ${z[0]} text`} value={i[1][z[0]][r]} onChange={(e)=>{

  setDat((prevState) => ({
    ...prevState,
    [i[0]]: {
      ...prevState[i[0]],
      [z[0]]: [
        ...prevState[i[0]][z[0]].slice(0, +r), // Convert 'r' to a number using unary plus operator
        e.target.value,
        ...prevState[i[0]][z[0]].slice(+r + 1), // Convert 'r' to a number using unary plus operator
      ],
    },
  }));

}}></input>:""}</>

  }):""}
  
  
  
  {/* Object Check  */}

  {checkValueType(z[1]) == "object" ? Object.entries(z[1]).map((m,n)=>{

return <>
{checkValueType(m[1]) == "text" ? <input
  type={["date","time"].includes(m[0].toLowerCase) ? m[0].toLowerCase : "text"}
  className={styles.input + " " + styles.full} placeholder={`Edit ${z[0]} text`} value={i[1][z[0]][m[0]]} onChange={(e)=>{setDat(prevState => ({
    ...prevState,
    [i[0]]: {
      ...prevState[i[0]],
      [z[0]]: {...prevState[i[0]][z[0]],[m[0]]:e.target.value}, // Replace 'new value' with the actual value you want to set
    },
  }))}}></input>:''}</>

  }):''}
  
  </>
}):""}
  </div>
  </>
})}

        </div>
        :''}

        <div className={styles.update} onClick={()=>{updateData(dat)}}>Update</div>
      </div>:""}
        {notificationText && notificationText.length > 2 ? <Notifications text={notificationText} /> : ''}
        
     <Offer onClose={()=>{setSubmitted(false)}} submitted={isSubmitted}></Offer>
    <div className={styles.mainholder}>

<div className={styles.hero}>
    <img className={styles.heroimage} src={dat.hero.image}/>
    <div className={styles.herocontent}>
<h2>{dat.hero.eventName}</h2>
<h3>{dat.hero.description}</h3>
<p className={styles.dnt}>Date : {dat.hero.date} | Time : {dat.hero.time}</p>
<div className={styles.location}>
  <h2>{dat.hero.branch}</h2>
  {dat?.hero?.address != undefined && dat?.hero?.address != null ? <h4><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.157 16.882-1.187 1.174c-.875.858-2.01 1.962-3.406 3.312a2.25 2.25 0 0 1-3.128 0l-3.491-3.396c-.439-.431-.806-.794-1.102-1.09a8.707 8.707 0 1 1 12.314 0ZM14.5 11a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" fill="var(--brand-col1)"/></svg>{dat.hero.address}</h4>:""}
  {dat?.hero?.map != undefined && dat?.hero?.map != null ? <a href={dat?.hero?.map}>Open in Maps</a>:""}
</div>
    </div>
</div>

<Section noMin fullWidth>
<div className={styles.details}>
    <div className={styles.left}>
    <iframe className='rounded-lg overflow-hidden min-h-[50vw] lg:min-h-[30vw] w-full'
  width="100%"
  height="100%"
  src={dat.hero.video}
  frameborder="0"
  allowfullscreen="true"
></iframe>
    {/* <p>{dat.hero.description}</p>
<p>{dat.hero.date} | {dat.hero.time}</p> */}

</div>
<div className={styles.benefits}>
    {dat.hero.benefits && dat?.hero?.benefits?.map((i,d)=>{
        return <li><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.22 6.97-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06Z" fill="#ffffff"/></svg>{i}</li>
    })}

    <Button onClick={()=>{scrollToSection('form')}} data={dat.button}></Button>
</div>
</div></Section>

<Section fullWidth>
<div className={styles.form} id="form">
    <div className={styles.info}>
        <h2>{dat.regiser?.formPromoText}</h2>
        <div className={styles.benefits + " " + styles.bene2}>
        {dat.regiser && dat.regiser?.formBenefits.map((i,d)=>{
          return <li><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.22 6.97-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06Z" fill="#ffffff"/></svg>{i}</li>
        })}</div>
    </div>
    <div className={styles.c2}>
  <div className={styles.formcont}>
<h1 className={styles.team_heading}>{dat.regiser.formTitle}</h1>
{formfields && formfields?.map((i,d)=>{
  return <>{i.type == "text" || i?.type == "tel" ? <>
  <label>{i.label}</label>
  <input name={i.name} className={styles.input} placeholder={i?.placeholder} type={i?.type} value={formData && formData[i.key]} onChange={(e)=>{setFormData(res=>({...res,[i.key]:e.target.value})) }}/></> : <>
  <p>{i.label}</p>
  <div className={styles.radiogroup}>
  {i?.items && i?.items.map((z,v)=>{
    return <div className={styles.radio}><input type="radio" id={z.value} name={i.key} value={z.title} onClick={(e)=>{setFormData(res=>({...res,[i.key]:e.target.value}))}}/>
    <label for={z.value}>{z.title}</label></div>
   
  })}</div>
  
  </>}</>
})}
{/* <CustomSelect z={9} full="true" defaultText="When are you planning to take IPM?" noPadding={true} objects={years} setSelect={(r)=>{setFormData(res=>({...res,year:r}))}}/> */}
{formData && formData.city && formData.fullname && formData.phone && formData.email && formData.year? '':<p className={styles.error}>Please fill all the fields</p>}
{/* <div onClick={TestApi} className={styles.submit}>TEST</div> */}
<Button data={dat.button} onClick={()=>{SubmitContact()}}></Button>
{/* <div className={styles.encrypt}>
<svg
    xmlns="http://www.w3.org/2000/svg"
    id="Layer_1"
    data-name="Layer 1"
    viewBox="0 0 93.63 122.88"
    
  >
    <defs>
      <style>{".cls-2{fill-rule:evenodd;fill:#36464e}"}</style>
    </defs>
    <title>{"padlock"}</title>
    <path
      d="M6 47.51h81.64a6 6 0 0 1 6 6v63.38a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V53.5a6 6 0 0 1 6-6Z"
      style={{
        fillRule: "evenodd",
        fill: "#fbd734",
      }}
    />
    <path
      className="cls-2"
      d="m41.89 89.26-6.47 16.95h22.79l-6-17.21a11.79 11.79 0 1 0-10.32.24ZM83.57 47.51H72.22v-9.42a27.32 27.32 0 0 0-7.54-19 24.4 24.4 0 0 0-35.73 0 27.32 27.32 0 0 0-7.54 19v9.42H10.06v-9.42a38.73 38.73 0 0 1 10.72-26.81 35.69 35.69 0 0 1 52.07 0 38.67 38.67 0 0 1 10.72 26.81v9.42Z"
    />
  </svg>
<p>Your Data is End-to-End Encrypted!</p>
</div> */}
</div>
</div>
</div></Section>
<GradientMarquee straight={true} text={dat.marqueeText}></GradientMarquee>
<Section fullWidth title={dat.hero.eventName + ":Highlights"} align="center" color="var(--brand-col2)">
   
    <div className={styles.cards}>
        {dat?.highligts && dat?.highligts?.map((i,d)=>{
            return <div className={styles.card}>
                <img src={i.image}/>
                <h2>{i.title}</h2>
            </div>
        })}
    </div>
</Section>
{/* FAQs */}
<Section>
    <div className={styles.inner}>
        <img src={dat.promo.image}/>
        <div className={styles.promo}>
            <h2>{dat.promo.title}</h2>
            <p>{dat.promo.description}</p>
            <Button onClick={()=>{scrollToSection('form')}} data={dat.button}></Button>
        </div>
    </div>
</Section>
<Section noMin title={dat?.sectionTitles[0]?.title} color="var(--brand-col1)">
<div className={styles.faq}>

    <AccModule data={dat.faqs}></AccModule>
  
</div></Section>
<Section noMin title={dat?.sectionTitles[1]?.title} color="var(--brand-col1)">
<div className={styles.reviews}>
  {dat.reviews != undefined && dat.reviews.map((i,d)=>{
    return <Review data={i}></Review>
  })}  
  </div>
  <Button onClick={()=>{scrollToSection('form')}} data={dat.button}></Button>
  </Section>
  <Section noMin title={dat?.sectionTitles[2]?.title} color="var(--brand-col1)">
    <div className={styles.batcholder}>
<div className={styles.batches + " " + (dat?.batch?.link != null  ? styles.pointer :'')} >
  <div className={styles.circle}>
    
     </div>
     <div className={styles.star}>
     <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.788 3.103c.495-1.004 1.926-1.004 2.421 0l2.358 4.777 5.273.766c1.107.161 1.549 1.522.748 2.303l-3.816 3.72.901 5.25c.19 1.103-.968 1.944-1.959 1.424l-4.716-2.48-4.715 2.48c-.99.52-2.148-.32-1.96-1.424l.901-5.25-3.815-3.72c-.801-.78-.359-2.142.748-2.303L8.43 7.88l2.358-4.777Z" fill="#F2C511"/></svg>4.9(81)
     </div>
     <h2>{dat.batch?.title || "Batch Title Not Found"}</h2>
    <div className={styles.batchstart}><p>{dat.batch?.prefix} : <span>{dat.batch?.date} - {dat.batch?.time}</span></p></div> 
    <div className={styles.enroll}>{dat?.batch?.link != undefined && dat?.batch?.link?.length > 2  ? <a href={dat?.batch?.link || "#"}>{dat.batch?.buttontext}</a>:""}</div>
</div>
<p>A career in Integrated Program in Management (IPM) can make your professional life perfect, rewarding & satisfying. But, often students take the decision late enough and that delays their entire growth process and to reach the much dreamt-of success point in their career.
</p>
</div>
  </Section>
    </div></PuneLayout>
}

export default PuneEvents;

export async function getServerSideProps(){


const {data,error} = await supabase.from('landing-page').select("*").eq('slug','pune-events');



return {props:{data}}

}