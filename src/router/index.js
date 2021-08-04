import Vue from "vue";
import Router from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Welcome from "../components/Welcome.vue";
import Users from "@/components/Users/Users";
import Rights from "@/components/Power/Rights";
import Roles from "@/components/Power/Roles";
import Cate from "@/components/Goods/Cate";
import Params from "@/components/Goods/Params";
import ShopList from "@/components/Goods/ShopList";
import AddShop from "@/components/Goods/AddShop";
import Order from '@/components/Order/Order'
import Reports from '@/components/Reports/Reports'
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/login",
      component: Login
    },
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/home",
      component: Home,
      redirect: "/welcome",
      children: [
        { path: "/welcome", component: Welcome },
        { path: "/users", component: Users },
        { path: "/rights", component: Rights },
        { path: "/roles", component: Roles },
        { path: "/categories", component: Cate },
        { path: "/params", component: Params },
        { path: "/goods", component: ShopList },
        { path: "/goods/add", component: AddShop },
        { path: '/orders', component: Order },
        { path: '/reports', component: Reports }
      ]
    }
  ]
});
