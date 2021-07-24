<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="10">
        <el-col :span="5">
          <el-button type="primary" @click="RolesDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="rolesList" style="width: 100%" stripe border>
        <el-table-column type="expand">
          <!-- 展示权限 -->
          <template v-slot:default="scope">
            <!-- 一级权限 -->
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="[
                'bottomborder',
                index1 === 0 ? 'topborder' : '',
                'colcenter'
              ]"
            >
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="removeRights(scope.row.id, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[
                    'bottomborder',
                    index2 === 0 ? '' : 'topborder',
                    'colcenter'
                  ]"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRights(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      @close="removeRights(scope.row, item3.id)"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot:default="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRolesDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoles(scope.row.id)"
              >删除</el-button
            >
            <el-tooltip effect="dark" content="分配权限" placement="top-start">
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="allotRight(scope.row)"
                >分配权限</el-button
              >
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 角色添加对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="RolesDialogVisible"
      width="50%"
      @close="resetAddRolesForm"
    >
      <el-form
        :model="addRolesForm"
        :rules="addRolesRules"
        ref="addRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="RolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 角色编辑对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRolesDialogVisible"
      width="50%"
      @close="resetEditRolesForm"
    >
      <el-form
        :model="editRolesForm"
        :rules="editRolesRules"
        ref="editRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色ID" prop="roleId">
          <el-input v-model="editRolesForm.roleId" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input> </el-form-item
        ><el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="resetRightClosed"
    >
      <el-tree
        :data="rightList"
        :props="rightProps"
        node-key="id"
        ref="treeRef"
        :default-checked-keys="defKeysArr"
        show-checkbox
        default-expand-all
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setAllotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      rolesList: [],
      RolesDialogVisible: false,
      //添加角色表单
      addRolesForm: {
        roleName: "",
        roleDesc: ""
      },
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 5 到 15 个字符", trigger: "blur" }
        ]
      },
      editRolesDialogVisible: false,
      editRolesForm: {
        roleId: "",
        roleName: "",
        roleDesc: ""
      },
      editRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 5 到 15 个字符", trigger: "blur" }
        ]
      },
      setRightDialogVisible: false,
      //权限列表
      rightList: [],
      rightProps: {
        children: "children",
        label: "authName"
      },
      //默认勾选的节点的 key 的数组
      defKeysArr: [],
      //角色ID
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表数据
    getRolesList() {
      const res = axios.get("roles").then(
        res => {
          this.rolesList = res.data.data;
        },
        error => {
          console.log(error);
        }
      );
    },
    resetAddRolesForm() {
      this.$refs.addRolesFormRef.resetFields();
    },
    addRoles() {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) return;
        const result = await axios({
          method: "POST",
          url: "roles",
          data: this.addRolesForm
        }).then(
          res => {
            this.addRolesForm = res.data.data;
            this.$message.success("添加角色成功");
            this.RolesDialogVisible = false;
          },
          error => {
            console.log(error);
          }
        );
      });
    },
    resetEditRolesForm() {
      this.$refs.editRolesFormRef.resetFields();
    },
    //根据 ID 查询角色
    editRolesDialog(id) {
      this.editRolesDialogVisible = true;
      const res = axios({
        method: "get",
        url: "/roles/" + id,
        params: this.editRolesForm
      }).then(
        res => {
          this.editRolesForm = res.data.data;
        },
        error => {
          console.log(error);
        }
      );
    },
    //提交编辑角色
    editRoles() {
      this.$refs.editRolesFormRef.validate(valid => {
        if (!valid) return;
        const res = axios({
          method: "put",
          url: "roles/" + this.editRolesForm.roleId,
          data: {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        }).then(
          res => {
            this.getRolesList();
            this.editRolesDialogVisible = false;
            this.$message.success("更新角色状态成功");
          },
          error => {
            console.log(error);
          }
        );
      });
    },
    removeRoles(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const res = axios({
            method: "DELETE",
            url: "roles/" + id
          }).then(res => {
            this.getRolesList();
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
    },
    //根据ID删除对应角色的权限
    removeRights(role, rightId) {
      this.$confirm("此操作将永久删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const res = axios({
            method: "delete",
            url: `roles/${role.id}/rights/${rightId}`
          }).then(
            res => {
              this.$message.success("删除权限成功！");
              // this.getRolesList();
              //返回当前所有拥有的角色信息
              role.children = res.data.data;
            },
            error => {
              return this.$message.error(error);
            }
          );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //分配权限对话框的显示
    allotRight(role) {
      //后台获取权限树
      const res = axios.get("rights/tree").then(
        res => {
          // console.log(res);
          this.rightList = res.data.data;
          this.roleId = role.id;
        },
        error => {
          console.log(error);
        }
      );
      this.getDefKeysArr(role, this.defKeysArr);
      this.setRightDialogVisible = true;
    },
    //获取默认勾选key值得数组
    getDefKeysArr(node, arr) {
      //选择递归得方式
      //如果没有字节点直接把ID传到数组中
      if (!node.children) {
        return arr.push(node.id);
      }
      //如果有字节点进行遍历
      node.children.forEach(item => {
        this.getDefKeysArr(item, arr);
      });
    },
    //当关闭对话框时重置权限，以免存在上一个得
    resetRightClosed() {
      this.defKeysArr = [];
    },
    //点击为角色分配权限
    setAllotRight() {
      //把所有选中半选中的权限的ID找到
      const keyId = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const keyIdStr = keyId.join(",");
      const res = axios({
        method: "post",
        url:`roles/${this.roleId}/rights`,
        data:{
          rids:keyIdStr
        }
      }).then(
        res => {
          this.$message.success("添加分配权限成功");
          this.getRolesList();
          this.setRightDialogVisible = false;
        },
        error => {
          console.log(error);
        }
      );
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.topborder {
  border-top: 1px solid #eee;
}
.bottomborder {
  border-bottom: 1px solid #eee;
}
//让一级二级三级权限垂直方向上居中
.colcenter {
  display: flex;
  align-items: center;
}
</style>
