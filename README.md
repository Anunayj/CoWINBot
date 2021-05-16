# CoWINBot
Getting Appointments on CoWin website is next to impossible, this bot will automatically attempt a appointment as soon as there is a vacancy

# Installation

Clone this repo and do
```
npm install
```

## Setting up sms webhook
Create a new channel on https://smee.io/ and copy it's url,
Download the IFTTT Android app and create the following IFTTT recipie:

![ifttt recipie](https://i.ibb.co/Ry4JRhL/ifttt.png)


# Configuration
Rename `config.template.js` to `config.js` and fill it with appropriate details, Example:
```js
    mobile: "9998887771", // No need for country code
    smee:"https://smee.io/<channel>", // add the url you obtained above
    district_id: "123456", //look Below on how to obtain
    beneficiaries: ["999999999990000",], //reference id or ids
    preferred_center_ids: [677760, 744202, 640667], //look Below on how to obtain
    preferred_slots: [ // Order of preference 
        "09:00AM-11:00AM",
        "11:00AM-01:00PM",
        "01:00PM-03:00PM",
        "03:00PM-05:00PM"
    ],
    preferred_dates: ['13-05-2020','14-05-2020','15-05-2020'],
    age: 18,
    vaccine: ["COVAXIN","COVISHIELD"],
    dose: 1 //1 for your first dose and 2 for your second, duh!
```
Find your `distict_id` in this [list](https://gist.github.com/90a7ac6608d318aef0af5284d875b129), and then get the list of center_ids by visting `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=<ENTER distict_id here>&date=<DATE IN DD-MM-YYY format>`, [example url](https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=1&date=13-05-2021).

Use [this](https://jsonformatter.org/json-pretty-print) to beautify the JSON if you are having trouble reading it.


# Running
```
node index.js
```

# Problems

#### Q. I cannot get this to work, I do not understand how to use this, can you help me? 
I do not really plan to provide support, so if you're having trouble getting this to work, your problem. Ask someone else, learn programming.

#### Q. Why don't you just make a easy to use website that does this?
The code does not use any native nodejs, so it can be packaged to work in a browser easily, and I took care that is the case when I wrote this. So if you know how to do it, go ahead and do a PR. 
I personally do not feel like doing it right now, might in future, who knows?

Anyway if someone get's around doing this:
1. svgdom and all the register window stuff can be removed as we're in a browser environment. All other dependencies are browser-compatible. CORS is not a issue since the API responds with `cors: *`
2. For possible issues with scaling (Don't want everyone to spam the API every 3 seconds, when one can do it and tell everyone), It'd be better to host a server that sends a [ServerSentEvent](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) whenever a slot is available. Ofcourse doing that with the current API limits will need a lot of IPs. Alternatively one could implement a system where the peers would broadcast to other peers about available vaccine slots. Ofc that is all considering DDoSing the Server is not something we want. So CoWin Devs if you're out there, why not implement that on your website? will make notification systems much easier, and will drastically reduce the number of requests your server gets.

