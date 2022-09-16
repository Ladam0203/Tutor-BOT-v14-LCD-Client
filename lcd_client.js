//TODO: exit shuts down lcd screen

const { Console } = require('console');
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

updateLCD();

async function updateLCD() { //TODO: handle disconnect from the server better
    getStatus();
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

async function getStatus() {
    http.get(url, (res) => {
        let data = '';

        // called when a data chunk is received.
        res.on('data', (chunk) => {
            data += chunk;
        });

        // called when the complete response is received.
        res.on('end', async () => {
            status = JSON.parse(data);
            console.log("1. Status received: " + status);
            console.log("2. Got status:" + status);

            if (!status) {
                console.log("3. Status request failed, received: " + status)

                lcd.clearSync();
                lcd.printLineSync(0, 'Status: ');
                lcd.printLineSync(1, "Offline");

                await delay(1000);
            } 

            console.log("3. Status request succesful, received: " + status)

            console.log("4. Parsing status object...")

            let parsedStatus = {
                Status: "Online",
                Uptime: new Date(status.uptime).toISOString().slice(11,19),
                Ping: status.ping + " ms",
                Exceptions: status.exceptions
            }

            console.log("5. Displaying status object...")

            for (property in parsedStatus) {
                lcd.clearSync();
                lcd.printLineSync(0, property + ': ');
                lcd.printLineSync(1, parsedStatus[property]);

                await delay(2000);
            }

            updateLCD();
        });

        }).on("error", (err) => {
            console.log("Error: ", err.message);
            status = undefined;
        });
}

process.on('SIGINT', () => {
    turnOffLCD();
    process.exit(0);
  });

process.on('SIGTERM', () => {
    turnOffLCD();
    process.exit(0);
  });

async function turnOffLCD() {
    console.log("Turning LCD off...")
    LCD.noDisplay();
    console.log("LCD: OFF")
}