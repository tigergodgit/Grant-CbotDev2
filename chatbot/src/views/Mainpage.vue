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
import Recorderx, { ENCODE_TYPE } from "recorderx";
const rc = new Recorderx({
  recordable: true,
  sampleRate: 16000,
  sampleBits: 16,
  bufferSize: 16384
});
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
      rc.start()
        .then(() => {
          console.log("开始录音");
        })
        .catch(error => {
          console.log("录音出错.", error);
        });
    },

    stopRecording() {
      rc.pause();
      var pcm = rc.getRecord({
        encodeTo: ENCODE_TYPE.PCM,
        compressible: true
      });
      // console.log(wav);
      this.$socket.emit("wav", pcm);
      rc.clear();
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
// http://dy.163.com/v2/article/detail/DQS54OVJ0518T2NO.html