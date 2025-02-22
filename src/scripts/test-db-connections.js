const { exec } = require('child_process');
const path = require('path');

const script1 = path.join(__dirname, 'test-db-connection.js');
const script2 = path.join(__dirname, 'test-db-connection-2.js');

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando ${scriptPath}:`, error);
        return reject(error);
      }
      console.log(`\nResultado de ${path.basename(scriptPath)}:`);
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

async function runTests() {
  while (true) {
    try {
      await runScript(script1);
      await new Promise(resolve => setTimeout(resolve, 5000));
      await runScript(script2);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error('Error en el ciclo de pruebas:', error);
    }
  }
}

console.log('Iniciando pruebas de conexión...');
runTests(); 