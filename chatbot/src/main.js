import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ViewUI from "view-design";
import "view-design/dist/styles/iview.css";
import io from "socket.io-client";
import uuid from "uuid";

const socket = io("http://localhost:9090");
Vue.prototype.$socket = socket;
Vue.prototype.$uuid = uuid;

Vue.use(ViewUI);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
