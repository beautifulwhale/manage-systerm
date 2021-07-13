// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/css/global.css";

import { Button } from "element-ui";
import { Form } from "element-ui";
import { FormItem } from "element-ui";
import { Input } from "element-ui";
import {Message} from 'element-ui'
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.prototype.$message = Message;


import axios from "axios";
Vue.prototype.$http = axios;
axios.defaults.baseURL = "http://localhost:8888/api/private/v1/";

Vue.config.productionTip = false;
Vue.use(ElementUI);
/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  components: { App },
  template: "<App/>"
});
