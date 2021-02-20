
const fs = require('fs');

NOMBRE_ARCHIVO = "/home/serverone/serverStatus/logger.txt";

function infoServers(){
    let stateServers = lastLine();
    console.log("Ultima linea llamando a: STATESERVER " +  stateServers);
    servers.forEach(function(elemento, indice, array) {
      stateServers += "Servidor numero: " + (indice + 1) + " IP " + servers[indice] + "\n";
    });
    return stateServers;
}

function lastLine(){
    var array = fs.readFileSync(NOMBRE_ARCHIVO).toString().split("\n");
    return array[array.length - 2];
}