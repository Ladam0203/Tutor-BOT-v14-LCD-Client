const http = require('http')
const url = 'http://localhost:80/';

const LCD = require('raspberrypi-liquid-crystal');
const lcd = new LCD( 1, 0x27, 16, 2 );
lcd.beginSync();

const delay = millis => new Promise((resolve, reject) => {
    setTimeout(_ => resolve(), millis)
  });

var status;

lcd.printLineSync(0, 'Uptime:');
lcd.printLineSync(1, "Requesting...");

while (true) {
    getStatus();
    if (status) {
        lcd.printLineSync(0, 'Uptime: ');
        lcd.printLineSync(1, new Date(status.uptime).toISOString().slice(11,19));
    } 
    else {
        lcd.clearSync();
        lcd.printLineSync(0, 'Status: ');
        lcd.printLineSync(1, "Offline");
    }
    delay(1000);
}

setInterval(updateLCD, 1000);

async function updateLCD() {
    getStatus();
    if (status) {
        lcd.printLineSync(0, 'Uptime: ');
        lcd.printLineSync(1, new Date(status.uptime).toISOString().slice(11,19));
    } 
    else {
        lcd.clearSync();
        lcd.printLineSync(0, 'Status: ');
        lcd.printLineSync(1, "Offline");
    }
    //TODO: increment clock, display on LCD
}

/*
function postStatus() {
    const data = JSON.stringify(status);

    const options = {
      protocol: 'http:',
      hostname: 'localhost',
      port: 80,
      path: '/',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
      }
    };


  const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
          data += chunk;
      });

      res.on('end', () => {
          console.log("Status sent: " + data); //DOESNT DISPLAY???
      });

    }).on("error", (err) => {
        console.log("Error: ", err.message);
    });

    console.log("Status sent: " + data);
    req.write(data);
    req.end();
}
*/

function getStatus() {
    http.get(url, (res) => {
        let data = '';

        // called when a data chunk is received.
        res.on('data', (chunk) => {
            data += chunk;
        });

        // called when the complete response is received.
        res.on('end', () => {
            status = JSON.parse(data);
            //console.log("Status received: " + data);
        });

        }).on("error", (err) => {
            console.log("Error: ", err.message);
            status = null;
        });
}