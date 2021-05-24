import {Box, Typography, Link,} from '@material-ui/core';

export default function Copyright() {
    return (
    <Box mt={8}>
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href="https://github.com/Anunayj">
          Anunay
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </Box> 
    );
  }