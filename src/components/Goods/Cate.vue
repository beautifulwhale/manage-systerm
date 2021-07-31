<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-button type="primary" @click="showAddCateDialog"
            >添加商品</el-button
          >
        </el-col>
      </el-row>
      <!-- 树形图区域 -->
      <tree-table
        class="treetable"
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template v-slot:isOk="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightGreen"
          ></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:option="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </tree-table>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="resetAddCate"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectKeyId"
            :options="parentList"
            expand-trigger="hover"
            :props="propsCascader"
            @change="handleKeyIdChange"
            clearable
            :change-on-select="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      queryInfo: {
        type: 3
      },
      //获取商品分类列表
      cateList: [],
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isOk"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "option"
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_pid: 0,
        cat_level: 0,
        cat_name: ""
      },
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ]
      },
      parentList: [],
      //存储级联选择器选中的父级的ID
      selectKeyId: [],
      //级联选择器配置对象
      propsCascader: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    getCateList() {
      const res = axios
        .get("categories", { params: { type: this.queryInfo.type } })
        .then(
          res => {
            this.cateList = res.data.data;
          },
          error => {
            console.log(error);
          }
        );
    },
    //展示添加分类对话框
    showAddCateDialog() {
      this.getParentList();
      this.addCateDialogVisible = true;
    },
    //获取父级分类数据列表
    getParentList() {
      const res = axios.get("categories", { params: { type: 2 } }).then(
        res => {
          this.parentList = res.data.data;
        },
        error => {
          console.log(error);
        }
      );
    },
    //监视改变级联选择器ID
    handleKeyIdChange() {
      //判断是否有父级ID
      if (this.selectKeyId.length) {
        this.addCateForm.cat_pid = this.selectKeyId[
          this.selectKeyId.length - 1
        ];
        this.addCateForm.cat_level = this.selectKeyId.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
        return;
      }
      console.log(this.selectKeyId);
    },
    addCate() {
      // console.log(this.addCateForm);
      const res = axios({
        method: "post",
        url: "categories",
        data: {
          cat_pid: this.addCateForm.cat_pid,
          cat_level: this.addCateForm.cat_level,
          cat_name: this.addCateForm.cat_name
        }
      }).then(res => {
        console.log(res.data);
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    resetAddCate() {
      this.$refs.addCateFormRef.resetFields();
      this.selectKeyId = [];
    }
  }
};
</script>

<style lang="less" scoped>
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
