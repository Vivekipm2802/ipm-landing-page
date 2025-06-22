import { Button, Spacer, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react"
import "tailwindcss/tailwind.css";
import { supabase } from "../../../../utils/supabaseClient";
import { toast } from "react-hot-toast";
import Link from "next/link";
import axios from "axios";

export default function BookaCab({type,uid}){

const [bgActive,setBgActive] = useState(false)
const [loading,setLoading]= useState(true)
const [loading2,setLoading2] = useState(true);
const [data,setData] = useState()
const [coords,setCoords] = useState()
useEffect(()=>{
    getRide(uid)
},[])


async function getRide(a){

const {data,error} = await supabase.from('admit_cards').select('*').eq('uid',a);
if(data){
    toast.success('Successfully Retrieved your Details')
    setLoading(false)
    setData(data[0])
    getCoordinates(data[0])
}
if(error){
    toast.error('Unable to get your Details, Please wait')
    setLoading(false)
}

}

async function getCoordinates(a){


if(a && a?.coordinates){
    setCoords(a?.coordinates)
    setLoading2(false)
    return null
}



}


async function updateCoords(a,b){

    const {data,error} = await supabase.from('admit_cards').update({coordinates:a}).eq('id',b).select()
    if(data){
console.log('Updated Successfully')
    }
    if(error){
        console.log('Error Updating')
    }
}

    return <div className="sf bg-gray-200 font-sans w-full h-full fixed min-h-[100vh] flex flex-col items-stretch align-middle justify-center p-2 lg:p-5">


       
    <div className="w-full h-full absolute left-0 top-0 z-0 bg-repeat bg-[size:400px] mix-blend-multiply opacity-20" style={{backgroundImage:'url("/grid.jpg")'}}></div>
    
    <div className={"w-full z-10 max-w-[800px] mx-auto  h-full min-h-[95vh] p-4  lg:p-8 flex flex-col items-center align-middle justify-center " + (bgActive == true ?"rounded-md shadow-md bg-white" :'') }>
    <div className="flex-0 w-full flex flex-row justify-between">
<img src="/ipm_logo.svg" width={250}/></div>
<div className="flex flex-1 flex-col flex-wrap w-full justify-center items-center">
<div className="w-full rounded-2xl shadow-md bg-white p-4 py-6">
    <div className={"flex flex-row items-center justify-center p-4 " +  (type == 'uber'? 'bg-black text-white':'') + " " +(type == 'ola'? 'bg-yellow-500 text-black':'') }>
{type == "uber" ? 'Book a Uber':''}
{type == "uber" ? 
<svg
xmlns="http://www.w3.org/2000/svg"
width="34px"
height="34px"
viewBox="0 0 34 34"
 className="ml-4"
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

</svg>:''}
{type == "ola" ? <svg
        xmlns="http://www.w3.org/2000/svg"
        data-name="Layer 1"
        viewBox="0 0 510.04 493.07"
       width={24}
       height={24}
        className="mr-2"
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
      </svg>:''}
{type == "ola" ? 'Book an OLA':''}
</div>
{loading? 
<div className="flex flex-row text-center items-center justify-center w-full border-1 p-2 rounded-lg">
    <Spinner className="mr-4"></Spinner> <h2>Getting your Centre Details</h2>
</div>
:''}

{!loading && data ? 
<div className="flex flex-col justify-center items-center p-4">
    <p className="text-center font-bold  mb-4">Your Centre: {data?.data?.tData?.location}</p>
{type == "uber" && data ? 
<Button
isLoading={loading2}
as={Link}
href={`uber://?action=setPickup&client_id=wFYwc-u2pKFauT7gQsF58tB3LXaFoz6I&pickup=my_location&dropoff[formatted_address]=${encodeURI(data?.data?.tData?.location)}&dropoff[latitude]=${coords?.latitude}&dropoff[longitude]=${coords?.longitude}`}
startContent={
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="34px"
    height="34px"
    viewBox="0 0 34 34"
     className="ml-4"
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
} className="bg-black text-white">Click to Open App</Button>:''}


{type == "ola" && data ? <Button
isLoading={loading2}
as={Link}
href={`https://olawebcdn.com/assets/ola-universal-link.html?drop_lat=${coords?.latitude}&drop_lng=${coords?.longitude}&dsw=no`}
startContent={
    <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 510.04 493.07"
   width={24}
   height={24}
    className="mr-2"
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
} className="bg-yellow-500 text-black">Click to Open App</Button>:''}

<Spacer y={2}></Spacer>
<Button  as={Link} target="_blank" href={`${data.map_url}`} className="bg-white shadow-md border-1 hover:bg-green-500" startContent={ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.3 132.3" width={24} height={24}>
     
      <path
        fill="#1a73e8"
        d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"
      />
      <path
        fill="#ea4335"
        d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"
      />
      <path
        fill="#4285f4"
        d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"
      />
      <path
        fill="#fbbc04"
        d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"
      />
      <path
        fill="#34a853"
        d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2"
      />
    
    </svg>}>Open in Google Maps</Button>
</div>
:''}

</div>
</div>
<div className="flex-0 h-[80px] w-full"></div>

  
    </div></div>
}

export async function getServerSideProps(context){


    const {type,uid}= context.query


    return {props:{
        type:type.replace('.js',''),uid:uid
    }}

}