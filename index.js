const express = require('express')
const app = express()
const port = 3001
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const stream = fs.createReadStream('./archivos/imagenPrueba.png');
const servers = ['http://192.168.0.16:3000/subir' , 'http://192.168.0.15:3000/subir']
const number = 0;

app.get('/', (req, res) => {
  sendImage(res);
})


function sendImage(res) {
  var data = new FormData();
  data.append("myImage", stream);
  axios.post(servers[number], data, data.getHeaders())
  .catch(function (error) {
    console.log('Error ' + error.message)
    res.send('Error')
    return;
  })
  sum();
  res.send('OK');
}
/**
 * Suma uno a la variable number
 */
function sum(){
  number++
  if(number >= servers.length){
    number = 0;
  }
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
