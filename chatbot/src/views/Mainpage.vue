<template>
  <div>
    <br />
    <br />
    <br />
    <List header="机器人聊天框" footer="欢迎您的使用" border size="small">
      <ListItem v-for="(item,index) in chatmessage" :key="index">{{item}}</ListItem>
    </List>
    <Input
      v-model="value"
      placeholder="请问您有什么想说的?"
      style="width: 200px"
      @on-enter="SendMsgtoServer"
    />
    <Button type="primary" @click="SendMsgtoServer">提交信息</Button>
    <div id="controls">
      <Button id="recordButton" @click="startRecording">Record</Button>
      <Button id="stopButton" @click="stopRecording">Stop</Button>
    </div>
  </div>
</template>
<script>
//webkitURL is deprecated but nevertheless
// URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia()
var rec;
//Recorder.js object
var input;
//MediaStreamAudioSourceNode we'll be recording
// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
//new audio context to help us record
export default {
  data() {
    return {
      sessionID: "",
      value: "",
      chatmessage: ["This is a piece of text A.", "This is a piece of text B."]
    };
  },
  methods: {
    SendMsgtoServer() {
      this.$socket.emit("chat message", {
        msg: this.value,
        sessionID: this.sessionID
      });
      this.chatmessage.push(this.value);
      this.value = null;
    },
    startRecording() {
      // console.log("录音开始");
      var constraints = {
        audio: true,
        video: false
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          // console.log(
          //   "getUserMedia() success, stream created, initializing Recorder.js ..."
          // );
          /* assign to gumStream for later use */
          gumStream = stream;
          /* use the stream */
          input = audioContext.createMediaStreamSource(stream);
          /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
          rec = new this.$recorderjs(input, {
            numChannels: 1
          });
          //start the recording process
          rec.record();
          // console.log("Recording started");
        })
        .catch(function(err) {
          //enable the record button if getUserMedia() fails
          // recordButton.disabled = false;
          // stopButton.disabled = true;
          // pauseButton.disabled = true;
          throw err;
        });
    },
    createDownloadLink(blob) {
      // var url = URL.createObjectURL(blob);
      this.$socket.emit("blob data", blob);
      var filename = new Date().toISOString();
      this.value = filename;
    },
    stopRecording() {
      rec.stop(); //stop microphone access
      gumStream.getAudioTracks()[0].stop();
      // rec.exportWAV(createDownloadLink)
      //create the wav blob and pass it on to createDownloadLink
      rec.exportWAV(this.createDownloadLink);
    }
  },
  created() {
    if (localStorage.chatbotsessionid) {
      this.sessionID = localStorage.chatbotsessionid;
    } else {
      this.sessionID = this.$uuid.v4();
      localStorage.chatbotsessionid = this.sessionID;
    }
  },
  mounted() {
    this.$socket.on("proceedMsg", msg => {
      this.chatmessage.push(msg);
    });
  }
};
</script>

// let AipSpeech = require("baidu-aip-sdk").speech;
// let Server = require('ws').Server;
// const wss = new Server({
//     port: 9001
// })

// let resTxt;
// wss.on('connection', ws => {
//     console.log('server connected');
//     ws.on('message', data => {
//         console.log('server recived audio blob');
//         // 务必替换百度云控制台中新建百度语音应用的 Api Key 和 Secret Key
//         let client = new AipSpeech(0, 'Api Key', 'Secret Key');
//         let voiceBase64 = new Buffer(data);
//         client.recognize(voiceBase64, 'wav', 16000).then(function(result) {
//             console.log('语音识别本地音频文件结果: ' + JSON.stringify(result));
//             resTxt = JSON.parse(JSON.stringify(result));
//         }, function(err) {
//             console.log(err);
//         });
//     })
//     // 将结果传给前端
//     ws.send(resTxt);
//     ws.on('error', error => {
//         console.log('Error:' + error);
//     })
//     ws.on('close', () => {
//         console.log('Websocket is closed');
//     })
// })
// wss.on('disconnection', ws => {
//     ws.on('message', msg => {
//         console.log('server recived msg:' + msg);
//     })
// })