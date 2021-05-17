import axios from 'axios';
import crypto from 'crypto'
import pEvent from "p-event";
import { timeout } from 'promise-timeout';

axios.defaults.baseURL = 'https://cdn-api.co-vin.in/api/v2/';

export default class Auth{
  constructor(mobile, smee){
    this.mobile = mobile;
    this.webhook = new EventSource(smee);
    this.authToken = {
      token: "",
      lastSync: null
    };
    this.active = false;
  }

  getToken(){
    return this.authToken;
  }

  async start(){
    this.active = true;
    await this.refreshAuth();
  }
  async stop(){
    this.active = false;
  }
  async refreshAuth() {
    while(this.active){
        try {
          console.debug("Trying Authentication!")
          const response = await axios.post('/auth/generateMobileOTP',
          {
            secret: "U2FsdGVkX19SDGJDsFbsaK9ASrugpFhSnALvCzhHMIMYez2Ip7+Eo2lDhhyc8HvC/tL5xHqHVm6JkkxVKLEQDQ==",
            mobile: this.mobile,
          })
          const txnId = response.data.txnId;
          const request = await timeout(pEvent(this.webhook, 'message'), 180 * 1000); //Will error out after 180 seconds
          const message = JSON.parse(request.data).body.sms;
          const otp = message.match(/\d{6}/gm)[0];
          const response2= await axios.post('/auth/validateMobileOtp',{
              txnId,
              otp: crypto.createHash('sha256').update(otp).digest('hex')
          })
          if (response2.data.token) {
            this.authToken.token = response2.data.token
            this.authToken.lastSync = Date.now();
          }
          console.debug(this.authToken);
          await new Promise(r => setTimeout(r, 10*60*1000)); // 10 Minutes
        } catch (e) {
          console.error(e);
          await new Promise(r => setTimeout(r, 5000));
        }
    }
  }






}