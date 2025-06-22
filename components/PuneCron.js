import { forwardRef, useImperativeHandle } from "react";

const PuneCron = forwardRef((props,ref) =>{

    useImperativeHandle(ref, (data) => ({
        cronberryTrigger 
      }));

    function cronberryTrigger(username, u_email, u_mobile, u_year, u_city, linke) {

      
          
      
        var id = Date.now();
        var data = JSON.stringify({
            "projectKey": "VW50aXRsZSBQcm9qZWN0MTY1MDAxMzUxMDU5MQ==",
            "audienceId": id,
            "name": username,
            "email": u_email,
            "mobile": u_mobile,
            "ios_fcm_token": "",
            "web_fcm_token": "",
            "android_fcm_token": "",
            "profile_path": "",
            "active": "",
            "audience_id": "",
            "paramList": [{
                    "paramKey": "source",
                    "paramValue": ""
                },
                {
                    "paramKey": "city",
                    "paramValue": u_city
                },
                {
                    "paramKey": "postcode",
                    "paramValue": ""
                },
                {
                    "paramKey": "total_amount",
                    "paramValue": ""
                },
                {
                    "paramKey": "abondon_cart",
                    "paramValue": true
                },
                {
                    "paramKey": "preparing_for_which_year",
                    "paramValue": u_year
                },
                {
                    "paramKey": "subject",
                    "paramValue": ""
                },
                {
                    "paramKey": "formurl",
                    "paramValue": linke
                },
                {
                    "paramKey": "formname",
                    "paramValue": props?.source || "Pune Landing Page"
                }
            ]
        });
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function() {
      
            if (this.readyState === 4) {
                
               props.onComplete()
      
            }
        });
        xhr.open("POST", "https://api.cronberry.com/cronberry/api/campaign/register-audience-data");
        xhr.setRequestHeader("Content-Type", "application/json");
      
      
        xhr.send(data);
      }

      return <div></div>
})

export default PuneCron;