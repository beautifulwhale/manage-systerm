// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/css/global.css";
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor, /* { default global options } */)

import moment from 'moment';  //直接引入moment.js
Vue.prototype.moment  =  moment;  //在原型上添加moment，this.moment使用即可

//添加时间的过滤器
Vue.filter('dateFormat',function(value,dateFormat='YYYY-MM-DD HH:mm:ss'){
  return moment(value).format(dateFormat);
})
Vue.component("tree-table", TreeTable)
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Aside,
  Header,
  Main,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  MessageBox,
  Select,
  Option,
  Cascader,
  Step
} from "element-ui";
Vue.use(Button);
Vue.use(Step);
Vue.use(Form);
Vue.use(Select);
Vue.use(Option);
Vue.use(Cascader);
Vue.use(Dialog);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Container);
Vue.use(Aside);
Vue.use(Header);
Vue.use(Main);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Switch);
Vue.use(Tooltip);
Vue.use(Pagination);
Vue.prototype.$message = Message;
//将confirm挂载到vue原型上
Vue.prototype.$confirm = MessageBox.confirm;
import axios from "axios";
Vue.prototype.$http = axios;
axios.defaults.baseURL = "http://localhost:8888/api/private/v1/";
//axios请求拦截器添加token，保证拥有数据的权限 前台校验
axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.config.productionTip = false;
Vue.use(ElementUI);
/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  components: { App },
  template: "<App/>"
});
