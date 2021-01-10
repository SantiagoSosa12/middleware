const nodemailer = require("nodemailer");
const express = require('express')
const app = express()
const port = 3001
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const { request } = require('http');

const readLine = require("readline")
NOMBRE_ARCHIVO = "/home/serverone/serverStatus/logger.txt";

var router = express.Router();

var allServerON = true;

var ultimaLineaArchivo;

router.use('/index.pug',express.static('./views'));
app.use('/',router);

router.use('/index2.pug',express.static('./views'));
app.use('/',router);

let servers = ['192.168.0.15' , '192.168.0.16']
let number = 0;

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

var imagenPrueba = 'imagenPrueba.png';
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
  if(allServerON){
    res.send('Intentado enviar imagen y pedir de vuelta...');
    setTimeout(sendImage, 15000, 'Enviada');
    setTimeout(sum ,30000 , 'Cambio Servidor');
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
  console.log("Se enviar correo a: " + toSend)
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
    subject: "Hello ✔", // Subject line
    text: infoToSend, // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
}

function infoServers(){
  var stateServers = lastLine() + "\n";
  servers.forEach(function(elemento, indice, array) {
    stateServers += "Servidor numero: " + (indice + 1) + " IP " + servers[indice] + "\n";
  });
  return stateServers;
}

app.get('/enviarCorreo', (req, res) => {
  var info = infoServers();
  var email = req.url.split("=")[1];
  email = email.replace("%40", "@");
  //sendEmail(email , info).catch(console.error);
  res.send('Revise su correo...');
});


app.get('/', (req, res) => {
  if(allServerON){
    res.render('index');
  }else{
    res.render('index2');
  }
})
 
app.get('/state', (req, res) => {
  res.send(lastLine());
})

app.get('/descargar', (req, res) => {
  res.download(__dirname+'/archivos/imagenPrueba.png' , function(err){
    if(err){
      console.log(err);
    }
  });
})

function lastLine(){
  let result = new Array();
  let lector = readLine.createInterface({
    input: fs.createReadStream(NOMBRE_ARCHIVO),
    output: process.stdout,
    terminal: false
  }).then(() => {
    lector.on('line', linea => {
      console.log(linea);
      result.push(linea);
    });
  })
  .catch(() => {
    console.log('Haz aquello');
  });
  result.forEach(function(elemento, indice, array) {
    console.log("Array: " + elemento +" " + indice);
  });
  console.log("Result es: " + result);
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
