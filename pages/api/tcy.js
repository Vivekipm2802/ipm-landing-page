const axios = require('axios');
var qs = require('qs');
export default async function LoginHandler(req, res) {
    /*    async function handleAPI(a, b, c) {
           console.log("api")
           await axios.post('/api/hello', {
               fullname: a,
               event: "Free Consulation",
               user_id: c,
               recipient: b,
           }).then(res => {
               setLoader(false)
           }).catch(res => {
               setLoader(false)
           })
       } */
    if (req.method === "POST") {

        const formData = req.body;
        


        const data = {
            client_id: 3158,
            security_code: 'd1R9fF5mfiE=',
            course_id: 35736,
            category_id: 835941,
            action: 'register',
            state: 'Uttar Pradesh',
            full_name: formData.full_name,
            city: formData.city,
            mobile_number: formData.phone,
            email: formData.email


        };
        await axios.post('https://www.tcyonline.com/api/erp_request.php', qs.stringify(data), {

            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',

            },

        }).then(reso => {

            res.status(200).send(reso.data.user_id);

        }).catch(reso => {

            
            res.status(200).end();
        })



    } else if (req.method === "GET") {
        res.status(200).json({ main: 'something' });
    } else {}
}