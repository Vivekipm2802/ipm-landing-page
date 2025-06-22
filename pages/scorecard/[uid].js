import { useEffect, useState } from 'react';
import styles from './ScoreCard.module.css'
import { supabase } from '../../utils/supabaseClient';
import {NextSeo}  from 'next-seo'
import "tailwindcss/tailwind.css";
import { Button, Divider, Spacer } from '@nextui-org/react';
import { useRouter } from 'next/router';
function ScoreCard({data,error,isFound}){

    const [Adata,setAData] = useState();
const [jsonData,setjsonData] = useState();


const router = useRouter()

    /* useEffect(()=>{

        setAData(data.data);
       
       if(Adata == undefined){
        return 
       }

    },[]) */

    useEffect(()=>{
      
      if( isFound == true){
      const r = (e)=>{return JSON.parse(e)}
        console.log(data)
        setjsonData(res=>({...res,mcq:r(data.qa_data),va:r(data.va_data),sa:r(data.sa_data)}))
      }
      
    },[data])
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
    function convertCamelCaseToNormalText(camelCaseString) {
        const result = camelCaseString
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lowercase and uppercase letters
          .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2'); // Insert space between uppercase and lowercase followed by uppercase letters
        
        return result.charAt(0).toUpperCase() + result.slice(1);
      }

if(isFound == false){
return <div className='flex flex-col bg-gray-100 h-screen w-full justify-center items-center'>
  <div className='flex flex-row font-sans'>We are unable to find your scorecard
  <br/>
  Please check your email for valid link</div>
  <Spacer y={2}></Spacer>
   {router.query.uid?.length < 5 ?
   <>
   <h2 className='border-1 border-red-500 px-2 py-1 rounded-xl bg-red-50 text-red-500 font-sans'>Old Links are Expired Now</h2>
   </>
   :''}
   </div>
}

    return <div className={styles.page}>
<NextSeo
        title={'IPMAT Score Card | IPM Careers Premium IPMAT Coaching'}
        description={'Detailed Scorecard generated from Response Sheet using Response Sheet Tool by IPM Careers. Available at register.ipmcareer.com/response'}
        openGraph={{
          title: 'IPMAT Score Card | IPM Careers Premium IPMAT Coaching',
          description: 'Detailed Scorecard generated from Response Sheet using Response Sheet Tool by IPM Careers. Available at register.ipmcareer.com/response',
          images: [
            {
              url: '/scorecard_ss.png',
              width: 1200,
              height: 630,
              alt: 'IPM Careers Response Sheet Tool'
            }
          ]
        }}
      />
<div className={styles.logosection}>
<img src='/hd-logo.svg'/>

</div>{/*
<div className={styles.profilesection}>



     <div className={styles.studentInfo}>



 <li><span>Student Name</span>  : <span>{data.name}</span></li>


</div> 


</div>*/}
<div className='w-full h-12'></div>
<h2 className='my-1 text-2xl font-bold text-center w-full text-primary'>{data.name}'s IPMAT 2024 Scorecard</h2>
<Divider></Divider>
<div className={styles.scoresection}>

{/* Score Section */}
{jsonData ? 
<div className={styles.scorecard}>
    <img className={styles.circles} src='/score.svg'/>
    <img className={styles.whitelogo} src='/whitelogo.svg'/>
    <div className={styles.profilesectionC}>
<h2 className=' text-xl font-bold'>ScoreCard</h2>
<div className={styles.profile}>
<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.754 14a2.249 2.249 0 0 1 2.25 2.249v.918a2.75 2.75 0 0 1-.513 1.599C17.945 20.929 15.42 22 12 22c-3.422 0-5.945-1.072-7.487-3.237a2.75 2.75 0 0 1-.51-1.595v-.92a2.249 2.249 0 0 1 2.249-2.25h11.501ZM12 2.004a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="#222F3D"/></svg>
    <p>{data?.name }</p>
</div>
    </div>
    <div className={styles.scorewrapper}>
    <div><h3>SA(QA)</h3><p>{calculateScores(jsonData.sa,0,4)}</p></div>
    <div><h3>MCQ(QA)</h3><p>{calculateScores(jsonData.mcq,1,4)}</p></div>
    <div><h3>VA(MCQ)</h3><p>{calculateScores(jsonData.va,1,4,true)}
       
        </p></div>

        <div><h3>Total</h3><p>
        {calculateScores(jsonData.sa,0,4) + calculateScores(jsonData.mcq,1,4) + calculateScores(jsonData.va,1,4,true)}
        </p></div>
        </div>


</div>:''}
{/* Score Section */}
<div className='flex flex-row items-center text-xs border-1 mt-2 border-gray-200 p-1 rounded-xl justify-center'>
  <div className='mr-2 flex flex-row items-center justify-start'>
  <svg className='mr-1' width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.22 6.97-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06Z" fill="#2ECC70"/></svg>
    <p>Correct</p>
  </div>
  <div className='mr-2 flex flex-row items-center justify-start'>
  <svg className=' rotate-45 mr-1' width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 5a.75.75 0 0 0-.743.648l-.007.102v3.5h-3.5a.75.75 0 0 0-.102 1.493l.102.007h3.5v3.5a.75.75 0 0 0 1.493.102l.007-.102v-3.5h3.5a.75.75 0 0 0 .102-1.493l-.102-.007h-3.5v-3.5A.75.75 0 0 0 12 7Z" fill="#f22e1c"/></svg>
    <p>Incorrect</p>
  </div>
  <div className='mr-2 flex flex-row items-center justify-start'>
  <svg className='mr-1' width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.909 2.782a2.25 2.25 0 0 1 2.975.74l.083.138 7.759 14.009a2.25 2.25 0 0 1-1.814 3.334l-.154.006H4.242A2.25 2.25 0 0 1 2.2 17.812l.072-.143L10.03 3.66a2.25 2.25 0 0 1 .879-.878ZM12 16.002a.999.999 0 1 0 0 1.997.999.999 0 0 0 0-1.997Zm-.002-8.004a1 1 0 0 0-.993.884L11 8.998 11 14l.007.117a1 1 0 0 0 1.987 0l.006-.117L13 8.998l-.007-.117a1 1 0 0 0-.994-.883Z" fill="#F2C511"/></svg>
    <p>Marked for Review</p>
  </div>
</div>


<div className={styles.results}>
<div className={styles.result  + " shadow-md border-0"}>
    <h2 className='font-bold text-xl'>SA Score</h2>
    <ul> {jsonData && jsonData.sa.map((i,d)=>{

return <li className={'flex flex-row items-center justify-start text-xs flex-1 flex-grow-0 p-1'}>
    <AnswerRender data={i} index={d}/>
     
     
     </li>
})}</ul>
</div>
<Divider></Divider>
<div className={styles.result + " shadow-md border-0"}>
    <h2 className='font-bold text-xl'>MCQ Score</h2>
    <ul>
    {jsonData && jsonData.mcq.map((i,d)=>{

return <li className={'flex flex-row items-center justify-start text-xs flex-1 flex-grow-0 p-1'}>
    <AnswerRender data={i} index={d}/>
     
     
     </li>
})}</ul>
</div>
<Divider></Divider>
<div className={styles.result  + " shadow-md border-0"}>
    <h2 className='font-bold text-xl'>VA Score</h2>
    <ul>
    {jsonData && jsonData.va.map((i,d)=>{

return <li className={'flex flex-row items-center justify-start text-xs flex-1 flex-grow-0 p-1'}>
     <AnswerRender data={i} index={d}/>
     
     
     </li>
})}</ul>
</div>

</div> 


</div>
<div className={"flex flex-col justify-center items-center bg-white rounded-md shadow-md p-2"}>
    <h2 className='font-bold text-xl text-primary' >For Interview Preparations : Call at 8299470392</h2>
    <p className='text-secondary border-1 border-secondary rounded-md p-1 w-full text-xs bg-yellow-50 text-center my-1'>This Scorecard is generated by IPM CAREERS Response Sheet Tool</p>
</div>
    </div>
}

