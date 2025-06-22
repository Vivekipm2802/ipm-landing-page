import { supabaseServer } from '../../utils/supabaseClient';

const axios = require('axios');
export default async function LoginHandler(req, res) {
    if (req.method === "POST") {
        const { phone,uid } = req.body.record;

        try {
            

            axios.post('https://api.interakt.ai/v1/public/track/users/', {
                userId: uid,
                phoneNumber: phone,
                countryCode: "+91",
                traits: {
                   
                    "uid": `${uid}`
                },
                tags: ['Chat']
            }, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Basic Y3lVZkhzUG9hbkowX2tPS3JqWkVvZllxYWZpNnJxX3FySWQ2b1VUODczUTo=",
                    "Access-Control-Allow-Origin": "*"
                }
            }).then((reso) => {
                if (reso.data.result) {
                    eventCall();
                    console.log(reso.data);
                }
            }).catch(() => {
                res.status(400).end();
            });

            async function eventCall() {
                axios.post('https://api.interakt.ai/v1/public/track/events/', {
                    userId: uid,
                    phoneNumber: phone,
                    countryCode: "+91",
                    traits: {
                        
                       
                        "uid": `${uid}`
                    },
                    event: 'Promo',
                    tags: ['Chat']
                }, {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Basic Y3lVZkhzUG9hbkowX2tPS3JqWkVvZllxYWZpNnJxX3FySWQ2b1VUODczUTo="
                    }
                }).then((reso) => {
                    if (reso.data.result) {
                        console.log('secondcall', reso.data);
                        res.status(200).end();
                    } else {
                        res.status(400).end();
                    }
                }).catch(() => {
                    res.status(400).end();
                });
            }
        } catch (error) {
            
            console.error('Error:', error.message);
            res.status(500).end();
        }
    } else if (req.method === "GET") {
        res.status(200).json({ main: 'something' });
    } else {
        res.status(400).end();
    }
}