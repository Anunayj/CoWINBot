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

and make a file named `.env` with the following content
```
smee=<smee.io-channel-url>
mobile=<your-mobile-number>
```
# Configuration
WIP
# Running
```
node index.js
```
