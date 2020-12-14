const express = require('express')
const app = express()
const port = 3001
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const stream = fs.createReadStream('./archivos/imagenPrueba.png');
let servers = ['http://192.168.0.15:3000/' , 'http://192.168.0.16:3000/']
let number = 0;

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var imagenPrueba = 'imagenPrueba.png';
const path = require('path');
const multer = require('multer');


let storage = multer.diskStorage({
  destination:(req, file, cb) =>{
      cb(null, './archivos')
  },
  filename:(req, file, cb)=> {
      cb(null, imagenPrueba);
  }
});

const upload = multer({storage})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Subida de una imagen puede ser de otro servidor o desde un cliente
 * Se envia y luego se pide de vuelta
 */
app.post('/subir' , upload.single('file'), (req, res) => {
  console.log(`Subiendo imagen..${req.hostname}/${req.file.path}`);
  if(number != -1){
    sendImage();
    pedirDeVuelta();
    res.send('Intentado enviar imagen y pedir de vuelta...');
  }else {
    res.send('Al menos un servidor esta fallando!!');
  }
  return res.send(req.file);
})


function sendImage() {
  console.log('Peticion a: ' + servers[number]);
  var data = new FormData();
  data.append("myImage", stream);
  fromOtherServer = axios.post(servers[number] + 'subir', data, data.getHeaders())
  .then(function (response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
    number = -1;
  });
}

function pedirDeVuelta(){
  axios.get(servers[number]+'devolver')
  .then(function (response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
    number = -1;
  });
  sum();
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
