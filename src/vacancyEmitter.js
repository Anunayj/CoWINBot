import axios from 'axios';
import EventEmitter from 'events';
import moment from 'moment'
axios.defaults.baseURL = 'https://cdn-api.co-vin.in/api/v2/';


export default class VacancyEmitter extends EventEmitter{
    constructor(config = {
        district_id: '312',
        minAge : 46,
        dose : [1,2],
        preferred_center_ids: [642147],
        date : moment().format('DD-MM-YYYY')
    }){
        super();
        console.log(config)
        this.config = config;
        this.state = {
            isActive: false,
            shouldBeActive: false
        }
    }

    setFilter(config){
        this.config = config;
    }
    start(){
        this.state.shouldBeActive = true;
        if(!this.state.isActive)
            this.loop();
    }
    stop(){
        this.state.shouldBeActive = false;
    }
    async loop() {
        while (this.state.shouldBeActive) {
            this.state.isActive = true;
            try {
                let response = await axios.get('/appointment/sessions/public/findByDistrict', {
                    params: {
                        district_id: this.config.district_id,
                        date: this.config.date
                }})
                const filteredSessions = response.data.sessions
                .filter(x => x.min_age_limit <= this.config.minAge &&
                    // (x[`available_capacity_dose${this.config.dose}`] >= 1) &&
                    this.config.dose.reduce((accum,current) => accum || (x[`available_capacity_dose${current}`] >= 1),false) && 
                    this.config.preferred_center_ids.includes(x.center_id)
                )
                if(filteredSessions.length > 0){
                    this.emit('event',filteredSessions);
                }
                    
            } catch (e) {
                console.error(e);
                await new Promise(r => setTimeout(r, 10000)); //Probably hit ratelimit for some reason
            }
            await new Promise(r => setTimeout(r, 3100));
            }
            this.state.isActive = false;
    }

}