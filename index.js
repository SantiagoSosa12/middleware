const express = require('express')
const app = express()
const port = 3001
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const stream = fs.createReadStream('./archivos/imagenPrueba.png');
let servers = ['http://192.168.0.16:3000/subir' , 'http://192.168.0.15:3000/subir']
let number = 0;

app.get('/', (req, res) => {
  sendImage(res);
})


function sendImage(res) {
  let respuesta = 'ERROR';
  console.log('Peticion a: ' + servers[number]);
  var data = new FormData();
  data.append("myImage", stream);
  let fromOtherServer = axios.post(servers[number], data, data.getHeaders())
  .catch(function (error) {
    console.log('Error ' + error.message)
    console.log(fromOtherServer + ' <-- del servidor');
  })
  sum();
  if(fromOtherServer != null){
    respuesta = 'OK';
  }
  res.send(respuesta);
  return;
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
