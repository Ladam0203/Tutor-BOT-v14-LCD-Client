const { stat } = require('fs');
const http = require('http')
const url = 'http://localhost:80/';

const LCD = require('raspberrypi-liquid-crystal');
const lcd = new LCD( 1, 0x27, 16, 2 );
lcd.beginSync();

var status;
var clock = 0;

lcd.printLineSync(0, 'Uptime:');
lcd.printLineSync(1, clock);


setInterval(updateLCD, 1000);

async function updateLCD() {
    getStatus();
    if (status) {
        lcd.printLineSync(0, 'Uptime: ');
        lcd.printLineSync(1, msToHHMMSS(status.uptime));
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
            console.log("Status received: " + data);
            status = JSON.parse(data);
        });

        }).on("error", (err) => {
            console.log("Error: ", err.message);
        });
}

function msToHHMMSS(milis) {
    return String.format("%02d:%02d:%02d", 
    TimeUnit.MILLISECONDS.toHours(millis),
    TimeUnit.MILLISECONDS.toMinutes(millis) -  
    TimeUnit.HOURS.toMinutes(TimeUnit.MILLISECONDS.toHours(millis)), // The change is in this line
    TimeUnit.MILLISECONDS.toSeconds(millis) - 
    TimeUnit.MINUTES.toSeconds(TimeUnit.MILLISECONDS.toMinutes(millis)));
}