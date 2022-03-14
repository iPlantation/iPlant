const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var path = require('path');


var plantName, minHumidity, isLightning, lightColor, lightStart, lightTime, humidity, lastWatering
var hour
var hourHumidities = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
  io.emit('getServer', value)
});

app.get('/arduino', (req, res) => {
  humidity = req.query.humidity
  lastWatering = req.query.lastWatering
  io.emit('UpdateInfos', req.query)
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end('{"succes": "true"}');
});

io.on('connection', (socket) => {

    socket.on('postClient', (value) => {
      console.log(value)
      plantName = value.plantName
      minHumidity = value.minHumidity
      isLightning = value.isLightning
      if(isLightning == 'true'){
        lightColor = value.lightColor
        lightStart = value.startLight
        lightTime = value.timeLight
      }else{
        lightColor = ""
        lightStart = ""
        lightTime = ""
      }
      console.log(plantName, minHumidity, isLightning, lightColor, lightStart, lightTime)
      io.emit('getServer', value)
    });
    
    socket.on('GetInfo', (value) =>{
      var data = {
        'plantName':plantName,
        'minHumidity':minHumidity,
        'isLightning':isLightning,
        'lightColor':lightColor,
        'lightStart':lightStart,
        'lightTime':lightTime,
      }
      var data2 = {
        'humidity':humidity,
        'lastWatering':lastWatering
      }
      io.emit('UpdateInfos', data2)
      io.emit('getServer', data)
    })

    socket.on('HourUpdate', (value) =>{
      var heures = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]

      derniereHeure = (heure, nombre)=>{
          var hour = heures.indexOf(heure)+23
          var array = []
          var nombreAMontrer = 0
          for(i=hour; i>0; i--){
              if(nombre > nombreAMontrer){
                  array.push(heures[i])
                  nombreAMontrer++
              }
          }
          return array
      }
      const d = new Date();
      let actualHour = d.getHours();
      hour = derniereHeure(actualHour.toString(), 12)
      hour = hour.reverse();
      hourHumidities.shift()
      hourHumidities.push(value)
      var data = {
        'hour':hour,
        'hourHumidities':hourHumidities,
      }
      io.emit('updateCharts', data)

    })

});
server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000')
});

