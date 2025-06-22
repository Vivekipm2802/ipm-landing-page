import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import {useState,useEffect} from 'react'
import styles from './CrashCourse.module.css'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import Notifications from '../components/Notification'
import YouTube from 'react-youtube';
import axios from 'axios';
import Section from '../components/Section'
import qs from 'qs';
const inter = Inter({ subsets: ['latin'] })
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import 'swiper/css'
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay'
import Switcher from '../components/Switcher'
import CustomSelect from '../components/CustomSelect'
import { supabase } from '../utils/supabaseClient'
import { years } from '../utils/years'
export default function CrashCourse() {

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



const testimonials =[{
  icon:'https://ipmcareer.com/files/2023/01/resutls-1.png',
 heading:'Try Before Buy',
 title:'FREEDOM TO SAMPLE MATTERS',
 description:'Don’t pay a dime, check out what we have to offer. Sign up now!'

},
{
  icon:'https://ipmcareer.com/files/2023/01/professsor-1.png',
 heading:"We know short-cuts don't always work!",
 title:'FUNDAMENTALS MATTER',
 description:'We teach from first-principles and gradually increase the level to IPMAT.'


}
,
{
  icon:'https://ipmcareer.com/files/2023/01/study-material-1.png',
 heading:'A good course is not a Video library',
 title:'COURSE STRUCTURE MATTERS',
 description:'Topics laid out in intuitive fashion, adaptable as per your requirement',

},
{
  icon:'https://ipmcareer.com/files/2023/01/ai-booked-1.png',
 heading:'Content is not a commodity',
 title:'PEDAGOGY MATTERS',
 description:'Good teachers + well-designed course = Ideas that stick in mind forever',

},
{
  icon:'https://ipmcareer.com/files/2023/01/one-on-one-counselling-1.png',
 heading:'Time is more important than money',
 title:'TIME IS VITAL',
 description:'Intuitive UI lays everything out on a platter. Spend time learning - Not searching, following, subscribing',

},
{
  icon:'https://ipmcareer.com/files/2023/01/doubt-1.png',
 heading:'One size does not fit all',
 title:'FOCUS MATTERS',
 description:'Test the topic you learnt now. Not your ability to solve an insanely tough Quant paper.',

}]

const kfeatures = [
    {
        title:'Learn from the best',
        icon:'/classroom.svg',
        description:''
    },
    {
        title:'Live Sessions',
        icon:'/live.svg',
        description:''
    },
    {
        title:'Massive Online Content',
        icon:'/content-strategy.svg',
        description:''
    },
    {
        title:'Practice Questions & Tests',
        icon:'/practice.svg',
        description:''
    },
    {
        title:'Mentorship',
        icon:'/mentorship.svg',
        description:''
    },
    {
        title:'Doubt Clarification',
        icon:'/doubt.svg',
        description:''
    },
    {
        title:'Smart AI Test Analysis',
        icon:'/smart.svg',
        description:''
    },
    {
        title:'Live Classes',
        icon:'/live.svg',
        description:''
    },
    {
        title:'One to One Mentoring',
        icon:'/one-to-one-chat.svg',
        description:''
    }
]

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
              "paramValue": "Crash Course Page"
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

    image:'https://www.ipmcareer.com/files/2023/01/Ashutosh-Sir-e1641723253112.webp',
    fullname:'Ashutosh Mishra',
    role:'Master IIM Ahmedabad',
    role2:'Bachelors Thapar University',
    bg:'https://www.ipmcareer.com/files/2023/01/IIMA-LKP_0-1.webp'
  },
  {

    image:'https://www.ipmcareer.com/files/2016/11/deepak-kushwaha-350x350.jpg',
    fullname:'Deepak Kushwaha',
    role:'Master IIM Lucknow',
    role2:'Bachelors NIT Srinagar',
    bg:'https://www.ipmcareer.com/files/2023/01/img-slider-4-1-1.webp'
  },
  {

    image:'https://www.ipmcareer.com/files/2023/01/Screen-Shot-2021-01-10-at-3.24.16-PM-283x350-1-1.png',
    fullname:'Taruna Khanna',
    role:'GCC UCLA Extension',
    bg:'https://www.ipmcareer.com/files/2023/01/education-concept-student-studying-brainstorming-campus-concept-close-up-students-discussing-their-subject-books-textbooks-selective-focus-660x330-1.webp'
    
  },
  {

    image:'https://www.ipmcareer.com/files/2022/06/IMG_1848-350x350.jpg',
    fullname:'Dr. Swati A. Mishra',
    role:'Director Operations Lucknow Centre',
    role2:'Former Professor IIM Lucknow',
    bg:'https://cdn.britannica.com/85/13085-050-C2E88389/Corpus-Christi-College-University-of-Cambridge-England.jpg'
    
  },
  {

    image:'https://ipmcareer.com/all-india-mock/files/manish.jpeg',
    fullname:'Manish Dixit',
    role:'IIT BHU Alumnus',
    
    bg:'https://www.ipmcareer.com/files/2023/01/iit_bhu_slider_03-1.webp'
    
  },
  {

    image:'https://www.ipmcareer.com/files/2022/01/WhatsApp-Image-2022-01-09-at-4.49.41-PM-e1641850793724-350x350.jpeg',
    fullname:'Rishabh Singh',
    role:'IIFM Bhopal Alumnus',
    bg:'https://www.careerindia.com/img/2013/10/24-indianinstituteofforestmanagement.jpg'
    
  },
  {

    image:'https://www.ipmcareer.com/files/2022/12/WhatsApp-Image-2022-12-15-at-7.11.51-PM-e1671269681720.jpeg',
    fullname:'Divyansh Mishra',
    role:'IIM Raipur',
    bg:'https://www.ipmcareer.com/files/2023/01/jpg-1.webp'
    
  },
  {

    image:'https://www.ipmcareer.com/files/2022/01/Rishita-e1672914918610-350x350.jpg',
    fullname:'Rishita Gupta',
    role:'Multiple IIMs Call Getter',
    bg:'https://backend.insideiim.com/wp-content/uploads/2017/04/IIM_Collage.jpg'
    
  }
]


