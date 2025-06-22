import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import {useState,useEffect} from 'react'
import styles from './Home.module.css'
import FAQ from '../components/FAQ' 
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import Notifications from '../components/Notification'
import YouTube from 'react-youtube';
import axios from 'axios';
import Section from '../components/Section'
import * as performance from '../public/performance.json'
import * as learning from '../public/learning.json'
import * as app from '../public/app.json'
const inter = Inter({ subsets: ['latin'] })
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import 'swiper/css'
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay'
import Switcher from '../components/Switcher'
import CustomSelect from '../components/CustomSelect'
import ImageTab from '../components/ImageTab'
import { supabase } from '../utils/supabaseClient'
import { years } from '../utils/years'
import { result } from '../utils/contants'

export default function Home() {

const [isSubmitted,setSubmitted] = useState(false)
  const [scrolled,setScrolled] = useState();
const [favicon,setFavicon] = useState('/favicon_ipm.svg');
const [students,setStudents] = useState(5355)
const [loader,setLoader] = useState(false);
const [currentSub,setSub] = useState('Register Now')
const [activePopup,setActivePopup] = useState(false);
const [notificationText,setNotificationText] = useState();
const [timeoutId, setTimeoutId] = useState(null);
const [datahtml,setHtml] = useState();
const [formData,setFormData] = useState();


const animdata = [
    {
        image:'/ss3.png',
    },{
        image:'/ss2.png'
    },{
      image:'/ss.png',
    }
]
const mocks = [

    {
        title:'Mini Test Series',
        price:'₹1999',
        link:'https://pages.razorpay.com/pl_JTv40jE6Ekhcbo/view',
        image:'https://www.ipmcareer.com/wp-content/uploads/2022/05/Min-test.jpg',
        content:"<ul class=\"no-bullet arrow-starter\"><li>10 IPM Mocks</li><li>5 JIPMAT Mock Test</li><li>5 Rohtak Mock Test</li>\r\n<li><span style=\"font-weight: 400;\">In depth analysis for every mock</span></li>\r\n<li><span style=\"font-weight: 400;\">Devise your own test taking strategy</span></li>\r\n</ul>",

    },
    {
        title:'Basic Test Series',
        price:'₹3950',
        link:'https://pages.razorpay.com/pl_JTvDTdnXIdarBm/view',
        image:'https://www.ipmcareer.com/wp-content/uploads/2022/05/basic.jpg',
        content:"<ul>\r\n<li><span style=\"font-weight: 400;\">20 IPM Mocks</span></li>\r\n<li><span style=\"font-weight: 400;\">170 + Topic wise test</span></li>\r\n<li><span style=\"font-weight: 400;\">In depth analysis for every mock</span></li>\r\n<li><span style=\"font-weight: 400;\">Devise your own test taking strategy</span></li>\r\n</ul>",

    },
    {
        title:'Advance Test Series',
        price:'₹5950',
        link:'https://pages.razorpay.com/pl_JTvGn41b1YqGsg/view',
        image:'https://www.ipmcareer.com/wp-content/uploads/2022/05/davance.jpg',
        content:"<ul>\r\n<li><span style=\"font-weight: 400;\">35 BBA + 20 IPM Mocks</span></li>\r\n<li><span style=\"font-weight: 400;\">240 + Topic wise test</span></li>\r\n<li><span style=\"font-weight: 400;\">In depth analysis for every mock</span></li>\r\n<li><span style=\"font-weight: 400;\">Personalised online Resource Platform</span></li><li>Mentorship session by Ashutosh Sir (IIM A Alum)</li>\r\n</ul>",

    }
]



const testimonials =[{
  icon:'/trusty.svg',
 heading:'Trusted by 5000+ Aspirants'

},
{
  icon:'/topper.svg',
 heading:'Comparison with Topper'

}
,
{
  icon:'/ai.svg',
 heading:'AI Based Test Series'

},
{
  icon:'/pattern.svg',
 heading:'Accurate Pattern'

},
{
  icon:'/ind.svg',
 heading:'Remedial Test as per Individual'

}]

const heading=['Register Now','Its Free','Limited Seats','Best Coaching']
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
              "paramValue": "HASH IPMAT"
          }
      ]
  });
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function() {

      if (this.readyState === 4) {
          
          setLoader(false)
          setNotification('Submitted Successfully')
          setSubmitted(true)

      }
  });
  xhr.open("POST", "https://api.cronberry.com/cronberry/api/campaign/register-audience-data");
  xhr.setRequestHeader("Content-Type", "application/json");


  xhr.send(data);
}

