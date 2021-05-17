import axios from 'axios';
import EventEmitter from 'events';

axios.defaults.baseURL = 'https://cdn-api.co-vin.in/api/v2/';

function getTommorowDate(){
    const currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const date = day.toString().padStart(2,0) + "-" + month.toString().padStart(2,0) + "-" + year;
    return date;
}

export default class VacancyEmitter extends EventEmitter{
    constructor(config = {
        district_id: '312',
        age : 46,
        dose : 1,
        preferred_center_ids: [642147],
        minSlots : 1
    }){
        super();
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
                        date: getTommorowDate()
                }})
                const filteredSessions = response.data.sessions
                .filter(x => x.min_age_limit <= this.config.age &&
                    x[`available_capacity_dose${this.config.dose}`] >= this.config.minSlots &&
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