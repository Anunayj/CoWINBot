import './App.css';
import React from 'react'
import Copyright from './components/copyright';
import AuthForm from './components/authForm'
import Benefeciaries from './components/beneficaries'
import CenterSelector from './components/centers'
import {Grid, TextField, Button, CircularProgress}from '@material-ui/core';
import solveCaptcha from './solveCaptcha';
import AuthHandler from './refreshAuth';
import VacancyEmitter from './vacancyEmitter';
import axios from 'axios';
import moment from 'moment';
axios.defaults.baseURL = 'https://cdn-api.co-vin.in/api/v2/';




//const solution = solveCaptcha(svg)

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      isRunning:false,
      isAuthRunning : false,
      authToken: {
        token: "",
        lastSync: null
      },
      webhook: null,
      benefeciaries: [],
      centers:[],
      city:0,
      date:null
    }
    this.handleLogin = this.handleLogin.bind(this);
    this.setParentState = this.setState.bind(this);
    this.handleRunning = this.handleRunning.bind(this);
    this.handleAppointment = this.handleAppointment.bind(this);
    this.vacancy = null;
  }

  async handleAppointment(filteredSessions){
    for(let benefeciary of this.benefeciaries.filter((e)=> e.checked)){
      const dose = benefeciary.vaccination_status === "Not Vaccinated" ? 1 : 2;
      let userdata ={
        slot:"11:00AM-01:00PM", //ask user for preference idk?
        beneficiaries:[benefeciary.beneficiary_reference_id],
        dose
      }
      for(let x=0;x<filteredSessions.length;x++){
        if(parseInt(new Date().getFullYear()) - parseInt(benefeciary.birth_year) < filteredSessions[x].min_age_limit)
          continue;
        if(filteredSessions[x][[`available_capacity_dose${dose}`]] < 1)
          continue;
        try{
          //getCaptcha
          const response = await axios.post("/auth/getRecaptcha",{
            headers:{
              "Authorization":`Bearer ${this.props.authToken.token}`
            }
          })
          const captchaSVG = response.data.captcha;
          const captcha = solveCaptcha(captchaSVG);
          //Schedule
          const response2 = await axios.post("/appointment/schedule",{
            ...userdata, // preference = {slot,beneficiaries[],dose}
            session_id:filteredSessions[x].session_id,
            center_id:filteredSessions[x].center_id,
            captcha,
          },
          {
            headers:{
              "Authorization":`Bearer ${this.props.authToken.token}`
            }
          })
          alert('Scheduled appointment!')
          //update this.benefeciaries
          let newBenefeciaries = this.benefeciaries.slice(0);
          const index = newBenefeciaries.findIndex(e => e.beneficiary_reference_id === benefeciary.beneficiary_reference_id);
          newBenefeciaries[index].checked = false;
          this.setState({
            beneficiaries:newBenefeciaries
          })
          break; //if all procceeds with no errors then break ig? add success stuff too
        }catch(e){
          console.error(e)
          //retry?
        }
      }
    }
    if(this.benefeciaries.filter((e)=> e.checked).length===0){
      alert("Completed all appointments Whatever")
      this.handleRunning(); //stop 
    }
  }
  handleLogin(event){
    event.preventDefault();
    if(this.state.isAuthRunning){
      this.setState({
        webhook:null
      })
      this.auth.stop();
      this.setState({isAuthRunning:false})
    }else{
      this.setState({isAuthRunning:true})
      this.auth = new AuthHandler(event.target.mobile.value,event.target.smee.value);
      this.auth.on('auth', function (authToken){
        this.setState({
          authToken
        })
      }.bind(this))
      this.setState({
        webhook:this.auth.getWebhook()
      })
      this.auth.start();
    }
      
  }
  handleRunning(){
    if(this.state.isRunning){
      this.vacancy.stop();

    }else{
      let minAge = Math.max(...this.state.benefeciaries.filter((e)=> e.checked).map(e => parseInt(new Date().getFullYear()) - parseInt(e.birth_year)),0)
      let dose = new Set();
      for(let b of this.state.benefeciaries){
        if(b.vaccination_status === "Not Vaccinated")
          dose.add(1)
        else if(b.vaccination_status === "Partially Vaccinated")
          dose.add(2)
      }
      const config = {
        district_id:this.state.city,
        minAge,
        dose:Array.from(dose),
        preferred_center_ids:this.state.centers.filter((e)=> e.checked).map(e=>e.center_id),
        date:this.state.date
      }
      this.vacancy = new VacancyEmitter(config)
      this.vacancy.on('event',this.handleAppointment);
      this.vacancy.start(); 
      
    }
    this.setState({
      isRunning : !this.state.isRunning
    })

  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
    
          <AuthForm onSubmit ={this.handleLogin}
          isRunning={this.state.isAuthRunning}
          authToken={this.state.authToken}
          webhook={this.state.webhook}
          />
          <Benefeciaries
          authToken={this.state.authToken}
          benefeciaries={this.state.benefeciaries}
          setParentState={this.setParentState}
          />
          <CenterSelector
          benefeciaries={this.state.benefeciaries}
          setParentState={this.setParentState}
          />
          <div className="box">
            <Grid container
            direction="row"   
            justify="center"
            alignItems="center" 
            spacing={1}
            
            >
            <Grid item>
            <TextField
              id="date"
              label="Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={function(event){
                let date = moment(event.target.value).format('DD-MM-YYYY');
                if(date==="Invalid date")
                  date = null;
                this.setState({
                  date: date
                })
              }.bind(this)
              }
            />
            </Grid>
            <Grid item>
            <Button
                fullWidth
                variant="contained"
                color={this.isRunning ? "primary" : "secondary"}
                disabled={this.state.authToken.token==="" || this.state.city===0 || !this.state.date}
                onClick={this.handleRunning}
                >
              {
                this.state.isRunning
                ? <>Stop <CircularProgress color="primary" size="1em"/></>
                : "Start"
              }
            </Button>
            </Grid>
          </Grid>
          </div>


          <Copyright />
        </header>
      </div>
    );
  }
}

export default App;
