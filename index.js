const nodemailer = require("nodemailer");
const cors = require('cors');
const express = require('express')
const app = express()
const port = 3001
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');


app.use(cors());

const { request } = require('http');

const { exec } = require('child_process');

const readLine = require("readline")

var router = express.Router();

var allServerON = true;

var ultimaLineaArchivo;



let servers = ['192.168.0.18' , '192.168.0.12']
let number = 0;

var bodyParser = require('body-parser');



app.use(express.json());

app.use(express.static(path.join(__dirname, '/views')));

var imagenPrueba = 'imagenPrueba.png';
const multer = require('multer');
const { resolve } = require("path");
const { reject } = require("async");


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
  if(allServerON){
    res.send('Intentado enviar imagen y pedir de vuelta...');
    setTimeout(sendImage, 2000, 'Enviada');
    setTimeout(sum ,7000 , 'Cambio Servidor');
  }else {
    res.send('Al menos un servidor esta fallando!! ');
  }
})

/*
Se utiliza cuando nos devulven la imagen que enviamos,
Que debe venir con una frase escrita.
*/
app.post('/subir2' , upload.single('file'), (req, res) => {
  console.log(`Se realizo una peticion para subir imagen.....`);
  return res.send(req.file);
})

function sendImage() {
  console.log('Peticion a: ' + servers[number] + 'subir');
  var stream = fs.createReadStream('./archivos/imagenPrueba.png');
  var data = new FormData();
  data.append('file', stream);/*Son parametros Clave Valor 
   DEBEN SER LOS MISMOS EN EL SERVIDOR DE DESTINO
  */
  var req = request(
  {
    host: servers[number],
    port: '3000',
    path: '/subir',
    method: 'POST',
    headers: data.getHeaders(),
  },
    response => {
    console.log(response.statusCode);
  }).on('error', error => {
    console.log('Hubo un error al conectarse con: ' + servers[number] );
    allServerON = false;
  });
  data.pipe(req);
  
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

async function sendEmail(toSend , infoToSend){
  let testAccount = await nodemailer.createTestAccount();
  console.log("Se envia correo a: " + toSend);
  console.log("La informacion enviada por correo es: " + infoToSend);
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: 'sosa122009@gmail.com', // generated ethereal user
      pass: 'mxvmnfjiydgiagbm', // generated ethereal password
    },
  });
  let info = await transporter.sendMail({
    from: '<Middleware>', // sender address
    to: toSend, // list of receivers
    subject: "Fail Servers", // Subject line
    text: infoToSend
  });

  console.log("Message sent: %s", info.messageId);
}


app.get('/enviarCorreo', (req, res) => {
  if( ! allServerON){
    var info = infoServers();
    var email = req.url.split("=")[1];
    email = email.replace("%40", "@");
    sendEmail(email , info).catch(console.error);
    res.send('Alerta enviada');
  }else {
    res.send('Parece que los servidores estan funcionando ALERTA NO ENVIADA...');
  }
});


app.get('/', (req, res) => {
  
})
 
app.get('/stateServers', (req, res) => {
  stateS = "Server 1 " + servers[0] + " Server 2 "+ servers[1] 
  + " Estado: "+lastLine("/home/serverone/serverStatus/logger.txt");
  res.send(stateS);
})

app.get('/descargar', (req, res) => {
  res.download(__dirname+'/archivos/imagenPrueba.png' , function(err){
    if(err){
      console.log(err);
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})

function infoServers(){
  let stateServers = lastLine("/home/serverone/serverStatus/logger.txt");
  console.log("Ultima linea llamando a: STATESERVER " +  stateServers);
  servers.forEach(function(elemento, indice, array) {
    stateServers += "Servidor numero: " + (indice + 1) + " IP " + servers[indice] + "\n";
  });
  console.log(stateServers);
  document.getElementById("demo").innerHTML = stateServers;
  return stateServers;
}

function lastLine(toRead){
  var array = fs.readFileSync(toRead).toString().split("\n");
  return array[array.length - 2];
}

app.get('/createVirtualM', (req, res) => {
  createVirtualM();
  setTimeout(searchIP, 100000 , 'Se busca IP');
  setTimeout(changeServer, 170000 , 'Se cambia servidor');
  res.send('creando maquina virtual...');
})

function createVirtualM(){
  console.log('Se esta creando una nueva MV');
  var childProcess = exec('sh /home/serverone/nuevasip/createvirtualm.sh');
  childProcess.stderr.on('data', data => console.error(data));
  childProcess.stdout.on('data', data => console.log(data));
}

function searchIP(){
  var childProcess = exec('sh /home/serverone/nuevasip/newsips.sh');
  childProcess.stderr.on('data', data => console.error(data));
  childProcess.stdout.on('data', data => console.log(data));
}

function changeServer(){
  let lastIp = lastLine("/home/serverone/nuevasip/test.txt");
  console.log("la nueva ip es: " + lastIp);
  if(lastIp != "NO IP"){
    servers[number] = lastIp;
  }
  return lastIp;
}