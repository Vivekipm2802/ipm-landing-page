import { supabaseServer } from '../../utils/supabaseClient';

const axios = require('axios');
export default async function LoginHandler(req, res) {
    if (req.method === "POST") {
        const { from, to, accepted } = req.body.record;

        try {
            const { data: fromData, error: fromError } = await supabaseServer
                .from('admit_cards')
                .select('*')
                .eq('uid', from)
                .single();
            const { data: toData, error: toError } = await supabaseServer
                .from('admit_cards')
                .select('*')
                .eq('uid', to)
                .single();

            if (fromError || toError) {
                console.log('Error Here from to' , fromError , toError)
                res.status(400).end();
                return;
            }


            const { email: toEmail, phone: toPhone } = toData;

            axios.post('https://api.interakt.ai/v1/public/track/users/', {
                userId: from,
                phoneNumber: toPhone,
                countryCode: "+91",
                traits: {
                    "name": toData.name,
                    "email": toEmail,
                    "accept_url": `/${from}/${to}`
                },
                tags: ['Accept']
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
            }).catch((resz) => {
                console.log('Error Here fea',resz.response.data)
                res.status(400).end();
            });

            async function eventCall() {
                axios.post('https://api.interakt.ai/v1/public/track/events/', {
                    userId: from,
                    phoneNumber: toPhone,
                    countryCode: "+91",
                    traits: {
                        "name": toData.name,
                        "email": toEmail,
                        "accept_url": `/${from}/${to}`
                    },
                    event: 'Request',
                    tags: ['Accept']
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
                        console.log('Error Here 1')
                        res.status(400).end();
                    }
                }).catch(() => {
                    console.log('Error Here')
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
        console.log('Error Here last')
        res.status(400).end();
    }
}