const slides = [{
  image:'https://www.ipmcareer.com/files/2023/01/Website-Indoreq-scaled-_1_-_2_.webp',
  alt:"IPM Careers IIM Indore Results "
},{
  image:'https://www.ipmcareer.com/files/2023/01/Rohtak-Results-Template-ooo-scaled-_1_.webp',
  alt:'IPM Careers IIM Rohtak Results'
}]
const faqs=[
  {
    question:"Where can i get the IPM Mock Schedule?", 
    answer:'Click here for IPM & BBA entrance exam schedule',   
  },
  {
    question:"Can i get a sample mock?", 
    answer:'Yes, please Sign Up into Free IPM Careers Portal, <a style="color:var(--brand-col2)" href="https://ipmkits.tcyonline.com/">Click Here to Login</a>',   
  },
  {
    question:"What is the syllabus for IPMAT 2024", 
    answer:'',   
  },
  {
    question:"Can a non maths student crack IPM?", 
    answer:"Yes most definitely. Maths up to 10th standard is also tested. With a good deal of revision & practice, you're good to go.",   
  },
  


]

const reviews=[{

  image:'https://www.ipmcareer.com/files/2022/08/WhatsApp-Image-2022-07-30-at-8.26.20-PM.jpeg',
  fullname:'Juhi Mehra',
  college:'IIM Indore',
  title:'Supportive Faculty Team',
  review:' My experience as an IPM aspirant was truly memorable, The faculty team was extremely supportive.They always made sure that all my doubts were cleared. It is for them that I have reached where I am now.'
},
{

  image:'https://www.ipmcareer.com/files/2023/01/WhatsApp-Image-2023-01-06-at-1.54.33-PM-e1673093647344.jpeg',
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



},1000)

