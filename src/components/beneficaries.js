import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import {Table, TableBody, TableCell, TableHead, TableRow, Button, Checkbox, Typography} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import axios from 'axios'
axios.defaults.baseURL = 'https://cdn-api.co-vin.in/api/v2/';



const style = (theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});


class BenefeciaryTable extends React.Component{
    constructor(props){
        super(props)
        this.handleChange=this.handleChange.bind(this)
        this.getBenefeciaries = this.getBenefeciaries.bind(this)
        this.benefeciaries = [];
        this.error = false;
        this.progress = false;
    }
    getBenefeciaries(){
      this.progress = true;
      axios.get('/appointment/beneficiaries',{
        headers:{
          "Authorization":`Bearer ${this.props.authToken.token}`
        }
      }).then((response) => {
        this.progress = false;
        this.error = false;
        this.benefeciaries = response.data.beneficiaries.map((x) => ({...x,checked:false}));
        this.props.setParentState({
          benefeciaries:this.benefeciaries
        })
      }).catch((err)=>{
        this.progress = false;
        console.log(err)
        this.error = true
      })
    }
    handleChange(event){
        this.benefeciaries.find((element)=>element.beneficiary_reference_id===event.target.name).checked = !this.benefeciaries.find((element)=>element.beneficiary_reference_id===event.target.name).checked
        this.props.setParentState({
          benefeciaries:this.benefeciaries//.slice(0)
        })
    }
    render(){
        const {authToken} = this.props;
        return (
            <div className="box">
            <Button
                fullWidth
                variant="contained"
                color="secondary"
                disabled={authToken.token===""}
                onClick={this.getBenefeciaries}
                >
              Get Benefeciaries 
            </Button>
            {
              this.error
              ? <Typography color="red">Some Error occured while doing that request</Typography>
              : ""
            }
            { this.progress || this.benefeciaries.length 
            ? <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Select</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Birth Year</TableCell>
                    <TableCell>Vaccination Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.progress ? ""
                  : this.benefeciaries.map((row) => (
                    <TableRow key={row.beneficiary_reference_id}>
                      <TableCell><Checkbox color="primary" checked={row.checked} onChange={this.handleChange} name={row.beneficiary_reference_id}/></TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.birth_year}</TableCell>
                      <TableCell>{row.vaccination_status}</TableCell>
                    </TableRow>
                  ))}
                  {this.benefeciaries.length===0 || this.progress
                  ? <TableRow><TableCell colspan={4}><Skeleton/></TableCell></TableRow>
                  : ""
                  }
                </TableBody>
              </Table>
              </>
              : ""
            }
            </div>
          );
    }
}
export default withStyles(style, { withTheme: true })(BenefeciaryTable);