const AnswerRender = ({data,index})=>{
  return <>
  { data.status  =="Answered" || data.status  == "Marked For Review" ? 
     <h3 className='flex flex-row items-center whitespace-nowrap'>{index+1} : {data.rightAnswer == data.givenAnswer ? <svg className='ml-1' width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.22 6.97-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06Z" fill="#2ECC70"/></svg> : 
     <svg className=' rotate-45 ml-1' width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 5a.75.75 0 0 0-.743.648l-.007.102v3.5h-3.5a.75.75 0 0 0-.102 1.493l.102.007h3.5v3.5a.75.75 0 0 0 1.493.102l.007-.102v-3.5h3.5a.75.75 0 0 0 .102-1.493l-.102-.007h-3.5v-3.5A.75.75 0 0 0 12 7Z" fill="#f22e1c"/></svg>
     }</h3>:
     
     <h3 className='flex flex-row flex-1 items-center whitespace-nowrap'>{index+1} : <svg className='ml-1' width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.909 2.782a2.25 2.25 0 0 1 2.975.74l.083.138 7.759 14.009a2.25 2.25 0 0 1-1.814 3.334l-.154.006H4.242A2.25 2.25 0 0 1 2.2 17.812l.072-.143L10.03 3.66a2.25 2.25 0 0 1 .879-.878ZM12 16.002a.999.999 0 1 0 0 1.997.999.999 0 0 0 0-1.997Zm-.002-8.004a1 1 0 0 0-.993.884L11 8.998 11 14l.007.117a1 1 0 0 0 1.987 0l.006-.117L13 8.998l-.007-.117a1 1 0 0 0-.994-.883Z" fill="#F2C511"/></svg></h3>}</>
}


export default ScoreCard;

export async function getServerSideProps(context){



    const {data,error} = await supabase.rpc('get_response_data',{uuid_arg:context.query.uid})
    
    
      
        return {props:{
           data :data?.length > 0 ? data[0] :'',
           isFound:data?.length > 0,
            error:data?.length > 0 ? false : true,
        }}
    }