const mentors=[
  {

    image:'https://www.ipmcareer.com/wp-content/uploads/2023/01/Ashutosh-Sir-e1641723253112.webp',
    fullname:'Ashutosh Mishra',
    role:'Master IIM Ahmedabad',
    role2:'Bachelors Thapar University',
    bg:'https://www.ipmcareer.com/wp-content/uploads/2023/01/IIMA-LKP_0-1.webp'
  },
  {

    image:'https://www.ipmcareer.com/wp-content/uploads/2016/11/deepak-kushwaha-350x350.jpg',
    fullname:'Deepak Kushwaha',
    role:'Master IIM Lucknow',
    role2:'Bachelors NIT Srinagar',
    bg:'https://www.ipmcareer.com/wp-content/uploads/2023/01/img-slider-4-1-1.webp'
  },
  {

    image:'https://www.ipmcareer.com/wp-content/uploads/2023/01/Screen-Shot-2021-01-10-at-3.24.16-PM-283x350-1-1.png',
    fullname:'Taruna Khanna',
    role:'GCC UCLA Extension',
    bg:'https://www.ipmcareer.com/wp-content/uploads/2023/01/education-concept-student-studying-brainstorming-campus-concept-close-up-students-discussing-their-subject-books-textbooks-selective-focus-660x330-1.webp'
    
  },
  {

    image:'https://www.ipmcareer.com/wp-content/uploads/2022/06/IMG_1848-350x350.jpg',
    fullname:'Dr. Swati A. Mishra',
    role:'Director Operations Lucknow Centre',
    role2:'Former Professor IIM Lucknow',
    bg:'https://cdn.britannica.com/85/13085-050-C2E88389/Corpus-Christi-College-University-of-Cambridge-England.jpg'
    
  },
  {

    image:'https://www.ipmcareer.com/wp-content/uploads/2023/01/manish.jpeg',
    fullname:'Manish Dixit',
    role:'IIT BHU Alumnus',
    
    bg:'https://www.ipmcareer.com/wp-content/uploads/2023/01/iit_bhu_slider_03-1.webp'
    
  },
  {

    image:'https://www.ipmcareer.com/wp-content/uploads/2022/01/WhatsApp-Image-2022-01-09-at-4.49.41-PM-e1641850793724-350x350.jpeg',
    fullname:'Rishabh Singh',
    role:'IIFM Bhopal Alumnus',
    bg:'https://www.careerindia.com/img/2013/10/24-indianinstituteofforestmanagement.jpg'
    
  },
  {

    image:'https://www.ipmcareer.com/wp-content/uploads/2022/12/WhatsApp-Image-2022-12-15-at-7.11.51-PM-e1671269681720.jpeg',
    fullname:'Divyansh Mishra',
    role:'IIM Raipur',
    bg:'https://www.ipmcareer.com/wp-content/uploads/2023/01/jpg-1.webp'
    
  },
  {

    image:'https://www.ipmcareer.com/wp-content/uploads/2022/01/Rishita-e1672914918610-350x350.jpg',
    fullname:'Rishita Gupta',
    role:'Multiple IIMs Call Getter',
    bg:'https://backend.insideiim.com/wp-content/uploads/2017/04/IIM_Collage.jpg'
    
  }
]

const slides = [{
  image:'https://www.ipmcareer.com/wp-content/uploads/2020/06/hash-2.0-web-size-copy-1.jpg',
  alt:"IPM Careers IIM Indore Results "
},{
  image:'https://www.ipmcareer.com/wp-content/uploads/2020/06/hash-2.0-web-size-copy-1.jpg',
  alt:'IPM Careers IIM Rohtak Results'
}]

