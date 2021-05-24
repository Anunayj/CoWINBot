import React from 'react'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import {Button, TextField, Paper, Typography, Avatar, CssBaseline, CircularProgress} from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import prettyMs from 'pretty-ms';
import axios from 'axios';

const style = (theme) => ({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    form: {
      width: '100%', 
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  });

function timeSince(lastSync){
    const now = Date.now();
    let elapsed = now - lastSync;
    let text = prettyMs(elapsed);
    return text
}

class AuthForm extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            mobile: "",
            smee: "",
            time: "",
            otp: ""
        };
        this.onInputchange = this.onInputchange.bind(this);
        this.manualOTP = this.manualOTP.bind(this)
    }
    componentDidMount(){
        axios.head('https://smee.io/new').then((response) => {
            this.setState({
                smee: response.request.responseURL,
            })    
        })
        setInterval(function (){
            this.setState({
                time : this.props.authToken.lastSync 
                ? `Time since last authentication : ${timeSince(this.props.authToken.lastSync)}` //color this idk
                : <div>Trying to get OTP <CircularProgress color="secondary" size="1em"/></div>,
            })
        }.bind(this),1000)
    }
    onInputchange(event) {
        this.setState({
          [event.target.name]: event.target.value
        });
      }
    manualOTP(){
        console.log(this.props.webhook);
        this.props.webhook.emit('otp',this.state.otp)
        this.setState({
            otp:""
        })
    }
    render() {
        const { classes , onSubmit, isRunning, webhook} = this.props;
        return (
            <Paper className="box" component="main" elevation={3}>
              <CssBaseline />
              <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Authentication
                </Typography>
                <form className={classes.form} onSubmit={onSubmit}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="mobile"
                    label="Mobile Number"
                    name="mobile"
                    autoComplete="mobile"
                    autoFocus
                    inputProps={{
                      pattern:'\\d{10}',
                    }}
                    value={this.state.mobile}
                    onChange={this.onInputchange}
                    disabled={isRunning}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="smee"
                    label="Smee.io URL"
                    type="url "
                    id="smee"
                    autoComplete="smee"
                    value={this.state.smee}
                    onChange={this.onInputchange}
                    disabled={isRunning}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color={isRunning ? "secondary" : "primary"}
                    className={classes.submit}
                  >
                    {isRunning 
                    ? <div><CircularProgress size="1em"/> Stop</div>
                    : "Sign In"}
                  </Button>
                </form>
                <Typography style={{alignSelf: "flex-start"}} variant="overline">
                {
                    isRunning
                    ? this.state.time
                    : ""
                }
                </Typography>
                <div style={{alignSelf: "flex-start"}}>
                {
                    webhook
                    ?  <TextField
                    id="otp"
                    name="otp"
                    label="Manual OTP"
                    onChange={this.onInputchange}
                    value={this.state.otp}
                    InputProps={{endAdornment: <Button size="large" onClick={this.manualOTP}>➤</Button>}}
                  />
                    : ""
                }
                </div>
              </div>
            </Paper>
          );
    }
}
export default withStyles(style, { withTheme: true })(AuthForm);