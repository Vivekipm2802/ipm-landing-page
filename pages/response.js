import styles from './Response.module.css'
import axios from 'axios'
import { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import Head from 'next/head'
import {useRouter} from 'next/router'
import { supabase } from '../utils/supabaseClient';
import Marquee from "react-fast-marquee";
import "tailwindcss/tailwind.css";
import {uuid} from 'uuidv4'
import { Avatar, Button, Chip, Divider, Input, Link, Select, SelectItem, Spacer } from '@nextui-org/react';
import ShareButton from '../components/ShareButton';
import { toast } from 'react-hot-toast';

function Response(){

const [url,setUrl] = useState();
const [data,setData] = useState();
const [downloadLink,setDownloadLink] = useState();
const [formData,setFormData] = useState();
const [secondDownloadLink,setSecondDownloadLink] = useState();
const [loading,setLoading] = useState(false);
const [index,setIndex] = useState(0);
const [help,setHelpModal] = useState(false);
const [sent,setSent] = useState(false);
const router = useRouter();
const [topperslist,setToppersList] = useState(0);
const [vis,setVis] = useState();
const [error,setError] = useState();




useEffect(()=>{



  getCount()
  getToppers()
  

  supabase
    .channel('room1')
    .on('postgres_changes', { event: 'INSERT', schema: 'public' , table:'who_submitted'  }, payload => {
      toast.custom(<div className='flex flex-row items-center justify-start p-2 font-sans z-50 text-xs bg-white rounded-xl shadow-md'>
        <Avatar src='https://t4.ftcdn.net/jpg/04/10/43/77/360_F_410437733_hdq4Q3QOH9uwh0mcqAhRFzOKfrCR24Ta.jpg'></Avatar>
        <div className='flex flex-col flex-1 ml-2'>
          <h2 className='font-bold'>{payload.new.name} just generated scorecard</h2>
          <p>Scored Total : {payload.new.total}</p>
        </div>
      </div>)
    })
    .subscribe()


},[])


const categories = [
        
  { value: 'gen', title: 'GEN' },
  { value: 'ews', title: 'EWS' },
  { value: 'obc', title: 'OBC' },
  { value: 'nc_obc', title: 'NC-OBC' },
  { value: 'pwd', title: 'PWD' },
  { value: 'sc', title: 'SC' },
  { value: 'st', title: 'ST' }
] 

useEffect(()=>{

  if(router.query.form){
    
    setVis(router.query.form)
  }
},[router])

async function getCount(){
const {data,error} = await supabase.rpc('get_total_responses')

if(data){
  
setIndex(550+data)

}if(error){
  
}
}
async function getToppers(){
  const {data,error} = await supabase.rpc('get_top_10')

if(data){
  
setToppersList(data.slice(0,3))

}if(error){
  
}
}

async function handleGenerate(url,b,c){
 
  

  const {data,error} = await axios.post('https://main.your-domain.com/printables',{
  url:url,
  width:'210mm',
  height:'297mm',

  })

  if(data){

      setLoading(false)
      toast.success('Full Scorecard Available Now to Download')
      setSecondDownloadLink(data.url)
      
  }

  else if(error){
    toast.error('Unable to Generate your PDF Scorecard')
      setLoading(false)
  }

 

 
}
function validateURL(url) {
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  return regex.test(url);
}
async function getResponseSheetData(a){
  
    if(!formData){
        setError('Form is Empty , Please fill All the details')
        return 
    }
    if(!formData.email || !validateEmail(formData.email)){
        setError('Email is Empty or Invalid')
        return 
    }
    if(!formData.phone || !validatePhone(formData.phone)){
        setError('Phone is either invalid or empty Enter without +91 or 0')
        return 
    }
    if(!formData.category){
      setError('Please Select Category')
      return 
  }
    if(!url || !validateURL(url.trim())){
      setError('Invalid URL Please Check Again , It should be a url to HTML of Response Sheet. For Example : https://iima.ac.in/responsesheet.html');

      return 
  }
  
    setLoading(true)
    await axios.post('/api/sheetdata',{
        url:url.trim()
    }) .then(response => {
      // Check if the response data is available
      if (response.data) {
        // Destructure the data object or perform other operations
        const { data } = response;
        // Use the destructured data or perform other operations
      const to = calculateScores(data.data.sa,0,4) + calculateScores(data.data.mcq,1,4) + calculateScores(data.data.va,1,4,true);
      
        submitResponse(data.data,formData,to,url)
        setData(data.data)
        setLoading(false)
      } else {
        // Handle the case when the response data is empty or not in the expected format
        
        setHelpModal(true)
        setLoading(false)
      }
    })
    .catch(error => {
      // Handle the error case
      
      setHelpModal(true)
      alert('Something Went')
      setLoading(false)
    });

   
}
async function submitResponse(a,b,c){
setLoading(true);
const mainTotal = c;
const uid = uuid()
const {error} = await supabase.from('responses').insert(
        {
            email:b.email,
            phone:b.phone,
            data:JSON.stringify(a),
            name:a.StudentData.participantName,
            total: mainTotal, 
            link:url.trim(),
            category:b.category,
            uuid:uid

        }
    )
    if(error){
      setLoading(false)
      toast.error('Unable to Generate your Scorecard')
    }
    if(!error){
      
        setFormData()
        setLoading(false);
        setUrl();
        toast.success('Successfully Generated Scorecard');
        setDownloadLink(`/scorecard/${uid}`);
        handleGenerate(`https://register.ipmcareer.com/scorecard/${uid}`,b.email,'Unknown Student')
        
    }
   
}


async function sendMail(a,b,c){

  const {data,error} = await axios.post('/api/sendSheet',{
    name:a,
    url:b,
    email:c
  })

  if(data){
   
    setSent(true);
  }
  else {
toast.error('Email was not sent')

  }
}
const config = {
    banner:'https://www.ipmcareer.com/wp-content/uploads/2024/05/Special-PI-batch.jpg',
    bannerLink:'/pi-batch',
    bannerTitle:'Enroll Now',
    tools:[
      {
        link:'/topperlist',
        title:'IPMAT Score Topper List'
    },
        {
            link:'/call',
            title:'IPMAT Call Predictor'
        },
        {
            link:'/404',
            title:'IPMAT AI College Suggestor'
        },
      
    ]
}
function validatePhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  }
  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  function calculateScores(d, subtractScore,addScore,special) {
    if (!d || !Array.isArray(d)) {
      return 0;
    }
 

    
    return d.reduce((sum, i) => {
      if (i.status === "Answered" || i.status === "Marked For Review") {
        if (i.rightAnswer == i.givenAnswer) {
          return sum + addScore; // Increase the score by 1 if the answer is correct
        } else if(i.rightAnswer != i.givenAnswer && subtractScore > 0 && !(special == true && i.givenAnswer.length > 1)) {
          return sum - subtractScore; // Subtract the given score if the answer is incorrect
        }
      }
      return sum; // Keep the same score for unanswered questions
    }, 0);
  }


    return <div className={styles.maincont}>
      
{/* {loading ? 
<div className={styles.loading_overlay}>

<svg xmlns="http://www.w3.org/2000/svg" width="24" fill='white' height="24" viewBox="0 0 24 24"><g className="spinner_Wezc"><circle cx="12" cy="2.5" r="1.5" opacity=".14"/><circle cx="16.75" cy="3.77" r="1.5" opacity=".29"/><circle cx="20.23" cy="7.25" r="1.5" opacity=".43"/><circle cx="21.50" cy="12.00" r="1.5" opacity=".57"/><circle cx="20.23" cy="16.75" r="1.5" opacity=".71"/><circle cx="16.75" cy="20.23" r="1.5" opacity=".86"/><circle cx="12" cy="21.5" r="1.5"/></g></svg>
  <p>
  
    Loading...</p>
</div>
:''} */}

        <Head>
        <link rel="icon" href={'/favicon_ipm.svg'} />
        </Head>
        {/* <div className={`${(secondDownloadLink != undefined ? '!scale-[5] ':'')} w-[500px] z-[0] h-[500px] bg-green-500 scale-0 transition-all duration-700 delay-500 pointer-events-none origin-center rounded-[1000px] ease-soft-spring fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 `}></div> */}
        <div className={styles.grid}></div>
        <script dangerouslySetInnerHTML={{__html:"window.url = 'https://cdn.digialm.com//per/g01/pub/1329/touchstone/AssessmentQPHTMLMode1/1329O221/1329O221S1D428/16568356269388104/AT2204080_1329O221S1D428E2.html#';"}}>
        
        </script>
         <NextSeo
        title='IPMAT Score from Response Sheet - Best IPMAT Tool'
        description='IPMAT Score from Response Sheet is a tool which can give you detailed analysis of your IPMAT response sheet in a matter of seconds.'
        canonical='https://register.ipmcareer.com/response'
        openGraph={{
          url: 'https://register.ipmcareer.com/response',
          title: 'IPMAT Score from Response Sheet - Best IPMAT Tool',
          description: 'IPMAT Score from Response Sheet is a tool which can give you detailed analysis of your IPMAT response sheet in a matter of seconds.',
          images: [
            {
              url: '/scorecard_ss.png',
              width: 1200,
              height: 630,
              alt: 'IPMAT Response Sheet Tool',
            },
          ],
        }}
       ></NextSeo>


{help ? 
<div className={styles.helpoverlay}>
<div onClick={()=>{setHelpModal(false)}} className={styles.closefill}></div>
  <div className={styles.helpmodal}>
  <svg onClick={()=>{setHelpModal(false)}} className={styles.closer} width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 5a.75.75 0 0 0-.743.648l-.007.102v3.5h-3.5a.75.75 0 0 0-.102 1.493l.102.007h3.5v3.5a.75.75 0 0 0 1.493.102l.007-.102v-3.5h3.5a.75.75 0 0 0 .102-1.493l-.102-.007h-3.5v-3.5A.75.75 0 0 0 12 7Z" fill="#f00"/></svg>
<h2>Unable to Fetch Data from Sheet</h2>
<p className={styles.errormsg}>
It could be because of Invalid URL Please Check Again , It should be a url to HTML of Response Sheet. For Example : https://iima.ac.in/responsesheet.html
</p>
<p>OR</p>
<a href='tel:+918299470392'>Call Us to Solve Query</a>
  </div>
</div>
:''}
        <div className={styles.innercont}>
<div className={styles.leftcol}>
<div className={styles.logo}>

    <img src='/hd-logo.svg'/>
</div>

<div className={styles.formsection}>
    <h1 className='text-3xl font-bold'><span style={{color:'var(--brand-col1)'}}>IPMAT Score </span><br/>from Response Sheet</h1>
    <div className={styles.counter}><strong>{index}</strong> IPMAT Heroes have already generated their Score Sheets since 2022. Now it's your turn. <span className={styles.counterbadge}><a href='/topperlist'>List of Toppers by IPMAT Score</a></span></div>
    <Marquee className={styles.marquee}  speed={80} gradient={false}>
       {
        topperslist && topperslist.map((i,d)=>{
          return <div className={styles.toppers}>
            
         
            {d== 0 ? <div className={styles.award}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.253 2a2.25 2.25 0 0 1 2.236 2h1.268A1.75 1.75 0 0 1 20.5 5.606l.006.144v3a3.25 3.25 0 0 1-3.066 3.245l-.21.006a5.758 5.758 0 0 1-4.731 3.95V17.5h1.753a3.25 3.25 0 0 1 3.244 3.066l.006.184v.5a.75.75 0 0 1-.649.743l-.101.007H6.75a.75.75 0 0 1-.744-.648L6 21.25v-.5a3.25 3.25 0 0 1 3.065-3.245l.185-.005H11v-1.549a5.758 5.758 0 0 1-4.729-3.95L6.245 12a3.25 3.25 0 0 1-3.25-3.25v-3c0-.966.784-1.75 1.75-1.75h1.268A2.25 2.25 0 0 1 8.25 2h7.003Zm3.504 3.5h-1.254v4.983A1.75 1.75 0 0 0 19 8.904l.007-.154v-3a.25.25 0 0 0-.193-.243l-.057-.007ZM6 5.5H4.745a.25.25 0 0 0-.25.25v3A1.75 1.75 0 0 0 6 10.483V5.5Z" fill="#000"/></svg>
                     <p>1st</p></div>:''}
                {d== 1 ? <div className={styles.award}>
                <svg  fill="#fff" height="24px" width="24px" version="1.1" viewBox="0 0 270.242 270.242" enable-background="new 0 0 270.242 270.242">
  <path d="m234.775,153.093l-67.087-12.446-6.741-12.411 44.363-36.252v-91.984h-140.376v91.983l44.363,36.251-6.742,12.412-67.088,12.446 46.961,49.499-8.896,67.65 61.59-29.365 61.59,29.364-8.896-67.649 46.959-49.498zm-139.841-75.338v-47.755h80.376v47.755l-28.938,23.647-11.25-20.713-11.25,20.713-28.938-23.647zm64.832,141.637l-24.645-11.751-24.645,11.75 3.561-27.068-18.791-19.808 26.844-4.979 12.965-23.871h0.132l12.965,23.871 26.845,4.979-18.791,19.808 3.56,27.069z"/>
</svg>
                     <p>2nd</p></div>:''}
                {d== 2 ? <div className={styles.award}> 
                <svg  fill="#fff" height="24px" width="24px" version="1.1" viewBox="0 0 270.242 270.242" enable-background="new 0 0 270.242 270.242">
  <path d="m234.775,153.093l-67.087-12.446-6.741-12.411 44.363-36.252v-91.984h-140.376v91.983l44.363,36.251-6.742,12.412-67.088,12.446 46.961,49.499-8.896,67.65 61.59-29.365 61.59,29.364-8.896-67.649 46.959-49.498zm-139.841-75.338v-47.755h80.376v47.755l-28.938,23.647-11.25-20.713-11.25,20.713-28.938-23.647zm64.832,141.637l-24.645-11.751-24.645,11.75 3.561-27.068-18.791-19.808 26.844-4.979 12.965-23.871h0.132l12.965,23.871 26.845,4.979-18.791,19.808 3.56,27.069z"/>
</svg>
                <p>3rd</p></div>:''}
           
     
            {i.name } scored {i.total}
            {i.our_student == true ? <div className='text-xs bg-secondary text-black rounded-full mx-2 px-2 py-1'>IPM Careers Student</div>: ''}
            </div>
        })
       }
        
    </Marquee>
            <div className={styles.inputsection}>
            <div className={styles.responseForm + " font-sans"}>
                <h2>Fill up the details below and click submit to generate</h2>
        
                <Spacer y={6}></Spacer>
        <div className='flex flex-row items-center justify-stretch w-full'>
        <Input name='email' type='email' placeholder='Enter your Email Address' label="Email" value={formData?.email? formData.email : ''} onChange={(e)=>{setError(),setFormData(res=>({...res,email:e.target.value}))}}/>
        <Spacer x={2} y={2}></Spacer>
        <Input type='text' name='phone' placeholder='Enter your Phone' maxLength={10} label="Phone" value={formData?.phone? formData.phone : ''} onChange={(e)=>{setError(),setFormData(res=>({...res,phone:parseInt(e.target.value)}))}}/>
        </div>
        <Spacer y={2}></Spacer>
        <Select label="Category" placeholder={'Please Select Category'} objects={categories} onChange={(e)=>{setError(),setFormData(res=>({...res,category:e.target.value}))}}>
{categories && categories.map((i,d)=>{
  return <SelectItem key={i.value} value={i.value}>{i.title}</SelectItem>
})}
        </Select>
        <Spacer y={2}></Spacer>
        <Input placeholder='Enter Response Sheet URL' label="Response Sheet URL" value={url?url:''} onChange={(e)=>{setError(),setUrl(e.target.value)}}/>
        <p className='text-xs text-black rounded-xl border-1 border-yellow-500 bg-yellow-50 p-2 mt-2'>Please make sure to enter valid response sheet url , If your scores are 0 then your response sheeet URL is invalid</p>
       <Spacer y={2}></Spacer>
       
        <Button color="primary" isLoading={loading} onPress={()=>{setDownloadLink(),setSent(false),getResponseSheetData()}}>Generate</Button>
        
{downloadLink != undefined ?  <p className='text-red-500 text-xs border-red-500 border-1 rounded-xl p-1 bg-red-100 mt-2 px-4'>Due to High Traffic PDF Generation might not happen properly , meanwhile you can access our virtual scorecard and print.</p>:''}
       {downloadLink != undefined ?  <Button as={Link} target='_blank' color='secondary' size='sm' className='text-black my-4' href={downloadLink}>Download Virtual Scorecard</Button>: ''}
        <Spacer y={4}></Spacer>
        <Divider></Divider>
        <Spacer y={4}></Spacer>
        {error ? <p className={styles.errormsg}>{error}</p>:''}
        </div>
  {data ? <>


<div className={styles.scorecard}>
    <img className={styles.circles} src='/score.svg'/>
    <img className={styles.whitelogo} src='/whitelogo.svg'/>
    <div className={styles.profilesection}>
<h2 style={{fontWeight:'500'}}>ScoreCard</h2>
<div className={styles.profile}>
<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.754 14a2.249 2.249 0 0 1 2.25 2.249v.918a2.75 2.75 0 0 1-.513 1.599C17.945 20.929 15.42 22 12 22c-3.422 0-5.945-1.072-7.487-3.237a2.75 2.75 0 0 1-.51-1.595v-.92a2.249 2.249 0 0 1 2.249-2.25h11.501ZM12 2.004a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="#222F3D"/></svg>
    <p>{data.StudentData.participantName }</p>
</div>
    </div>
    <div className={styles.scorewrapper}>
    <div><h3>SA(QA)</h3><p>{calculateScores(data.sa,0,4)}</p></div>
    <div><h3>MCQ(QA)</h3><p>{calculateScores(data.mcq,1,4)}</p></div>
    <div><h3>VA(MCQ)</h3><p>{calculateScores(data.va,1,4,true)}
       
        </p></div>

        <div><h3>Total</h3><p>
        {calculateScores(data.sa,0,4) + calculateScores(data.mcq,1,4) + calculateScores(data.va,1,4,true)}
        </p></div>
        </div>


</div>


</>:<>
<div className={styles.instructions}>
<h2>HOW TO CHECK IPMAT 2024 SCORE??</h2>
<ul>
  <li>Login to IPMAT 2024 official website &nbsp; <a style={{color:'var(--brand-col1)'}} href='https://www.iimidr.ac.in/academic-programmes/five-year-integrated-programme-in-management-ipm/ipm-admissions-details' target='_blank'>https://www.iimidr.ac.in/academic-programmes/five-year-integrated-programme-in-management-ipm/ipm-admissions-details/</a>
</li>
<li>Click on <strong>“Candidate Response”</strong></li>
<li>Right Click (or long press) to <strong>Copy Link Address</strong></li>
<li>Paste the link in below (Enter File URL Field)</li>
<li>Click Submit</li>
<li>Your Sectional and Cumulative Scores will be displayed based on your attempts.</li>
</ul>
</div>
</>}    </div> 
{downloadLink ?<>
{sent? <p className={styles.sent}>Detailed Scorecard has been sent to your email.</p>:''}</>
: ''}



</div> 

{downloadLink ? <div className={styles.download + " " +  (styles.section)} style={{animationDelay:'100ms'}}>
{secondDownloadLink ? <>
<p className='!text-2xl font-bold'>Download your Full Scorecard Now</p>
<div className={styles.spacer_x}></div>
    <a href={secondDownloadLink} target="_blank"><button className={styles.button}>Download</button></a></>:<p>Loading Download Link...</p>}
</div>:''}

{downloadLink ? 
<div className={styles.sharesection + " " +  (styles.section)} style={{animationDelay:'200ms'}}>
    <p className='!text-2xl font-bold'>Share the Scorecard with your Friends
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17 3.002a2.998 2.998 0 1 1-2.148 5.09l-5.457 3.12a3.002 3.002 0 0 1 0 1.577l5.458 3.119a2.998 2.998 0 1 1-.746 1.304l-5.457-3.12a2.998 2.998 0 1 1 0-4.184l5.457-3.12A2.998 2.998 0 0 1 17 3.002Z" fill="var(--brand-col1)"/></svg>

    </p>

    <ShareButton url={`https://register.ipmcareer.com${downloadLink}`}></ShareButton>
</div>

:''}


</div>  
{vis == undefined?
<div className={styles.rightcol}>
<div className={styles.banner + " aspect-[0.56/1]"}>
    <img src={config.banner}/>
    <a className={styles.floating} href={config.bannerLink} target="_blank"><button className={styles.button}>{config.bannerTitle}</button></a>
</div>
<div className={styles.tools}>
    <h2 className=' text-2xl !font-bold'>USEFUL LINKS & TOOLS<br/> <span style={{color:'var(--brand-col1)'}}>BY IPM CAREERS</span></h2>
    {config.tools && config.tools.map((i,d)=>{
        return <a className={styles.tool} href={i.link}>{i.title}</a>
    })}
</div>
</div>:''}

</div>
    </div>
}

export default Response;