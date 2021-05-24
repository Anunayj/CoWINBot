import './App.css';
import React from 'react'
import Copyright from './components/copyright';
import AuthForm from './components/authForm'
import solveCaptcha from './solveCaptcha';
import AuthHandler from './refreshAuth';
import VacancyEmitter from './vacancyEmitter';
import axios from 'axios';
axios.defaults.baseURL = 'https://cdn-api.co-vin.in/api/v2/';

// let auth = new AuthHandler(mobile,smee);
// auth.start();
// auth.on('auth',console.log)


// let vacancy = new VacancyEmitter()
// vacancy.setFilter(config) // Sometimes I feel typescript really is nice, though can't be bothered using it for such a small project
// vacancy.on('event',console.log);
// vacancy.start();

//const solution = solveCaptcha(svg)

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      isRunning : false,
      authToken: {
        token: "",
        lastSync: null
      }
    }
    this.handleLogin = this.handleLogin.bind(this);
  }


  handleLogin(event){
    event.preventDefault();
    if(this.state.isRunning){
      this.auth.stop();
      this.setState({isRunning:false})
    }else{
      this.setState({isRunning:true})
      this.auth = new AuthHandler(event.target.mobile.value,event.target.smee.value);
      this.auth.on('auth', function (authToken){
        this.setState({
          authToken
        })
      }.bind(this))
      this.auth.start();
    }
      
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">   
          <AuthForm onSubmit ={this.handleLogin}
          isRunning={this.state.isRunning}
          authToken={this.state.authToken}
          />
          <Copyright />
        </header>
      </div>
    );
  }
}

export default App;
