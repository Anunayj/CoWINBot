import fetch, {
  Headers
} from "node-fetch";
import EventSource from 'eventsource'
import pEvent from "p-event";
import crypto from "crypto";
import getSolution from "./solveCaptcha.js";
import config from './config.js';
import {
  timeout,
  TimeoutError
} from 'promise-timeout';
import ora from 'ora';
import prettyMs from 'pretty-ms';
const spinner = ora('Connecting to Smee.io').start();
spinner.color = 'yellow';
const webhook = new EventSource(config.smee);
webhook.reconnectInterval = 0; //reconnect immediatly

let authToken = {
  token: "",
  lastSync: null
};
const headers = {
  "authority": "cdn-api.co-vin.in",
  "accept": "application/json, text/plain, */*",
  "content-type": "application/json",
  "origin": "https://selfregistration.cowin.gov.in",
  "sec-fetch-site": "cross-site",
  "sec-fetch-mode": "cors",
  "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36 OPR/76.0.4017.94"
}


async function refreshAuth() {
  try {
    const response = await fetch('https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP', {
      method: 'POST',
      body: JSON.stringify({ //No idea what the secret thing is tbh.
        "secret": "U2FsdGVkX19SDGJDsFbsaK9ASrugpFhSnALvCzhHMIMYez2Ip7+Eo2lDhhyc8HvC/tL5xHqHVm6JkkxVKLEQDQ==",
        "mobile": config.mobile
      }),
      headers: headers,
    });
    const txnId = (await response.json()).txnId;
    const request = await timeout(pEvent(webhook, 'message'), 180 * 1000); //Will error out after 180 seconds
    const message = JSON.parse(request.data).body.sms;
    const otp = message.match(/\d{6}/gm)[0];
    const response2 = await fetch("https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp", {
      "headers": headers,
      "body": JSON.stringify({
        txnId,
        otp: crypto.createHash('sha256').update(otp).digest('hex')
      }),
      "method": "POST",
      "mode": "cors"
    });
    const jason = await response2.json();
    if (jason.token) {
      authToken.token = jason.token;
      authToken.lastSync = Date.now();
    }
    // console.debug(authToken);
    setTimeout(refreshAuth, 10 * 60 * 1000); // 10 minute timeout to refresh token
  } catch (e) {
    console.error(e);
    setTimeout(refreshAuth, 5000);
  }
}
spinner.text = "Trying to get Authentication Token";
await refreshAuth(); //Refresh token initially
if (authToken.token === "") {
  spinner.fail("Failed to get Authentication token, Check your webhook url and phone number");
  process.exit(1);
} else {
  spinner.color = 'green';
  setInterval((spinner, authToken) => {
    const now = Date.now();
    let elapsed = now - authToken.lastSync;
    let text = prettyMs(elapsed);
    if (elapsed < 15 * 60 * 1000) {
      spinner.color = 'green';
      spinner.text = `Running... | Time Since Last Authentication: ${text}`;
    } else {
      spinner.color = 'red';
      spinner.text = `Auth Token is Expired, Retrying Authentication! | Time Since Last Authentication: ${text}`
    }
  }, 1000, spinner, authToken);
}
async function schedule(preference) {
  const response = await fetch("https://cdn-api.co-vin.in/api/v2/auth/getRecaptcha", {
    "headers": {
      "authorization": `Bearer ${authToken.token}`,
      ...headers
    },
    "body": "{}",
    "method": "POST",
    "mode": "cors"
  });
  const captchaSVG = (await response.json()).captcha;
  let captcha = getSolution(captchaSVG);
  // console.debug(captcha);

  const response2 = await fetch("https://cdn-api.co-vin.in/api/v2/appointment/schedule", {
    "headers": {
      "authorization": `Bearer ${authToken.token}`,
      ...headers
    },
    "body": JSON.stringify({
      ...preference, // preference = {session_id,slot,center_id,beneficiaries[]}
      captcha,
      dose: 1,
    }),
    "method": "POST",
    "mode": "cors"
  });
  let jason = await response2.json();
  if (response2.status !== '200') {
    if (jason.errorCode == "APPOIN0045") throw ("IncorrectCaptcha");
    else throw ("Probably Full");
  };

}


async function main() {
  while (true) {
    try {
      const date = new Date().toJSON().slice(0, 10).split('-').reverse().join('-');
      const response = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${config.district_id}&date=${date}`, {
        "headers": headers,
        "body": null,
        "method": "GET",
        "mode": "cors"
      });
      const data = await response.json();
      const filteredCenters = data.centers.filter((x) => config.preferred_center_ids.includes(x.center_id));
      for (let center of filteredCenters) {
        for (let session of center.sessions)
          session.center_id = center.center_id;
      }
      const filteredSessions = filteredCenters.reduce((accumulator, currentValue) => {
          return (accumulator.concat(currentValue.sessions));
        }, [])
        .filter(x => x.min_age_limit <= config.age &&
          config.vaccine.includes(x.vaccine) &&
          config.preferred_dates.includes(x.date) &&
          x.available_capacity >= config.beneficiaries.length
        )
      for (let slot of config.preferred_slots) {
        for (let i = 0; i < filteredSessions.length; i++) {
          try {
            const session = filteredSessions[i];
            await schedule({
              slot,
              session_id: session.session_id,
              center_id: session.center_id,
              beneficiaries: config.beneficiaries
            })
            spinner.succeed("Successfully Scheduled Appointment!");
            process.exit(0);
          } catch (e) {
            if (e.name === 'IncorrectCaptcha') {
              i -= 1;
            }
            continue;
          }
        }
      }


    } catch (e) {
      console.error(e);
      await new Promise(r => setTimeout(r, 10000));
    }
    await new Promise(r => setTimeout(r, 3000)); 
  }
}
main();
