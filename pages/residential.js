
import { useEffect, useState } from 'react';
import FAQ from '../components/FAQ';
import Navbar from '../components/Navbar';
import Section from '../components/Section';
import styles from './Residential.module.css';
import Head from 'next/head';
import GradientMarquee from '../components/GradientMarquee';
import CustomSelect from '../components/CustomSelect';
import YouTube from 'react-youtube';
import axios from 'axios';
import Notifications from '../components/Notification';
import Footer from '../components/Footer';
import { supabase } from '../utils/supabaseClient'
import {useRouter} from 'next/router'
import { years } from '../utils/years';
function Residential(){

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
  const router = useRouter();
  
  
  const testimonials =[{
    icon:'https://ipmcareer.com/wp-content/uploads/2023/01/resutls-1.png',
   heading:'Best IPMAT Results'
  
  },
  {
    icon:'https://ipmcareer.com/wp-content/uploads/2023/01/professsor-1.png',
   heading:'Best IITs - IIMs Faculties'
  
  }
  ,
  {
    icon:'https://ipmcareer.com/wp-content/uploads/2023/01/study-material-1.png',
   heading:'Excellent Study Material'
  
  },
  {
    icon:'https://ipmcareer.com/wp-content/uploads/2023/01/ai-booked-1.png',
   heading:'AI based Test Series'
  
  },
  {
    icon:'https://ipmcareer.com/wp-content/uploads/2023/01/one-on-one-counselling-1.png',
   heading:'One-on-One Mentorship from IIMs Graduates'
  
  },
  {
    icon:'https://ipmcareer.com/wp-content/uploads/2023/01/doubt-1.png',
   heading:'One-on-One Doubt Clearing Sessions'
  
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
                "paramValue": "Residential Page"
            }
        ]
    });
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function() {
  
        if (this.readyState === 4) {
            
            setLoader(false)
            router.push('https://pay.jodo.in/pages/oCUCr7Jm6yC6SHpD')
            setNotification('Submitted Successfully')
            setSubmitted(true)
  
        }
    });
    xhr.open("POST", "https://register.cronberry.com/api/campaign/register-audience-data");
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
    image:'https://www.ipmcareer.com/wp-content/uploads/2023/01/Website-Indoreq-scaled-_1_-_2_.webp',
    alt:"IPM Careers IIM Indore Results "
  },{
    image:'https://www.ipmcareer.com/wp-content/uploads/2023/01/Rohtak-Results-Template-ooo-scaled-_1_.webp',
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
  const keys =[

    {
        image:'https://www.hiusa.org/wp-content/uploads/2020/04/sacramento-dorm-hiusa-1000x550-compressor-1-778x446.jpg',
        title:'Hostel Facilities'
    },
    {
        image:'https://www.pratapuniversity.in/uploads/cms/1588078765.JPG',
        title:'Mess Facilities'
    },
    {
        image:'https://trainingindustry.com/content/uploads/2020/12/Project-Status-Meetings-12.2.20.jpg',
        title:'Opportunity to meet our highly skilled team'
    },
   
    
  
    ,
    {
        image:'https://www.cv-library.co.uk/career-advice/wp-content/uploads/2022/06/Blog-Popular-interview-questions.jpg',
        title:'IPMAT Preparation'
    },
    {
        image:'https://media.istockphoto.com/id/1370735949/photo/teen-girl-gestures-while-explaining-something-to-female-teacher.jpg?s=612x612&w=0&k=20&c=I5K1JIPSRCNJTMuhhW0VDEmx9qiPUi7i7o_8BDKZG9g=',
        title:'Regular Interaction between Student & Faculty'
    },
    {
        image:'https://whatfix.com/blog/wp-content/uploads/2022/09/peer-learning.png',
        title:'Peer to Peer Learning'
    },
    {
        image:'https://images.squarespace-cdn.com/content/v1/537cad0be4b02cb9fe04985f/1426362641730-UOS11XMBBYB083ZCUGWF/Doubt.jpg',
        title:'24/7 Doubt Solving'
    }/* ,
    {
        image:'https://imageio.forbes.com/specials-images/imageserve/6150c0f0a99120b6090be4f9/Businesswoman-and-businessman-HR-manager-interviewing-woman/0x0.jpg?format=jpg&crop=1318,741,x0,y4,safe&width=960',
        title:'Daily Personal Interview Preparation'
    } */
  ]
  const reviews=[{
    image:'/anurag.png',
    fullname:'Anurag Singh',
    college:'IIM Indore   ',
    title:'Best Preparation Experience',
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
     event:"Free Consulation",
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
  if(formData == undefined){
    setNotification('All Fields are empty')
    return null
  }
  if (!formData.fullname || formData.fullname.trim() === '') {
    setNotification('Fullname field is empty');
    return null;
  }

  // Check email
  if (!formData.email || formData.email.trim() === '') {
    setNotification('Email field is empty');
    return null;
  }

  // Validate the email format using a regular expression
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(formData.email)) {
    setNotification('Email is not valid');
    return null;
  }

  // Check phone
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
  if (!formData.year || formData.year.trim() === '') {
    setNotification('Year field is empty');
    return null;
  }

  // Validate the year
  const year = parseInt(formData.year);
  if (isNaN(year) || year < 1900 || year > 2099) {
    setNotification('Year is not valid');
    return null;
  }

  // Check city
  if (!formData.city || formData.city.trim() === '') {
    setNotification('City field is empty');
    return null;
  }
    
      setLoader(true)
      
    /*   TestApi();
      triggerInterakt(); */
        
        cronberryTrigger(formData.fullname,formData.email,formData.phone,formData.city,'https://register.ipmcareer.com');
        const {data,error} = await supabase.from('ipm_leads').insert({
          name:formData.fullname,
  email:formData.email,
  phone:formData.phone,
  city:formData.city,
  year:formData.year,
  source:'Residential Page'
      }).select();
      if(data){
        console.log("inserted")
      }else if(error){
        console.log(error)
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
  const hosts = [
    {
      image:'https://www.ipmcareer.com/wp-content/uploads/2023/06/WhatsApp-Image-2022-09-24-at-11.32.11-PM-e1687027784270.png',
      name:'Ashutosh Mishra',
      education:'IIM Ahmedabad',
      expertise:'Co-Founder @ IPM Careers',
    },
    {
      image:'https://www.ipmcareer.com/wp-content/uploads/2024/03/coppred.png',
      name:'Aradhya Vats',
      education:'IPM IIM Indore',
      expertise:'IIM Gold Medalist',
    }/* ,
    {
      image:'https://www.ipmcareer.com/wp-content/uploads/2023/06/WhatsApp-Image-2023-06-15-at-23.36.55-e1687027803681.png',
      name:'Barun Singh',
      education:'IIM Ahmedabad',
      expertise:'',
    } */
  ]
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


  
    return <>
    <Head>
    <link href='https://fonts.googleapis.com/css?family=Anek+Devanagari' rel='stylesheet' />
    <link href='https://fonts.googleapis.com/css?family=Roboto+Mono' rel='stylesheet' />
    <link rel='icon' href='/favicon_active.svg'/>
    <title>Residential Batch | IPM Careers</title>
        <meta name="description" content="Now Learn at your favorite IPMAT Coaching IPM Careers." />
    </Head>
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
    {loader? <div className={styles.loader}>

<svg width="197px" height="197px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
<circle cx="50" cy="50" fill="none" stroke="var(--brand-col2)" stroke-width="3" r="27" stroke-dasharray="127.23450247038662 44.411500823462205">
  
</circle>
</svg>
<p>Sending your wish to IIM Gods</p>
</div> :''}
<div className={styles.appcontainer}>
<div className={styles.hd}><img src='/ipm_logo.svg'/></div>
<div className={styles.hero}>
    <div className={styles.gradfill}></div>
    <div className={styles.gradfill2}></div>
    <div className={styles.gridfill}></div>
<div className={styles.div1}>
    <h2>Residential Batch <br/>at <span style={{color:"var(--brand-col1)"}}>IPM Careers Kanpur</span></h2>
   <div className={styles.badgewrap}>
    <p className={styles.badge} style={{backgroundColor:"var(--brand-col1)",color:"white",marginRight:"10px"}}>Starting from 25th May 2024</p>
    <p className={styles.badge}>One on One Mentorship</p>
    <p className={styles.badge} >Mentorship by IIM Gold Medalist</p></div>
    {/* <p className={styles.badge2}>Anyone securing <strong className={styles.color2}>AIR 1 to AIR 5</strong> will be getting a cash prize of 1 Lakh</p> */}
    <p>Now Prepare better, Staying at IPM Careers around supervision of Mentors & Founders. <br/>A Perfect Residential Batch for your IPMAT 2024 Exams.</p>
</div>
<div className={styles.div2}>


<div className={styles.formcont}>
<h1 className={styles.team_heading}>Register Now in Residential Batch at Kanpur Centre !! Limited Seats.</h1>
<input name={"name"} className={styles.input} placeholder={"Enter your Full Name"} type={"text"} value={formData && formData.fullname} onChange={(e)=>{setFormData(res=>({...res,fullname:e.target.value})) }}/>
<input name={"email"} className={styles.input + " " + (validateEmail(formData ? formData.email : 'test@gm.co') ? '' : styles.fielderror)} placeholder={"Enter your Email Address"} type={"text"} value={formData && formData.email} onChange={(e)=>{setFormData(res=>({...res,email:e.target.value})) }}/>
<input name={"phone"} className={styles.input + " " + (validatePhone(formData ? formData.phone : '+918888888888') ? '' : styles.fielderror)} placeholder={"Enter your Phone Number"} type={"text"} value={formData && formData.phone} onChange={(e)=>{setFormData(res=>({...res,phone:e.target.value})) }}/>
<input name={"city"} className={styles.input} placeholder={"Enter your City"} type={"text"} value={formData && formData.city} onChange={(e)=>{setFormData(res=>({...res,city:e.target.value})) }}/>

{formData && formData.city && formData.fullname && formData.phone && formData.email ? '':<p className={styles.error}>Please fill all the fields</p>}
{/* <div onClick={TestApi} className={styles.submit}>TEST</div> */}
<div className={styles.progress}>
    <div className={styles.progress_inner} style={{width:formData ? Object.keys(formData).length*100/5 +"%" : '0%'}}></div>
 
  </div>
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
</div>

<GradientMarquee text="THE PERFECT RESIDENTIAL BATCH FOR YOUR IPMAT PREPARATIONS || "></GradientMarquee>
<div className={styles.spacer}></div>
<img src='/residential_web.jpg' className={styles.image}/>
<h2>Faculty</h2>
<div className={styles.cardwrap}>
 
 {hosts && hosts.map((i,d)=>{
  return <div className={styles.hostcard}>
<img src={i.image}/>
<h2>{i.name}</h2>
<p>{i.education}</p>
<p>{i.expertise}</p>
  </div>
 })
 }
</div>
<h2 className={styles.hding}>Benefits bundled with this <span style={{color:'var(--brand-col1)'}}>Residential Batch</span></h2>
<div className={styles.cardwrap}>

    {keys && keys.map((i,d)=>{

        return <div className={styles.keycard} style={{backgroundImage:`url(${i.image})`}}>
              <p>{i.title}</p>
<div className={styles.imgbg}></div>
            <div className={styles.mask}></div>
          
        </div>
    })}

</div>
{/* <Section title={"An Overview on:Residential PI Batch"} color="var(--brand-col1)" align="left">
<div className={styles.parent}>
<div className={styles.col1}>
<h2>Watch a short video explanation of Residential PI Batch at IPM Careers Kanpur</h2>
<p></p>
<div className={styles.yt}>
<YouTube className='embed-container' title='' videoId="bFszqpsA81g" opts={opts}  /></div>


</div>
<div className={styles.col2}>

</div>
</div>

        </Section> */}
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
<GradientMarquee text="THE PERFECT RESIDENTIAL BATCH FOR YOUR IPMAT PREPARATIONS || "></GradientMarquee>
<Section title={"Our Promising:Results"} color="var(--brand-col2)" align="left" visible="true">
 <img alt="IPM Careers Rohtak Results"  className={styles.results} src={'https://www.ipmcareer.com/wp-content/uploads/2023/01/Rohtak-Results-Template-ooo-scaled-_1_.webp'}/>

   </Section>
   <GradientMarquee text="THE PERFECT RESIDENTIAL BATCH FOR YOUR IPMAT PREPARATIONS || "></GradientMarquee>
 {/*   <Section title={"Frequently:Asked Questions"} color="var(--brand-col2)" align="left" visible="true">
   <FAQ items={faqs}/>
   </Section> */}
   <Footer/>
   
   </div>
   
</>
}


export default Residential;