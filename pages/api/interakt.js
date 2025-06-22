const axios = require('axios');
export default async function LoginHandler(req, res) {

    if (req.method === "POST") {

        const body = req.body;

        console.log(req.body)
        axios.post('https://api.interakt.ai/v1/public/track/users/', {

            userId: req.body.userId,

            phoneNumber: req.body.phoneNumber,
            countryCode: "+91",
            traits: {
                "name": req.body.name,
                "email": req.body.email
            },
            tags: [req.body.tag]

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
                console.log(reso.data)
            }

        }).catch((reso) => {

            res.status(400).end()
        })

        async function eventCall() {


            axios.post('https://api.interakt.ai/v1/public/track/events/', {

                userId: req.body.userId,

                phoneNumber: req.body.phoneNumber,
                countryCode: "+91",
                traits: {
                    "name": req.body.name,
                    "email": req.body.email
                },
                event: req.body.event,
                tags: [req.body.tag]

            }, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Basic Y3lVZkhzUG9hbkowX2tPS3JqWkVvZllxYWZpNnJxX3FySWQ2b1VUODczUTo="
                }
            }).then(reso => {

                if (reso.data.result) {
                    console.log('secondcall', reso.data)
                    res.status(200).end();
                } else {
                    res.status(400).end()
                }

            }).catch((reso) => {

                res.status(400).end();
            })

        }


    } else if (req.method === "GET") {
        res.status(200).json({ main: 'something' });
    } else {}
}