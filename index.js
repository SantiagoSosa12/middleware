const nodemailer = require("nodemailer");
const express = require('express')
const app = express()
const port = 3001
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

var router = express.Router();
router.use('/index.pug',express.static('./views'));
app.use('/',router);

let servers = ['http://192.168.0.15:3000/' , 'http://192.168.0.16:3000/']
let number = 0;

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
app.post('/subir' , upload.single('imagen'), (req, res) => {
  console.log(`Subiendo imagen..${req.hostname}/${req.file.path}`);
  if(number != -1){
    res.send('Intentado enviar imagen y pedir de vuelta...');
    setTimeout(sendImage, 20000, 'Enviada');
    setTimeout(sum ,20000 , 'Cambio Servidor');
  }else {
    sendEmail();
    res.send('Al menos un servidor esta fallando!! Se enviara un correo a sosa122009@gmail.com');
  }
})

app.post('/subir2' , upload.single('file'), (req, res) => {
  console.log(`Subiendo imagen.. sin reenvio!! ${req.hostname}/${req.file.path}`);
})

function sendImage() {
  console.log('Peticion a: ' + servers[number] + 'subir');
  var stream = fs.createReadStream('./archivos/imagenPrueba.png');
  let data = new FormData();
  data.append("file", stream);
  axios.post(servers[number] + 'subir', data, data.getHeaders())
  .then(function (response) {
    console.log('Recibiendo respuesta del servidor: ' + servers[number] + ' Imagen enviada');
  })
  .catch(function(error) {
    console.log(error);
    number = -1;
  });
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

async function sendEmail(){
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: 'sosa122009@gmail.com', // generated ethereal user
      pass: 'mxvmnfjiydgiagbm', // generated ethereal password
    },
  });
  await transporter.sendMail({
    from: '"From Middleware 👻" <middleware@gmail.com>', 
    to: "sosa122009@gmail.com", 
    subject: "Fail", 
    text: "Un servidor esta fallando", 
    html: "<b>Por favor revise el estado de sus servidores</b>", 
  });
}

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/descargar', (req, res) => {
  res.download(__dirname+'/archivos/imagenPrueba.png' , function(err){
    if(err){
      console.log(err);
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