return ()=>{
  clearInterval(r);
}
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
async function handleAPI(a,b,c){
console.log("api")
 await axios.post('/api/hello',{
   fullname:a,
   event:"Free Consultation",
   user_id:c,
   recipient:b,
 }).then(res=>{
  setLoader(false)
 }).catch(res=>{
  setLoader(false)
 })
}

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
  if(formData && Object.values(formData).filter((i,d)=> i.length > 2).length > 3 && validateEmail(formData.email ? formData.email :'') && validatePhone(formData.phone ? formData.phone:'')){

    setLoader(true)
    
    /* TestApi();
    triggerInterakt(); */
      /* await axios.post('/') */
      cronberryTrigger(formData.fullname,formData.email,formData.phone,formData.year,formData.city,'https://register.ipmcareer.com');
      const {data,error} = await supabase.from('ipm_leads').insert({
        name:formData.fullname,
email:formData.email,
phone:formData.phone,
city:formData.city,
year:formData.year,
source:'Crash Course Page'
    }).select();
    if(data){
      console.log("inserted")
    }else if(error){
      console.log(error)
    }
  }
  else if(!formData){
    console.log('red')
setNotification('Please fill all the fields')
  }
  else{
    console.log(formData)
setNotification('Please fill all the fields')
  }
 
}

async function TestApi(){
const data = {
  client_id:3158,
  security_code:'d1R9fF5mfiE=',
 course_id:35736,
 category_id:835941,
  action:'coursedetail',
  full_name:formData.fullname,
  city:formData.city,
  mobile_number:formData.phone,
  email:formData.email

};
  await axios.post('/api/tcy',data
    
  ).then(res=>{
    
    handleAPI(formData.fullname,formData.email,res.data)
  }).catch(res=>{
    handleAPI(formData.fullname,formData.email,res.data)
  })
}

