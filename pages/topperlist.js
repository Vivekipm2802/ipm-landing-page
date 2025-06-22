import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './Topper.module.css'
import TopperWrap from '../components/TopperWrap';


function Topper({data}){

const [rawData,setRawData] = useState(data);
const [scoreJson,setScoreJSON] = useState([]);

useEffect(()=>{

const datatoMod = rawData;
converttoJson(datatoMod)

},[])


function converttoJson(a){
 
  /* if(a != undefined){
    a.map((i,d)=>{
        setScoreJSON(res=>([...res,JSON.parse(i.data)]))

    })} */
}

function calculateScores(d, subtractScore,addScore) {
  if (!d || !Array.isArray(d)) {
    return 0;
  }

  return d.reduce((sum, i) => {
    if (i.status === "Answered" || i.status === "Marked For Review" && (i.rightAnswer != undefined && i.givenAnswer != undefined) ) {
      if (i.rightAnswer == i.givenAnswer) {
        return sum + addScore; // Increase the score by 1 if the answer is correct
      } else if(i.rightAnswer != i.givenAnswer && subtractScore > 0) {
        return sum - subtractScore; // Subtract the given score if the answer is incorrect
      }
    }
    return sum; // Keep the same score for unanswered questions
  }, 0);
}

const config = {
  banner:'https://www.ipmcareer.com/wp-content/uploads/2024/05/Special-PI-batch.jpg',
  bannerLink:'/pi-batch',
  bannerTitle:'Enroll Now',
  tools:[
    {
      link:'/call',
      title:'IPMAT Call Predictor'
  },
      {
          link:'/response',
          title:'IPMAT Score Calculator from Response Sheet'
      },
      {
          link:'/404',
          title:'IPMAT AI College Suggestor'
      },
    
  ]
}
    return <div className={styles.main}>
        <div className={styles.left}>
        <div className={styles.logo}>

<img src='/hd-logo.svg'/>
</div>
            <h2 className="text-2xl font-bold"><span className={styles.b1 }>IPMAT Toppers</span><br/> by Response Sheet Submissions</h2>
       <div className={styles.topperlist}>
        {data && data.map((i,d)=>{
            return <ConditionalWrap condition={i.our_student} wrapper={(e)=>(<TopperWrap>{e}</TopperWrap>)}>
            
            <li className={styles.topper + " " + (d <= 2 ? styles.extra : '') + " " + (d == 0 ? styles.first :'') + " " + (d == 1 ? styles.second : '') + " " + (d==2? styles.third : '') }>
                {d <= 2 ? <div className={styles.ripple}></div>:''}
                <h3>{i.name}</h3> 
               
               {/*  <p>SA : {i.sa  || 'Being Calculated....'}</p>
                <p>MCQ(QA) : {i.qa || 'Being Calculated....'}</p>
                <p>VA(MCQ) : {i.va || 'Being Calculated....'}</p> */}
                <p className='font-bold !text-sm'>Marks Obtained : {i.total}</p>
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
                </li></ConditionalWrap>
        },[])}
        
        <li className={styles.toppers}>
                
                <p>and many more...</p><p></p>
               
                </li>
                {/* <div className='text-xs border-1 border-gray-500 text-gray-500 px-2 py-1 rounded-xl text-center'>Latest Data as of </div> */}
       </div></div>
       <div className={styles.right}
       >

<div className={styles.banner}>
    <img src={config.banner}/>
    <a className={styles.floating} href={config.bannerLink} target="_blank"><button className={styles.button}>{config.bannerTitle}</button></a>
</div>
<div className={styles.tools}>
    <h2>USEFUL LINKS & TOOLS<br/> <span style={{color:'var(--brand-col1)'}}>BY IPM CAREERS</span></h2>
    {config.tools && config.tools.map((i,d)=>{
        return <a className={styles.tool} href={i.link}>{i.title}</a>
    })}
</div>

       </div>
    </div>
}

const ConditionalWrap = ({children,wrapper,condition})=>{

  return condition ? wrapper(children):children
}

export default Topper;

export async function getServerSideProps(context) {
    try {
      const { data, error } = await supabase.rpc('get_top_10')
  
      if (error) {
        throw new Error(error.message); // Throw an error if there's an error from Supabase
      }

      
 

      return {
        props: {
          data: data || [], // Pass an empty array if data is undefined or null
        },
      };
    } catch (error) {
     
  
      return {
        props: {
          data: [], // Pass an empty array as props to indicate an error
          error: error.message, // Pass the error message as props
        },
      };
    }
  }