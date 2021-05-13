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
    vaccine: ["COVAXIN","COVISHIELD"]
```
Find your `distict_id` in this [list](https://gist.github.com/90a7ac6608d318aef0af5284d875b129), and then get the list of center_ids by visting `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=<ENTER distict_id here>&date=<DATE IN DD-MM-YYY format>`, [example url](https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=1&date=13-05-2021).

Use [this](https://jsonformatter.org/json-pretty-print) to beautify the JSON if you are having trouble reading it.


# Running
```
node index.js
```
