const app = require('express')();
const express = require('express');
const path = require('path');
const server = require('http').Server(app);
const fs = require("fs");
const io = require("socket.io")(server);
const md5 = require('md5');


const textToSpeech = require("@google-cloud/text-to-speech");
const client = new textToSpeech.TextToSpeechClient();

// $env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\nxcle\OneDrive\Documents\node projects\chatapp\FIT2095-85a2a70cbf8f.json"




let port = 8080;

app.use("/", express.static(path.join(__dirname, "dist/chatapp")));


io.on("connection", socket => {
  console.log("new connection made from client with ID="+socket.id);

  socket.on("newMsg", data => {
    console.log(data, getCurrentDate());
    io.sockets.emit("msg", { msg: data.msg, name: data.name, timeStamp: getCurrentDate() });
  });

  socket.on("toSpeech", data=> {
    console.log("Converting to speech: ", data.msg);
    let hash = md5(data.msg);
    if (!fs.existsSync(path.join(__dirname, "dist/chatapp/mp3/" + hash + '.mp3'))) {
      let request = {
        input: { text: data.msg },
        // Select the language and SSML Voice Gender (optional)
        voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
        // Select the type of audio encoding
        audioConfig: { audioEncoding: "MP3" },
      };

      client.synthesizeSpeech(request, (err, response) => {
        if (err) {
          console.error("ERROR:", err);
          return;
        }
        fs.writeFile(path.join(__dirname, "dist/chatapp/mp3/" + hash + '.mp3'), response.audioContent, "binary", err => {
          if (err) {
            console.error("ERROR:", err);
            return;
          }
          console.log("Audio content written to file: " + hash + '.mp3');
          socket.emit('speechComplete', {id: data.id, file: "mp3/" + hash + '.mp3'})
        });
      });
    }
    else {
      console.log('Existing file dectected');
      socket.emit('speechComplete', {id: data.id, file: "mp3/" + hash + '.mp3'})
    }


  });

});


server.listen(port, () => {
  console.log("Listening on port " + port);
});


function getCurrentDate() {
  let d = new Date();
  return d.toLocaleString();
}
