<template>
  <el-container>
    <el-header>
      <div class="header_title">
        <img src="../assets/touxiang.jpg" alt="" />
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 进行折叠菜单 -->
        <div class="toggle_menu" @click="changeCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          active-text-color="blue"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单模板 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subMenu.path"
              v-for="subMenu in item.children"
              :key="subMenu.id"
              @click="changeNavColor('/' + subMenu.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subMenu.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        "125": "iconfont icon-yonghu",
        "103": "iconfont icon-quanxian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-order1",
        "145": "iconfont icon-shujutongji"
      },
      //是否进行翻转
      isCollapse: false,
      //被选中的二级菜单高亮
      activePath: ""
    };
  },
  created() {
    this.getMenuList();
    //获取存储的地址让导航高亮
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    logout() {
      //销毁token  跳转到登录界面
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
    },
    //是否进行左侧菜单得折叠
    changeCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //改变二级菜单导航颜色是否高亮  保存链接的高亮
    changeNavColor(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    }
  }
};
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: rgb(195, 108, 230);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  .header_title {
    display: flex;
    color: #fff;
    font-size: 20px;
    align-items: center;
    img {
      border-radius: 50%;
    }
    > span {
      padding-left: 10px;
    }
  }
}
.el-aside {
  background-color: rgb(78, 219, 230);
  .iconfont {
    margin-right: 10px;
  }
  .toggle_menu {
    line-height: 24px;
    font-size: 10px;
    color: #fff;
    text-align: center;
    background-color: paleturquoise;
    cursor: pointer;
    letter-spacing: 0.2em;
  }
}
.el-main {
  background-color: rgb(236, 236, 236);
}
</style>