const faqs=[
  {
    question:"How will this IPMAT preparation help me?", 
    answer:'Practicing IPMAT Mock Tests will help improve your time-management skills and build your confidence levels. So, it is advised to take up mock tests regularly and try to analyze your performance after completing each mock test.',   
  },
  {
    question:"How many exams are covered under this preparation?", 
    answer:'IPM BBA/BMS prep cover aptitude tests conducted by IIM Indore (IPMAT – Indore), IIM Rohtak (IPMAT – Rohtak), IIM Bodh Gaya and IIM Jammu (JIPMAT) for  their 5-year integrated programs. The test prep program also cover entrance tests conducted by DU (DU JAT), NMIMS (NPAT), Symbiosis (SET), Christ University (CUET), IP University (IPUCET) and St. Xavier’s College – Mumbai for their BMS program',   
  },
  {
    question:"Can I avail one on one clearing doubt sessions?", 
    answer:'Students should contact their IPM Careers center to book a one-on-one doubt clearing session with a mentor.',   
  },
  {
    question:"How do I access live classes?", 
    answer:'On successful completion of enrolment process, students receive a IPM Careers Zoom id & password to join IPM Careers live platform and to attend live, online classes.',   
  },
  {
    question:"Is Fee Refundable?", 
    answer:'Fee is neither Refundable nor transferable',   
  },
  {
    question:"Is there any contact number to reach you?", 
    answer:'For any queries contact @8299470392.',   
  }


]

const reviews=[{
  image:'https://www.ipmcareer.com/wp-content/uploads/2022/08/WhatsApp-Image-2022-08-11-at-11.41.49-AM.jpeg',
  fullname:'Jiya Kejriwal',
  college:'IIM Indore   ',
  title:'Expert Interview Panel',
  review:' Faculty at IPM Career is extremely dedicated and hardworking. They make it a point for every student to be equally interactive in the classroom sessions. Mock interviews by experts from industry helped a lot.'
},{

  image:'https://www.ipmcareer.com/wp-content/uploads/2022/08/WhatsApp-Image-2022-07-30-at-8.26.20-PM.jpeg',
  fullname:'Juhi Mehra',
  college:'IIM Indore',
  title:'Supportive Faculty Team',
  review:' My experience as an IPM aspirant was truly memorable, The faculty team was extremely supportive.They always made sure that all my doubts were cleared. It is for them that I have reached where I am now.'
},
{

  image:'https://www.ipmcareer.com/wp-content/uploads/2023/01/WhatsApp-Image-2023-01-06-at-1.54.33-PM-e1673093647344.jpeg',
  fullname:'Akshita Maheshwari',
  college:'IIM Indore',
  title:'Game Changing Tips',
  review:'I learned a lot of tips & tricks at IPM Careers which were really game changing and it boosted my perspective of learning along. Those little things are the key factors which help students like me achieve the goals.'
}
]

function setNotification(de){
  if(timeoutId){
    clearTimeout(timeoutId)
  }

  setNotificationText(de);
   const id = setTimeout(()=>{setNotificationText(),setTimeoutId(null),console.log('notcall')},2500);
   setTimeoutId(id)
}
useEffect(()=>{
var index = 0;

const r = setInterval(()=>{
  if(index < heading.length - 1){
    index++;
  setSub(heading[index])}else{
    index = 0;
    setSub(heading[0])
  }
},1000)

setTimeout(()=>{
  setActivePopup(true)
},5000)
setTimeout(()=>{
setFavicon('/favicon_active.svg')



return ()=>{
  clearInterval(r);
}
},1000)

},[])
useEffect(() => {
  const interval = setInterval(() => {
    setStudents(students + 1);
  }, 8000); // 60000 milliseconds = 1 minute
  return () => clearInterval(interval);
}, [students]);

const opts ={
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
    controls:0,
    modestbranding:1,
    rel:0,
    loop:1,
  },
}
/* async function handleAPI(a,b){
console.log("api")
 await axios.post('/api/hello',{
   fullname:a,
   event:"Free Consulation",
   recipient:b,
 }).then(res=>{
  setLoader(false)
 }).catch(res=>{
  setLoader(false)
 })
} */

