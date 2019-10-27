const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.send("<h1>Welcome Realtime Server</h1>");
});

var onlineUsers = {}; //在线用户
var onlineCount = 0; //在线人数
io.on("connection", s => {
  console.log("新建用户连接");
  s.on("login", obj => {
    s.name = obj.userid;
    if (!onlineUsers.hasOwnProperty(obj.userid)) {
      //判断onlineUsers里面有没有用户,没有就添加进去
      onlineUsers[obj.userid] = obj.username;
      onlineCount++;
    }
    io.emit("login", { onlineUsers: onlineUsers, onlineCount: onlineCount });
    console.log(obj.username + "加入了聊天室");
  });
  s.on("disconnect", () => {
    if (onlineUsers.hasOwnProperty(s.name)) {
      var obj = { userid: s.name, username: onlineUsers[s.name] };
      delete onlineUsers[s.name];
      onlineCount--;
      io.emit("logout", { onlineUsers: onlineUsers, onlineCount: onlineCount });
      console.log(obj.username + "退出了聊天室");
    }
  });
  s.on("message", obj => {
    //向所有客户端广播发布的消息
    io.emit("message", obj);
    console.log(obj.username + "说：" + obj.content);
  });
});

http.listen(8181, () => {
  console.log("listening on prot 8181");
});
