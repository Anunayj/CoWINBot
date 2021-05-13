import fetch from "node-fetch";
import EventSource from 'eventsource'
import pEvent from "p-event";
import crypto from "crypto";
import dotenv from 'dotenv';
import { timeout, TimeoutError } from 'promise-timeout';

dotenv.config()
const webhook = new EventSource(process.env.smee);
webhook.reconnectInterval = 0; //reconnect immediatly
console.log('Webhook Client Initialized')


let authToken = "";
const headers = {
  "authority": "cdn-api.co-vin.in",
  "accept": "application/json, text/plain, */*",
  "content-type": "application/json",
  "origin": "https://selfregistration.cowin.gov.in",
  "sec-fetch-site": "cross-site",
  "sec-fetch-mode": "cors",
  "referer": "https://selfregistration.cowin.gov.in/",
  "user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36 OPR/76.0.4017.94"
}


async function refreshAuth(){
  try{
    const response = await fetch('https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP',{ 
      method: 'POST', 
      body: JSON.stringify({ //No idea what the secret thing is tbh.
        "secret": "U2FsdGVkX19SDGJDsFbsaK9ASrugpFhSnALvCzhHMIMYez2Ip7+Eo2lDhhyc8HvC/tL5xHqHVm6JkkxVKLEQDQ==",
        "mobile": process.env.mobile
      }),
      headers: headers,
    })
    let txnId = (await response.json()).txnId
    const request = await timeout(pEvent(webhook, 'message'),180*1000); //Will error out after 180 seconds
    let message = JSON.parse(request.data).body.sms;
    const otp = message.match(/\d{6}/gm)[0];
    console.log(txnId,otp);
    let response2 = await fetch("https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp", {
      "headers": headers,
      "body": JSON.stringify({
        txnId,
        otp: crypto.createHash('sha256').update(otp).digest('hex')
      }),
      "method": "POST",
      "mode": "cors"
    });
    let jason = await response2.json();
    if(jason.token)
      authToken = jason.token;
    console.debug(authToken);
    setTimeout(refreshAuth, 10*60*1000) // 10 minute timeout to refresh token
  }catch(e){
    console.error(e)
    setTimeout(refreshAuth, 5000)
  }
}
await refreshAuth(); //Refresh token initially
