import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import {Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button, Checkbox, Typography, Grid, Select, MenuItem} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import axios from 'axios'
import moment from 'moment'
axios.defaults.baseURL = 'https://cdn-api.co-vin.in/api/v2/';



const style = (theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  container: {
    maxHeight: 440,
  },
  grid:{
    padding:'1rem'
  }
    
  

});


class CenterSelector extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            stateList:[],
            cityList:[],
            state:0,
            city:0
        }
        this.handleChange=this.handleChange.bind(this)
        this.getCenters=this.getCenters.bind(this)
        this.centers = []
        this.error = false;
        this.progress = false;
        axios.get('/admin/location/states').then(function (response){
          this.setState({
            stateList:response.data.states,
          })
        }.bind(this))
    }
    getCenters(){
      this.progress = true;
      axios.get('/appointment/sessions/calendarByDistrict',{
        params:{
          district_id:this.state.city,
          date:moment().format("DD-MM-YYYY")
        }
      }).then((response) => {
        this.progress = false;
        this.error = false;
        this.centers = response.data.centers.map((x) => ({...x,checked:false}));
        this.props.setParentState({
            centers:this.centers
        })
      }).catch((err)=>{
        this.progress = false;
        console.log(err)
        this.error = true
      })
    }
    handleChange(event){
        /* eslint eqeqeq: "off" -- Why cast when you can loosley compare */
        this.centers.find((element)=>element.center_id==event.target.name).checked = !this.centers.find((element)=>element.center_id==event.target.name).checked
        this.props.setParentState({
            centers:this.centers//.slice(0)
        })
    }
    render(){
      let {classes} = this.props;
        return (
            <div className="box">
              <Grid container 
              direction="row"   
              justify="center"
              alignItems="center" 
              spacing={1}
              className={classes.grid}>
              <Grid item>
                <Select
                    label="State"
                    labelId="state"
                    id="state"
                    value={this.state.state}
                    onChange={function(event){
                      this.setState({
                        state:event.target.value
                      })
                      axios.get(`/admin/location/districts/${event.target.value}`).then(function(response){
                        this.setState({
                          cityList:response.data.districts,
                          city:0
                        })
                      }.bind(this))
                    }.bind(this)}
                  >
                    <MenuItem value={0} disabled>Select State</MenuItem>
                    {
                      this.state.stateList.map((item) => (
                        <MenuItem value={item.state_id} key={item.state_id}>{item.state_name}</MenuItem>
                      ))
                    }
                </Select>
               </Grid>
               <Grid item>
                <Select
                    label="City"
                    labelId="city"
                    id="city"
                    value={this.state.city}
                    onChange={function(event){
                      this.setState({
                        city:event.target.value
                      })
                    }.bind(this)}
                  >
                    <MenuItem value={0} disabled>Select City</MenuItem>
                    {
                      this.state.cityList.map((item) => (
                        <MenuItem value={item.district_id} key={item.district_id}>{item.district_name}</MenuItem>
                      ))
                    }
                </Select>
               </Grid>
               <Grid item>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={this.getCenters}
                    disabled={this.state.city===0}
                    >
                  Get Centers 
                </Button>
                </Grid>
              </Grid>
            
            {
              this.error
              ? <Typography color="red">Some Error occured while doing that request</Typography>
              : ""
            }
            { this.progress || this.centers.length
            ? <>
            <TableContainer className={classes.container}>
              <Table stickyHeader  size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Select</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Vaccine</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.progress ? ""
                  : this.centers.map((row) => (
                    <TableRow key={row.center_id}>
                      <TableCell><Checkbox color="primary" checked={row.checked} onChange={this.handleChange} name={row.center_id}/></TableCell>
                      <TableCell>{row.name}, {row.address} ({row.pincode})</TableCell>
                      <TableCell>{row.sessions[0].vaccine}</TableCell>

                    </TableRow>
                  ))}
                  {this.centers.length===0 || this.progress
                  ? <TableRow><TableCell colspan={3}><Skeleton/></TableCell></TableRow>
                  : ""
                  }
                </TableBody>
              </Table>
              </TableContainer>
              </>
              : ""
            }
            </div>
          );
    }
}
export default withStyles(style, { withTheme: true })(CenterSelector);