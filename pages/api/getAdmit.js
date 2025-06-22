import axios from 'axios';
import cheerio from 'cheerio';
import { supabaseServer } from '../../utils/supabaseClient';
const { camelCase } = require('lodash');
export default async function handler(req, res) {
    try {
        const { url,email,phone } = req.body;


        
        /* const response = await axios.get(url);

        const html = response.data;

       
        const $ = cheerio.load(html);
 */


const sData= {
    name:'Aditya',
    appno:1375408,
    dob:'26-06-2005',
    gender:'male',
    category:'general',
    isPWD:'No',
    picture:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    aadharpic:'',
    signature:''
}

const tData = {
    date:'16th June 2024 and Friday',
    entry:"12:00 PM",
    closing:'1:30 PM',
    period:'02:00 PM - 04:00 PM',
    city:'Guwahati',
    location:'iON Digital Zone IDZ Borjhar, eCOM Tower',
    username:'AT2317812',
    password:'26062005',
    distance:'3.6KM',
    centreurl:'https://google.com/'
}


const iData = {
    content:[]
}



async function insertDetails(a){

 if(a == undefined){
    res.status(404).json({ success: false, message: 'Missing details' });
    return null
 }   

const {data,error} = await supabaseServer.from('admit_cards').insert({
    email:email,
    phone:phone,
    data:a,
    url:url,
    name:a.sData.name
}).select()

if(data){
    res.status(200).json({ success: true, data: data });
}
if(error){
    res.status(400).json({ success: false, message: 'Failed to insert Data' });
}

}


insertDetails({sData,tData,iData})

        
    } catch (error) {

        res.status(404).json({ success: false, message: 'Failed to retrieve table data' });
    }
}