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
  </div>
</template>
<script>
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