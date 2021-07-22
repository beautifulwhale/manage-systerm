<template>
  <div class="login_container">
    <!-- 登录盒子 -->
    <div class="login_box">
      <!-- 头像部分 -->
      <div class="avatar_box">
        <img src="../assets/beauty.jpeg" alt="" />
      </div>
      <!-- 表单部分 -->
      <el-form
        label-width="0px"
        class="login_form"
        :model="Loginmodel"
        :rules="LoginFormRules"
        ref="LoginFormRefs"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="Loginmodel.username"
            prefix-icon="iconfont icon-yonghu"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="Loginmodel.password"
            prefix-icon="iconfont icon-mimasuo"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="loginIn">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      Loginmodel: {
        username: "admin",
        password: "123456"
      },
      //登录的校验规则
      LoginFormRules: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入登陆密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    resetLoginForm() {
      this.$refs.LoginFormRefs.resetFields();
    },
    //登录验证
    loginIn() {
      this.$refs.LoginFormRefs.validate(async valid => {
        if (!valid) return;
        const { data: result } = await this.$http.post(
          "login",
          this.Loginmodel
        );
        console.log(result)
        if (result.meta.status !== 200) return this.$message.error("登陆失败");
        this.$message.success("登陆成功");

        // const result = await axios({
        //   method: "POST",
        //   url: "/login",
        //   data: this.Loginmodel
        // }).then(
        //   res => {
        //     console.log(res);
        //     return this.$message.success("登陆成功！！！");
        //   },
        //   error => {
        //     return this.$message.error("登陆失败");
        //     console.log(error);
        //   }
        // );
       
        //1.将登陆成功的token保存到客户端sessionStorage
          window.sessionStorage.setItem("token", result.data.token);
        //2.通过编程式导航跳转到后台主页,路由地址是/home
        this.$router.push("/home");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: pink;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  position: absolute;
  background-color: #fff;
  border-radius: 5px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 8px;
    border: 2px solid #eee;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    img {
      height: 130px;
      width: 130px;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