async function studentlogin(d){

  await axios.post('https://www.tcyonline.com/api/erp_request.php',qs.stringify({
    client_id: 3158,
    security_code: 'd1R9fF5mfiE=',
    
    action: 'login',
    user_id:d,
  }
  ),{
    headers:{
      'Content-Type':'application-x-www-form-urlencoded',
      'Access-Control-Allow-Origin':'*'
    }
  }).then(res=>{
    
  }).catch(res=>{
    console.log(res)
  })
}
function validatePhone(phone) {
  const re =  /^(\+\d{1,4})?(?!0+\s+,?$)\d{10}\s*,?$/;
  return re.test(phone);
}
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
  return (
    <>
      <Head>
        <title>IPM Careers | {currentSub}</title>
        <meta name="description" content="IPM Careers" />
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
        <div className={styles.hero}>
        
<img  src='https://www.ipmcareer.com/wp-content/uploads/2024/03/crash-course-website.jpg'/>

        </div>

        

          <section className={styles.maincont} id="form">

            <div className={styles.grad1}></div>
            <div className={styles.grad2}></div>
<div className={styles.c1}>
<h2>Starting from</h2>
    <div className={styles.date}><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5v9.25A3.25 3.25 0 0 0 6.25 21h11.5A3.25 3.25 0 0 0 21 17.75V8.5H3ZM16.75 15a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 15a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm4.75-4.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm-4.75 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm-4.75 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm-1-7.5A3.25 3.25 0 0 0 3 6.25V7h18v-.75A3.25 3.25 0 0 0 17.75 3H6.25Z" fill="#8E43AD"/></svg>15th March, 2024</div>
<h2>Best IPMAT 2024 Crash Course</h2>
<p>Join now to grab the opportunity to learn from our experts</p>
<div className={styles.trust}>TRUSTED BY THOUSANDS OF STUDENTS</div>
<Switcher features={features}/>


</div>
<div className={styles.c2}>
  <div className={styles.formcont}>
<h1 className={styles.team_heading}>Fill out the form to Register for Crash Course IPMAT 2024</h1>
<input name={"name"} className={styles.input} placeholder={"Enter your Full Name"} type={"text"} value={formData && formData.fullname} onChange={(e)=>{setFormData(res=>({...res,fullname:e.target.value})) }}/>
<input name={"email"} className={styles.input + " " + (validateEmail(formData ? formData.email : 'test@gm.co') ? '' : styles.fielderror)} placeholder={"Enter your Email Address"} type={"text"} value={formData && formData.email} onChange={(e)=>{setFormData(res=>({...res,email:e.target.value})) }}/>
<input name={"phone"} className={styles.input + " " + (validatePhone(formData ? formData.phone : '+918888888888') ? '' : styles.fielderror)} placeholder={"Enter your Phone Number"} type={"text"} value={formData && formData.phone} onChange={(e)=>{setFormData(res=>({...res,phone:e.target.value})) }}/>
<input name={"city"} className={styles.input} placeholder={"Enter your City"} type={"text"} value={formData && formData.city} onChange={(e)=>{setFormData(res=>({...res,city:e.target.value})) }}/>
<CustomSelect z={9} full="true" defaultText="When are you planning to take IPM?" noPadding={true} objects={years} setSelect={(r)=>{setFormData(res=>({...res,year:r}))}}/>
{formData && formData.city && formData.fullname && formData.phone && formData.email && formData.year? '':<p className={styles.error}>Please fill all the fields</p>}
{/* <div onClick={TestApi} className={styles.submit}>TEST</div> */}
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
          <Section title={"Key Features"} color="var(--brand-col1)" align="left">
<div className={styles.kwrap}>
            {kfeatures != undefined && kfeatures.map((i,d)=>{
                return <><div className={styles.kcard}>
                    <div className={styles.gradlayer}></div>
                    <div className={styles.gradlayer2}></div>
                    <img src={i.icon}/>
                    <h2>{i.title}</h2>
                </div></>
            })}</div>
          </Section>

         {/*<Section title={"Words by: Our Students"} color="var(--brand-col1)" align="left">
<div className={styles.parent}>
<div className={styles.col1}>
<h2>Listen what our students have to say about us.</h2>
<p>Our students are thrilled with the classes that we offer. They consistently express their satisfaction with the quality of the instruction, the engaging curriculum, and the supportive learning environment. They appreciate the individualized attention that they receive from our dedicated teachers, and they are making steady progress in their studies. Overall, our students are incredibly happy with the education that they are receiving, and it shows in their enthusiasm and dedication to their studies.</p>
{/* <ul className={styles.words}>
	<li>Many of our students have commented on how much they enjoy the interactive nature of the classes, with a variety of activities and group work that keeps them engaged and motivated.</li>
	<li>The feedback that we receive from our students consistently highlights the supportive and inclusive culture of our school. They feel welcomed and valued as members of our community, and they appreciate the inclusive and respectful atmosphere that our teachers create.</li>
	<li>In addition to the positive comments about the classes themselves, our students also often express appreciation for the extra support that is available to them. Whether it&#39;s through tutoring, office hours, or other resources, our students know that they can get the help that they need to succeed.</li>
	<li>Overall, our students are extremely satisfied with the education that they are receiving, and we are continually working to improve and enhance the learning experience for all of our students.</li>
</ul> 


</div>
<div className={styles.col2}>
<div className={styles.yt}>
<YouTube className='embed-container' title='' videoId="bFszqpsA81g" opts={opts}  /></div>
</div>
</div>

        </Section> */}
       
    {/*     <Section title={"Know : Your Mentors"} color="var(--brand-col2)" align="right">
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
         
          
          </div></Section> */}
          
        
   {activePopup? <a href={"https://wa.me/918318535139?text=Hi%20%2C%20Connected%20Here%20via%20Connect%20Button%20on%20Website"} className={styles.popup}><img alt="IPM Careers WhatsApp" src={'/WhatsApp.svg'}/>Connect on WhatsApp</a>: ''    }
   
   <Section title={"Why choose: IPM Careers?"} color="var(--brand-col1)" align="left" visible="true">
   <div className={styles.wwrap}>
   {testimonials && testimonials.map((i,index)=>{

return(<>


<div className={styles.wcard}>
<div className={styles.gradlayer}></div>
<div className={styles.gradlayer2}></div>

  <div className={styles.wcontent}>
  <h2 className={styles.whead}>{i.heading}</h2>
  <h2 className={styles.wtitle}>{i.title}</h2>
  <p>{i.description}</p>
  </div>
</div>

</>) })}
</div>

     
     

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
 <img alt="IPM Careers Rohtak Results"  className={styles.results} src={'https://www.ipmcareer.com/wp-content/uploads/2023/01/Rohtak-Results-Template-ooo-scaled-_1_.webp'}/>

   </Section>
   <Section title={"Frequently:Asked Questions"} color="var(--brand-col2)" align="left" visible="true">
   <div className={styles.faqhold}><FAQ items={faqs}/></div>
   </Section>

{/* <button onClick={()=>{handleAPI()}} >Test</button> */}

<div dangerouslySetInnerHTML={{__html :datahtml}}></div>
<Footer/>
      </main>
    </>
  )
}
