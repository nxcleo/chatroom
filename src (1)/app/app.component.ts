import {Component, OnInit} from '@angular/core';
import * as io from 'socket.io-client';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor() {
    this.socket = io.connect();
  }
  username = '';
  messageText: string;
  messages: Array<any> = [];
  socket: SocketIOClient.Socket;

  static s4() {
    return Math.floor((1 + Math.random()) * 0x1000000)
      .toString(16);
  }

  ngOnInit() {
    this.messages = [];
    this.listen2events();
  }

  listen2events() {
    this.socket.on('msg', data => {
      data.id = AppComponent.s4();
      data.audio = null;
      this.messages.push(data);
    });

    this.socket.on('speechComplete', data => {
      for (let i = 0; i < this.messages.length; i++) {
        if (this.messages[i]['id'] === data.id) {
          this.messages[i]['audio'] = data.file;
        }
      }
    });
    console.log('listening started');
  }

  sendMsg() {
    this.socket.emit('newMsg', {name: this.username, msg: this.messageText});
    this.messageText = '';
  }

  reqSpeech(item) {
    this.socket.emit('toSpeech', item);
  }
}