const features = [<>Best & Promising<span className={styles.blue}>&nbsp;IPMAT Results</span></>,<>Mentoring by<span className={styles.blue}>&nbsp;IIM Alumni</span></>,<>Awarded #1<span className={styles.blue}> by ZEE News</span></>,<>Gained Media Exposure for<span className={styles.blue}> Excellent Academic Performance</span></>];
const [mobile,setMobile] = useState("desktop");
useEffect(()=>{
  
  function setWidth(){
    
    if(window.innerWidth < 768){
      setMobile('mobile');
    
    }
    else if(window.innerWidth < 968){
      setMobile('tablet')
    }
    else{
      setMobile('desktop');
    }
  }
  window.addEventListener("resize",(e)=>{
setWidth()
  })

  window.addEventListener('load',()=>{
    setWidth();
  })
},[])


useEffect(()=>{

  window.addEventListener('scroll',()=>{
  
      if(window.scrollY > 1080){
          setScrolled(true)
      }else{
          setScrolled(false)
      }
  })})


async function triggerInterakt(){
  axios.post('/api/interakt',{
    userId: Date.now(),
    phoneNumber: formData.phone,
    countryCode: "+91",
    event: "Campaign Notification",
    name: formData.fullname,
    email: formData.email,

    tag: "Landing Page"
  }).then(res=>{
    console.log(res)
  }).catch(res=>{
    console.log(res)})
}
async function SubmitContact(){
  console.log(formData && Object.values(formData).filter((i,d)=> i.length > 2).length)
  if(!formData){
    setNotification('Please fill All the fields')
    return
  }
  if(!validatePhone(formData.phone ? formData.phone:'')){
    setNotification('Invalid or Empty Phone Number')
    return
  }

  if(!validateEmail(formData.email ? formData.email :'') ){
    setNotification('Invalid or Empty Email');
  }
  if( formData?.city == undefined){
    setNotification('City is Empty');
  }
  if( formData?.fullname == undefined){
    setNotification('Name is Empty');
  }
  if( formData?.phone == undefined){
    setNotification('Invalid Phone Number');
  }
    setLoader(true)
    
    
    triggerInterakt();
      /* await axios.post('/') */
      cronberryTrigger(formData.fullname,formData.email,formData.phone,formData.year,formData.city,'https://register.ipmcareer.com');
      const {data,error} = await supabase.from('ipm_leads').insert({
        name:formData.fullname,
email:formData.email,
phone:formData.phone,
city:formData.city,
year:formData.year,
source:'IPM Register Page'
    }).select();
    if(data){
      console.log("inserted")
    }else if(error){
      console.log(error)
    }
  

 
}

function validatePhone(phone) {
  const re =  /^(\+\d{1,4})?(?!0+\s+,?$)\d{10}\s*,?$/;
  return re.test(phone);
}
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const tabs =['Auto-Generated Remedial Tests & Access to Learning Tools','Weekly GK Tests -Current Affairs (On Mobile App)', 'Performance Reports with In-depth Analysis & Benchmarking after Each Test']
  return (
    <>
      <Head>
        <title>HASH IPMAT ✨ | {currentSub}</title>
        <meta name="description" content="IPM Careers HASH IPMAT Test for IPMAT Aspirants" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={favicon} />
      </Head>
      
      <main className={styles.main}>
        {isSubmitted? <div className={styles.modal}>
          <div className={styles.modalinner}>
          <h2>Thank You !!</h2>
          <h3>Choosing Us today is the best decision you could have made yet.</h3>
          <p>We've received your details</p>
          <p>Our Executive will get back to you shortly.
          </p>

          <p>For Quick Assitance you can call us on : <a href="tel:+919616383524">+91 96163 83524</a></p>
          <a href="https://ipmcareer.com/courses" className={styles.submit}>Explore Our Courses</a><a className={styles.submit} href="https://ipmcareer.com">Visit Our Website</a>
          </div></div>:''}
      {notificationText && notificationText.length > 2 ? <Notifications text={notificationText} /> : ''}
        <Navbar scrolled={scrolled}/>
{loader? <div className={styles.loader}>

<svg width="197px" height="197px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
<circle cx="50" cy="50" fill="none" stroke="var(--brand-col2)" stroke-width="3" r="27" stroke-dasharray="127.23450247038662 44.411500823462205">
  
</circle>
</svg>
<p>Sending your wish to IIM Gods</p>
</div> :''}
{/* <div className={styles.gradfill2}></div> */}

        
   <div className={styles.mainimage}>
    <img src="https://www.ipmcareer.com/wp-content/uploads/2020/06/hash-2.0-web-size-copy-1.jpg"/></div>     
<section className={styles.maincont} >

<div className={styles.grad1}></div>
<div className={styles.grad2}></div>
<div className={styles.c1}>
{/* <h2>The first 50 registrants will receive the HASH IPMAT test series for just 




<span style={{color:'var(--brand-col2)'}}> Rs.999.</span></h2> */}
{/* <h3 style={{color:'var(--brand-col2)',margin:'5px 0', fontWeight:500}}>for IPMAT 2024 Aspirants</h3>
 */}{/* <div className={styles.trust}>TRUSTED BY THOUSANDS OF STUDENTS</div> */}
{/* <Switcher features={features}/> */}
{/* <div className={styles.hold}>
<p>Students Enrolled <br/><span className={styles.numbers}>{students}</span></p>
<p>Classes Completed<br/><span className={styles.numbers}>{students*2}</span></p>
<p>Hours Taught<br/><span className={styles.numbers}>{students*33}</span></p>
</div> */}
{/* <div>
<div className={styles.progress}>
<div className={styles.progress_inner} style={{width:formData ? Object.keys(formData).length*100/5 +"%" : '0%'}}><p>Form Progress : {formData ? Object.entries(formData).length*100/5 +"%" : '0%'}</p></div>
{formData && Object.keys(formData).length*100/5 == 100 ?  <p style={{right:'0',left:'unset'}}>Done</p>:''}
</div>
</div> */}

<h2 className={styles.more}>To Know more about our Premium Mock Test #Hash-IPMAT <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.293 8.293a1 1 0 0 1 1.414 0L12 14.586l6.293-6.293a1 1 0 1 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 0-1.414Z" fill="#ffffff"/></svg></h2>

</div>
<div className={styles.c2}>
<div className={styles.formcont}>
<h1 className={styles.team_heading}>Fill out the form to Register for <span style={{color:'var(--brand-col2)'}}>HASH IPMAT</span></h1>
<input name={"name"} className={styles.input} placeholder={"Enter your Full Name"} type={"text"} value={formData && formData.fullname} onChange={(e)=>{setFormData(res=>({...res,fullname:e.target.value})) }}/>
<input name={"email"} className={styles.input + " " + (validateEmail(formData ? formData.email : 'test@gm.co') ? '' : styles.fielderror)} placeholder={"Enter your Email Address"} type={"text"} value={formData && formData.email} onChange={(e)=>{setFormData(res=>({...res,email:e.target.value})) }}/>
<input name={"phone"} className={styles.input + " " + (validatePhone(formData ? formData.phone : '+918888888888') ? '' : styles.fielderror)} placeholder={"Enter your Phone Number"} type={"text"} value={formData && formData.phone} onChange={(e)=>{setFormData(res=>({...res,phone:e.target.value})) }}/>
<input name={"city"} className={styles.input} placeholder={"Enter your City"} type={"text"} value={formData && formData.city} onChange={(e)=>{setFormData(res=>({...res,city:e.target.value})) }}/>
{/* <CustomSelect z={9} full="true" defaultText="When are you planning to take IPM?" noPadding={true} objects={years} setSelect={(r)=>{setFormData(res=>({...res,year:r}))}}/> */}
{formData && formData.city && formData.fullname && formData.phone && formData.email? '':<p className={styles.error}>Please fill all the fields</p>}
<div onClick={SubmitContact} className={styles.submit}>SUBMIT</div>
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
</section>
<Section title={"What's :Included"} color="var(--brand-col1)" align="left" >
           <ImageTab items={tabs.map((i,d)=>{
return {
    title:i,
    image:animdata[d].image,
    
}
           })}/>
            </Section>  
       {/*  <div className={styles.hero2}>
            
        <div className={styles.one}>
        <a className={styles.header} href="#"><img alt='IPM Careers Logo' src='/ipm_logo.svg'/></a>
       
<p>Your IPMAT preparation is incomplete without </p>
            <h1><span className="b2">#HASH</span>-IPMAT</h1>
            <p>A Premium test series by IPM Careers</p>
            {mobile != "desktop" ?<img className={styles.imageblock} src={'/ipamt.png'}/> :''}
            <ul>
<li>10000+ Questions</li>
<li>100 + Mock test</li>
<li>350 + Test</li>

            </ul>
        </div>
        <div className={styles.two}>
        <div className={styles.grad1}></div>
<div className={styles.grad2}></div>
{mobile == "desktop" ?<img className={styles.imageblock} src={'https://www.ipmcareer.com/wp-content/uploads/2023/11/mock-website.jpg'}/> :''}
            
        </div>


        </div> */}

        

       
        <Section fullWidth title={"Premium Test Series Range:by IPM Careers"} color="var(--brand-col2)" align="center" id="form">
<img src="/wave bg.svg" className={styles.wave}/>
<div className={styles.cardshold}>

    {mocks && mocks.map((i,d)=>{

        return <div className={styles.tcard} href={i.link}>
           
            <img src={i.image}/>
            {d==2 ? <div className={styles.trust + " " + styles.best}>Best Selling</div>:''}
            <h2>{i.title}</h2>
            <div dangerouslySetInnerHTML={{__html:i.content}}></div>
            <p>Price: {i.price}</p>
            <a href={i.link}>BUY NOW</a>
            <a href={'https://study.ipmcareer.com/login'}>FREE MOCK TEST</a>
            
        </div>
    })}
</div>
        </Section>
        
        <Section title={"Know : Your Mentors"} color="var(--brand-col2)" align="right">
        <div className={styles.parent2}>

        {mentors && mentors.map((i,d)=>{
return <div className={styles.card}>
  <div alt={i.role} className={styles.bg} style={{backgroundImage:"url("+i.bg+")"}}></div>
  <img alt={i.fullname} src={i.image}/>
  <h2>{i.fullname}</h2>
  {i.role ? <p className={styles.para}>{i.role}</p>:''}
  {i.role2 ? <p className={styles.para}>{i.role2}</p>:''}
</div>

})}
         
          
          </div></Section>
          
        
   {activePopup? <a href={"https://wa.me/919616383524?text=Hi%20%2C%20Connected%20Here%20via%20Connect%20Button%20on%20Website"} className={styles.popup}><img alt="IPM Careers WhatsApp" src={'/WhatsApp.svg'}/>Connect on WhatsApp</a>: ''    }
   
   <Section title={"Why choose: IPM Careers' Mock Test?"} color="var(--brand-col1)" align="left" visible="true">
   <Swiper
     modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={10}
      slidesPerView={mobile === "mobile" ? 1.3 : mobile === "tablet" ? 2.5 : 4.5}
      loop={true}
      autoplay={true}
      loopFillGroupWithBlank={false}
      pagination={{ clickable: true }}
      centeredSlides={mobile === "desktop" || mobile === "tablet" ? false : false}
      onSlideChange={() =>{}}
      onSwiper={(swiper) => console.log(swiper)}
      onInit={(swiper) => {
       
        swiper.navigation.update();
      }}
      navigation={{
        nextEl: '.next',
        prevEl: '.prev',
        clickable:true,
      }}
   
    >


     
      
      {testimonials && testimonials.map((i,index)=>{

return(<>

<SwiperSlide key={index}>
<div className={styles.testimonial_card}>

  <img alt={i.heading} src={i.icon}/>
  <h2>{i.heading}</h2>
  <div className={styles.grad1}></div>
  <div className={styles.grad2}></div>
</div>

</SwiperSlide>

</>)
})} 


    </Swiper>

   </Section>
   <Section title={":Testimonials"} color="var(--brand-col1)" align="left" visible="true">

<div className={styles.reviewholder}>

{reviews && reviews.map((i,d)=>{
  return <div className={styles.rcard} >
    <div className={styles.shape}></div>
    <div className={styles.shape2}></div>
<div className={styles.rcard_profile}>
  <img alt={i.fullname} src={i.image}/>
    <div>
    <h2>{i.fullname}</h2>
    <p>{i.college}</p>
    </div>
    </div>
    <div className={styles.rcontent}>
    <p className={styles.rtitle}>{i.title}</p>
    <p>{i.review}</p></div>
  </div>
})}

</div>
  


   </Section>
   <Section title={"Our Promising:Results"} color="var(--brand-col2)" align="left" visible="true">
 <img alt="IPM Careers Rohtak Results"  className={styles.results} src={result}/>

   </Section>
   
   
  {/*  <Section title={"Frequently:Asked Questions"} color="var(--brand-col2)" align="left" visible="true">
   <FAQ items={faqs}/>
   </Section> */}

{/* <button onClick={()=>{handleAPI()}} >Test</button> */}

<div dangerouslySetInnerHTML={{__html :datahtml}}></div>
<Footer/>
      </main>
    </>
  )
}
