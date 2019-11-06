require("dotenv").config();
const axios = require("axios");
const path = require("path");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 9191;
var AipSpeechClient = require("baidu-aip-sdk").speech;
// 设置APPID/AK/SK
var APP_ID = "17691809";
var API_KEY = "BDkThiqHmrELIYy8UuEzfLDt";
var SECRET_KEY = "G6bU0CDNbPGfh90itubexmWEQiBe2RF5";
// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);

app.get("/", (req, res) => {
  res.send("<h1>Welcome Realtime Server");
});

io.on("connection", socket => {
  console.log("***新用户连接成功***");
  socket.on("chat message", obj => {
    console.log(`chat message事件接收到的数据是${obj.msg}`);
    // 操作进入数据处理.....处理过程
  });

  socket.on("wav", wav => {
    let voiceBase64 = Buffer.from(wav);
    client
      .recognize(voiceBase64, "wav", 16000, { dev_pid: "1737" })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  });
  socket.on("disconnect", () => {
    console.log("xxx用户连接断开xxx");
  });
});

http.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}`);
});
