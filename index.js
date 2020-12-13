const express = require('express')
const app = express()
const port = 3001
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const stream = fs.createReadStream('./archivos/imagenPrueba.png');


app.post('/', (req, res) => {
  sendImage(res);
})


function sendImage(res) {
  var data = new FormData();
  data.append("myImage", stream);
  axios.post('http://192.168.0.13:3000/subir', data, data.getHeaders())
  .catch(function (error) {
    console.log('Error ' + error.message)
    res.send('Error')
    return;
  })
  res.send('OK');
}


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
