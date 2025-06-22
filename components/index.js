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
import cronberryTrigger from './utilFunctions'
const inter = Inter({ subsets: ['latin'] })
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import 'swiper/css'
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay'

import CustomSelect from '../components/CustomSelect'
export default function Home() {

const [favicon,setFavicon] = useState('/favicon_ipm.svg');
const [currentSub,setSub] = useState('Register Now')
const [activePopup,setActivePopup] = useState(false);
const [notificationText,setNotificationText] = useState();
const [timeoutId, setTimeoutId] = useState(null);
const [datahtml,setHtml] = useState();
const [formData,setFormData] = useState();
const years = [{
  title:'2023',
  value:'2023'
},
{
  title:'2024',
  value:'2024'
},
{
  title:'2025',
  value:'2025'
},
]
const heading=['Register Now','Its Free','Limited Seats','Best Coaching']


const mentors=[
  {

    image:'https://www.ipmcareer.com/files/2016/11/Ashutosh-Sir-e1641723253112.jpg',
    fullname:'Ashutosh Mishra',
    role:'Master IIM Ahmedabad',
    role2:'Bachelors Thapar University',
    bg:'https://iima.ac.in/sites/default/files/2022-11/IIMA%20LKP_0.jpeg'
  },
  {

    image:'https://www.ipmcareer.com/files/2016/11/deepak-kushwaha-350x350.jpg',
    fullname:'Deepak Kushwaha',
    role:'Master IIM Lucknow',
    role2:'Bachelors IIT Srinagar',
    bg:'https://www.iiml.ac.in/sites/default/files/2018-05/img-slider-4.jpg'
  },
  {

    image:'https://www.ipmcareer.com/files/2021/01/Screen-Shot-2021-01-10-at-3.24.16-PM-283x350.png',
    fullname:'Taruna Khanna',
    role:'GCC UCLA Extension',
    bg:'https://www.startupnrise.com/wp-content/uploads/2021/02/education-concept-student-studying-brainstorming-campus-concept-close-up-students-discussing-their-subject-books-textbooks-selective-focus-660x330.jpg'
    
  },
  {

    image:'https://www.ipmcareer.com/files/2022/01/WhatsApp-Image-2022-01-09-at-3.16.24-PM-350x350.jpeg',
    fullname:'Nishank Bani',
    role:'ISB Hyderabad',
    role2:'IIT KGP Alumnus',
    bg:'https://www.oneyearmba.co.in/wp-content/uploads/2019/07/ISB.jpg'
    
  },
  {

    image:'https://www.ipmcareer.com/files/2022/01/WhatsApp-Image-2022-01-09-at-4.49.41-PM-e1641850793724-350x350.jpeg',
    fullname:'Rishabh Singh',
    role:'IIFM Bhopal Alumnus',
    bg:'http://iifm.ac.in/wp-content/uploads//Building-min-1-e1619768730781.jpg'
    
  }
]

const slides = [{
  image:'https://www.ipmcareer.com/files/2020/06/Website-Indoreq-scaled.jpg',
},{
  image:'https://www.ipmcareer.com/files/2020/06/Rohtak-Results-Template-ooo-scaled.jpg',
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
async function handleAPI(a,b){
console.log("api")
 await axios.post('/api/hello',{
   fullname:a,
   event:"Free Consulation",
   recipient:b,
 }).then(res=>{
   
 }).catch(res=>{
   
 })
}


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

async function triggerInterakt(){
  axios.post('https://cp.ipmcareer.com/api/interakt',{
    userId: Date.now(),
    phoneNumber: formData.phone,
    countryCode: "+91",
    event: "Campaign Notification",
    name: formData.fullname,
    email: formData.email,

    tag: "Landing Page"
  }).then(res=>{
    console.log(res)
  })
}
async function SubmitContact(){
handleAPI(formData.fullname,formData.email)
triggerInterakt();
  /* await axios.post('/') */
  cronberryTrigger(formData.fullname,formData.email,formData.phone,formData.year);
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
      {notificationText && notificationText.length > 2 ? <Notifications text={notificationText} /> : ''}
        <Navbar/>

        <div className={styles.hero}>
        <Swiper
     modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={10}
      slidesPerView={1}
      loop={true}
      autoplay={true}
      speed={1200}
      pagination={{ clickable: true }}
      centeredSlides={true}
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


     
      
      {slides && slides.map((item,index)=>{

return(<>

<SwiperSlide key={index}><img className={styles.slideimage} src={item.image}/></SwiperSlide>

</>)
})} 


    </Swiper>


        </div>

        

          <section className={styles.maincont} id="form">

            <div className={styles.grad1}></div>
            <div className={styles.grad2}></div>
<div className={styles.c1}>
<h2>India's Premium IPMAT Coaching</h2>
<p>Join now to grab the opportunity to learn from our experts</p>
<a className={styles.trust}>TRUSTED BY THOUSANDS OF STUDENTS</a>

</div>
<div className={styles.c2}>
  <div className={styles.formcont}>
<h1 className={styles.team_heading}>Fill out the form to Schedule FREE 1-1 Consulation with an Expert</h1>
<input name={"name"} className={styles.input} placeholder={"Enter your Full Name"} type={"text"} value={formData && formData.fullname} onChange={(e)=>{setFormData(res=>({...res,fullname:e.target.value})) }}/>
<input name={"email"} className={styles.input} placeholder={"Enter your Email Address"} type={"text"} value={formData && formData.email} onChange={(e)=>{setFormData(res=>({...res,email:e.target.value})) }}/>
<input name={"phone"} className={styles.input} placeholder={"Enter your Phone Number"} type={"text"} value={formData && formData.phone} onChange={(e)=>{setFormData(res=>({...res,phone:e.target.value})) }}/>
<input name={"city"} className={styles.input} placeholder={"Enter your City"} type={"text"} value={formData && formData.city} onChange={(e)=>{setFormData(res=>({...res,city:e.target.value})) }}/>
<CustomSelect full="true" defaultText="When are you planning to take IPM?" noPadding={true} objects={years} setSelect={(r)=>{setFormData(res=>({...res,year:r}))}}/>
<a onClick={SubmitContact} className={styles.submit}>SUBMIT</a>
<div className={styles.encrypt}>
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
</div>
</div>
</div>
          </section>
       

        <Section title={"Words by: Our Students"} color="var(--brand-col1)" align="left">
<div className={styles.parent}>
<div className={styles.col1}>
<h2>Listen what our students have to say about us.</h2>
<p>Our students are thrilled with the classes that we offer. They consistently express their satisfaction with the quality of the instruction, the engaging curriculum, and the supportive learning environment. They appreciate the individualized attention that they receive from our dedicated teachers, and they are making steady progress in their studies. Overall, our students are incredibly happy with the education that they are receiving, and it shows in their enthusiasm and dedication to their studies.</p>
<ul>
	<li>Many of our students have commented on how much they enjoy the interactive nature of the classes, with a variety of activities and group work that keeps them engaged and motivated.</li>
	<li>The feedback that we receive from our students consistently highlights the supportive and inclusive culture of our school. They feel welcomed and valued as members of our community, and they appreciate the inclusive and respectful atmosphere that our teachers create.</li>
	<li>In addition to the positive comments about the classes themselves, our students also often express appreciation for the extra support that is available to them. Whether it&#39;s through tutoring, office hours, or other resources, our students know that they can get the help that they need to succeed.</li>
	<li>Overall, our students are extremely satisfied with the education that they are receiving, and we are continually working to improve and enhance the learning experience for all of our students.</li>
</ul>


</div>
<div className={styles.col2}>
<div className={styles.yt}>
<YouTube title='' videoId="bFszqpsA81g" opts={opts}  /></div>
</div>
</div>

        </Section>
        <Section title={"Know : Your Mentors"} color="var(--brand-col2)" align="right">
        <div className={styles.parent2}>

        {mentors && mentors.map((i,d)=>{
return <div className={styles.card}>
  <div className={styles.bg} style={{backgroundImage:"url("+i.bg+")"}}></div>
  <img src={i.image}/>
  <h2>{i.fullname}</h2>
  {i.role ? <p className={styles.para}>{i.role}</p>:''}
  {i.role2 ? <p className={styles.para}>{i.role2}</p>:''}
</div>

})}
         
          
          </div></Section>
          
        
   {activePopup? <a href={"https://wa.me/919616383524?text=Hi%20%2C%20Connected%20Here%20via%20Connect%20Button%20on%20Website"} className={styles.popup}><img src={'/WhatsApp.svg'}/>Connect on WhatsApp</a>: ''    }
   
   <Section title={"Why choose: IPM Careers?"} color="var(--brand-col1)" align="left" visible="true"></Section>
   <Section title={":Testimonials"} color="var(--brand-col1)" align="left" visible="true"></Section>
   <Section title={"Our Promising:Results"} color="var(--brand-col2)" align="left" visible="true">
 <img  className={styles.results} src={'https://www.ipmcareer.com/files/2020/06/Rohtak-Results-Template-3updated-1-scaled.jpg'}/>

   </Section>
   <Section title={"Frequently:Asked Questions"} color="var(--brand-col2)" align="left" visible="true">
   <FAQ items={faqs}/>
   </Section>

{/* <button onClick={()=>{handleAPI()}} >Test</button> */}

<div dangerouslySetInnerHTML={{__html :datahtml}}></div>
<Footer/>
      </main>
    </>
  )
}
