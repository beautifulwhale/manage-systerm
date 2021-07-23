<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 栅栏布局 搜索框按钮 -->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @clear="getUserList"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="addUserDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户主体区域 -->
      <el-table :data="userList" style="width: 100%" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="scope">
            <!-- scope.row表示当前这一行的数据 -->
            <!-- {{scope.row}} -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <template v-slot:default="scope">
            <!-- 编辑 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUserDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scope.row.id)"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 4, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 用户添加对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      width="50%"
      @close="resetAddUserForm"
    >
      <el-form
        :model="addUserForm"
        :rules="addUserRules"
        ref="addUserFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input> </el-form-item
        ><el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input> </el-form-item
        ><el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 用户编辑对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserDialogVisible"
      width="50%"
      @close="resetEditUserForm"
    >
      <el-form
        :model="editUserForm"
        :rules="editUserRules"
        ref="editUserFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input> </el-form-item
        ><el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import axios from "axios";
export default {
  data() {
    //用户邮箱的自定义校验规则
    var checkEmail = (rule, value, cb) => {
      if (!value) {
        return cb(new Error("邮箱不能为空"));
      }
      let emailRule = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (!emailRule.test(value)) {
        cb(new Error("请输入正确的邮箱"));
      } else {
        cb();
      }
    };
    //用户手机号的自定义校验规则
    var checkMobile = (rule, value, cb) => {
      if (!value) {
        return cb(new Error("手机号不能为空"));
      }
      let mobileRule = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (!mobileRule.test(value)) {
        cb(new Error("请输入正确的手机号"));
      } else {
        cb();
      }
    };
    return {
      //定义请求参数
      queryInfo: {
        query: "",
        //当前页码
        pagenum: 1,
        //每页显示条数
        pagesize: 2
      },
      userList: [],
      total: 0,
      //是否显示添加用户对话框
      addUserDialogVisible: false,
      //添加用户表单数据
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //添加用户表单验证规则
      addUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 5 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //是否显示编辑用户对话框
      editUserDialogVisible: false,
      //编辑用户表单数据
      editUserForm: {},
      //编辑用户表单验证规则
      editUserRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const res = await axios({
        method: "GET",
        url: "/users",
        params: this.queryInfo
      })
        .then(res => {
          this.userList = res.data.data.users;
          this.total = res.data.data.total;
          // console.log(res);
        })
        .catch(error => {
          console.log(error);
        });
    },
    //pageSize 改变时会触发 每页条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // currentPage 改变时会触发 当前页数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 当用户状态发生改变时，前台更新状态并发送Ajax请求同步到服务器中
    async userStateChange(userInfo) {
      // console.log(userInfo)
      const result = await axios({
        method: "PUT",
        url: `users/${userInfo.id}/state/${userInfo.mg_state}`
      }).then(
        result => {
          // console.log(result);
          this.$message.success("更新用户状态成功！");
        },
        result => {
          //如果更新失败 重置状态不让状态改变
          userInfo.mg_state = !userInfo.mg_state;
          this.$message.error("更新状态失败~");
        }
      );
    },
    //关闭对话框时对用户表单进行重置
    resetAddUserForm() {
      this.$refs.addUserFormRef.resetFields();
      // console.log('ABC')
    },
    //添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async vaild => {
        // console.log(vaild);
        if (!vaild) return;
        //调用接口添加数据
        const result = await axios({
          method: "POST",
          url: "/users",
          data: this.addUserForm
        }).then(
          res => {
            console.log(res);
            this.$message.success("添加用户成功");
            this.addUserDialogVisible = false;
          },
          error => {
            this.$message.error("添加用户失败");
          }
        );
      });
    },
    //是否展开编辑用户对话框
    editUserDialog(id) {
      this.editUserDialogVisible = true;
      //根据 ID 查询用户信息
      const { data: res } = axios({
        method: "GET",
        params: this.editUserForm,
        url: "/users/" + id
      }).then(
        res => {
          // console.log(res);
          this.editUserForm = res.data.data;
        },
        error => {
          console.error("根据 ID 查询用户信息失败");
        }
      );
    },
    //关闭编辑用户对话框时对表单进行重置
    resetEditUserForm() {
      this.$refs.editUserFormRef.resetFields();
    },
    //编辑用户信息并调用接口提交
    editUser() {
      //先进行修改后的表单校验
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return;
        const res = await axios({
          method: "PUT",
          data: {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile
          },
          url: "users/" + this.editUserForm.id
        }).then(
          res => {
            this.getUserList();
            this.editUserDialogVisible = false;
            this.$message.success("更新用户状态成功");
          },
          error => {
            console.log(error);
          }
        );
      });
    },
    //删除用户
    removeUser(id) {
      // console.log(id)
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const res = axios({
            method: "DELETE",
            url: "users/" + id
          }).then(res => {
            this.getUserList();
            this.$message({
              type: "success",
              message: "用户删除成功!"
            });
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>

<style lang="less" scoped></style>
