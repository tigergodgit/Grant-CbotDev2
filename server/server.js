require("dotenv").config();
const axios = require("axios");
const path = require("path");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 9191;

app.get("/", (req, res) => {
  res.send("<h1>Welcome Realtime Server");
});

io.on("connection", socket => {
  console.log("***新用户连接成功***");
  socket.on("chat message", obj => {
    console.log(`chat message事件接收到的数据是${obj.msg}`);
    // 操作进入数据处理.....处理过程
    axios
      .post("http://openapi.tuling123.com/openapi/api/v2", {
        reqType: 0,
        perception: {
          inputText: {
            text: obj.msg
          }
        },
        userInfo: {
          apiKey: "4eacf07f1fd547e6944bd9c45c75e5a1",
          userId: "524907"
        }
      })
      .then(result => {
        const proceedMSG = result.data.values;
        // 将数据传回
        console.log(`处理过后的数据是${proceedMSG}`);
        socket.emit("proceedMsg", proceedMSG);
      })
      .catch(err => {
        throw err;
      });
  });
  socket.on("disconnect", () => {
    console.log("xxx用户连接断开xxx");
  });
});

http.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}`);
});
