
import { admitTemplate } from '../../templates/admittemplate';
import { fromtemplate } from '../../templates/fromtemplate';
import { toTemplate } from '../../templates/totemplate';
import { supabase, supabaseServer } from '../../utils/supabaseClient';



const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.in',
    port: 465,
    secure: true,
    auth: {
      user: 'info@ipmcareer.in',
      pass: 'IPMCareers$#@1',
    },
  });


const sendFromEmail = async ({ id,uid,name,name2,email }) => {
  try {
    
    const htmlTemplate = fromtemplate({ id,uid,name,name2})
    // Create the email message

    
    const mailOptions = {
      from: '"IPM Careers Admit Card Tool" <info@ipmcareer.in>',
      to: email,
      subject: `Hey ${name} !! ${name2} has accepted your request ✅. You can now chat using button link in the email.`,
      html: htmlTemplate,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, message: 'Error sending email' };
  }
};



const sendToEmail = async ({ id,uid,name,name2,email }) => {
  try {
    
    const htmlTemplate = toTemplate({ id,uid,name,name2})
    // Create the email message

    
    const mailOptions = {
      from: '"IPM Careers Admit Card Tool" <info@ipmcareer.in>',
      to: email,
      subject: `Hey ${name} !! You have accepted ${name2}'s request ✅. You can now chat using button link in the email.`,
      html: htmlTemplate,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, message: 'Error sending email' };
  }
};

export default async (req, res) => {
 
  if (req.method === 'POST') {
    const data = req?.body;
 const { password, appno,from,to } = data;
 
 async function getData(a,b){
const {data,error} =await supabaseServer.from('admit_connects').select('id,from(name,appno,data,email),to(name,appno,data,email),accepted').eq('from',a).eq('to',b).limit(1);
if(error){
  res.status(400).json({error:error})
  
  return null
}
if(data == undefined && data.length == undefined){
  res.status(400).json({error:{message:"Invalid Request"}})
}
return data[0]
}

const r= await getData(from,to);

if(r?.to?.data?.tData?.password == undefined){
res.status(400).json({error:{message:'Invalid Request , Password not Found'}})
}
if(password == r.to.data.tData?.password){

  const z= await updateAccepted(r.id,true)
  await sendFromEmail({
    name:r.from.name,
    name2:r.to.name,
    email:r.from.email,
    uid:from,
    id:r.id

  })
  await sendToEmail({
    name:r.to.name,
    name2:r.from.name,
    email:r.to.email,
    uid:to,
    id:r.id

  })
 
  
  res.status(200).json(z)

  
}
else{
  console.log(r.to.data.tData.password , password)
  res.status(400).json({error:{message:"Password incorrect"}})
}



async function updateAccepted(a,b){

  const {data,error} = await supabaseServer.from('admit_connects').update({
    accepted:b
  }).eq('id',a).select();


  if(data){
    /* await sendEmail({email:r.from.email,name:r.to.name,name2:r.from.name}); */
   return {error:false,data:{message:'Succesfully accepted request'}}

  }
  if(error){
    console.log(error)
    return {error:{message:"Error Accepting Request, Please try again"}}

  }
}



  

   
  

   
    
  } else {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
};
