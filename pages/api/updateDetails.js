import axios from "axios";
import { supabase, supabaseServer } from "../../utils/supabaseClient";

export default function handler(req, res) {


    const {id,data} = req.body.record;


const t = data;


    async function updateDetails(a){
 const {data,error} = await supabaseServer.from('admit_cards').update({
    map_url:a?.url,
    pcode:a?.pluscode
 }).eq('id',id).select()

 if(data){
    
    res.status(200).end()
 }
 if(error){
    res.status(400).end()
 }

    }

    function r(inputString) {
        // Replace commas with spaces and forward slashes with plus signs
        return inputString.replace(/,/g, ' ').replace(/\//g, '+');
    }
    axios.post('https://api.replace-your.com/getPlaceURL',{
        "place":r(t.tData.location),

    }).then(res=>{updateDetails(res.data)})

}