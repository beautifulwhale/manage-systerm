<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告框区域 -->
      <el-alert
        title="注意：只允许为第三类分类设置相关参数"
        :closable="false"
        show-icon
        type="warning"
      >
      </el-alert>
      <!-- 级联选择器 -->
      <el-row :gutter="10" style="margin-top:15px">
        <el-col :span="3" style="margin-top:10px">
          <span>选择商品分类:</span>
        </el-col>
        <el-col :span="10">
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            expand-trigger="hover"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tags选项卡 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isUseBtn"
            @click="addParamsDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTabList" border>
            <el-table-column type="expand">
              <!-- 渲染Tag -->
              <template v-slot:default="scope">
                <el-tag
                  type="primary"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClosed(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加Tag和输入框的转换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  style="width:120px"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
                <pre>{{ scope.row }}</pre>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEdit(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="showDelete(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isUseBtn"
            @click="addParamsDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTabList" border>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEdit(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="showDelete(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数和静态属性的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="resetAdd"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsRules"
        ref="addParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改属性的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="resetEdit"
    >
      <el-form
        :model="editParamsForm"
        :rules="editParamsRules"
        ref="editParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除的对话框 -->
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      selectedCateKeys: [],
      cateList: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      activeName: "many",
      //动态参数列表
      manyTabList: [],
      //静态属性列表
      onlyTabList: [],
      addParamsDialogVisible: false,
      addParamsForm: {
        attr_name: ""
      },
      addParamsRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      editParamsDialogVisible: false,
      editParamsForm: {
        attr_name: ""
      },
      editParamsRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      }
      // inputVisible:false,
      // inputValue:''
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    //判断是否为三级分类，来确定添加参数和属性的按钮是否为禁用状态
    isUseBtn() {
      //如果为禁用状态返回true，否则为false
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    //添加动态静态的标题
    titleText() {
      if (this.activeName === "many") {
        return "动态属性";
      }
      return "静态属性";
    }
  },
  methods: {
    getCateList() {
      const res = axios({
        method: "get",
        url: "categories",
        params: {
          type: 3
        }
      }).then(
        res => {
          this.cateList = res.data.data;
        },
        error => {
          console.log(error);
        }
      );
    },
    //监视级联选择器选择数值的变化
    handleChange() {
      this.getParamsDate();
    },
    handleTabClick() {
      this.getParamsDate();
    },
    //获取参数的列表数据
    getParamsDate() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTabList = [];
        this.onlyTabList = [];
      }
      const res = axios({
        method: "get",
        url: `categories/${this.cateId}/attributes`,
        params: {
          sel: this.activeName
        }
      }).then(
        res => {
          res.data.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
            //控制文本框的显示与隐藏
            item.inputVisible = false;
            item.inputValue = "";
          });
          if (this.activeName === "many") {
            this.manyTabList = res.data.data;
          } else {
            this.onlyTabList = res.data.data;
          }
          // console.log(res.data);
        },
        error => {
          console.log(error);
        }
      );
    },
    resetAdd() {
      this.$refs.addParamsFormRef.resetFields();
    },
    resetEdit() {
      this.$refs.editParamsFormRef.resetFields();
    },
    //点击按钮发送请求来添加参数
    addParams() {
      const res = axios({
        method: "post",
        url: `categories/${this.cateId}/attributes`,
        data: {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        }
      }).then(
        res => {
          this.addParamsDialogVisible = false;
          // this.addParamsForm = res.data.data;
          this.getParamsDate();
        },
        error => {
          console.log(error);
        }
      );
    },
    //点击修改按钮展示修改按钮对话框
    showEdit(attr_id) {
      this.editParamsDialogVisible = true;
      const res = axios
        .get(`categories/${this.cateId}/attributes/${attr_id}`, {
          params: { attr_sel: this.activeName }
        })
        .then(
          res => {
            this.editParamsForm = res.data.data;
          },
          error => {
            console.log(error);
          }
        );
    },
    // 编辑提交参数来修改参数
    editParams() {
      const res = axios({
        method: "put",
        url: `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
        data: {
          attr_sel: this.activeName,
          attr_name: this.editParamsForm.attr_name
        }
      }).then(
        res => {
          this.editParamsDialogVisible = false;
          this.$message.success("修改参数成功");
          this.getParamsDate();
        },
        error => {
          console.log(error);
        }
      );
    },
    //根据ID删除参数
    showDelete(attr_id) {
      this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const res = axios({
            method: "DELETE",
            url: `categories/${this.cateId}/attributes/${attr_id}`
          }).then(res => {
            this.getParamsDate();
            this.$message({
              type: "success",
              message: "参数删除成功!"
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
    //监视失去焦点和回车事件
    handleInputConfirm(row) {
      //判断是否有空格 有的话清空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      this.saveAttrVals(row);
    },
    //发送编辑提交分类请求保存到数据库中
    saveAttrVals(row) {
      const res = axios({
        method: "put",
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        data: {
          attr_sel: row.attr_sel,
          attr_name: row.attr_name,
          attr_vals: row.attr_vals.join(" ")
        }
      }).then(
        res => {
          this.$message.success("修改参数项成功");
        },
        error => {
          console.log(error);
        }
      );
    },
    //实现添加Tag和输入框的切换
    showInput(row) {
      row.inputVisible = true;
      //自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除参数可选项
    handleClosed(index, row) {
      row.attr_vals.splice(index, 1);
      this.$message.success("删除可选项参数成功");
      this.saveAttrVals(row);
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin-right: 15px;
}
</style>
