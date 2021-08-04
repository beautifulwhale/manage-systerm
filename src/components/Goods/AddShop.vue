<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="Number(activeIndex)"
        finish-status="success"
        style="margin:30px 0"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品照片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单中的嵌套Tab选项 -->
      <el-form
        :model="AddShopForm"
        :rules="AddShopRules"
        ref="AddShopRuleForm"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="AddShopForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="AddShopForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="AddShopForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="AddShopForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                v-model="AddShopForm.goods_cat"
                :options="cateList"
                expand-trigger="hover"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in goodParamsList"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="val"
                  v-for="(val, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in goodAttributeList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品照片" name="3">
            <el-upload
              class="upload-demo"
              action="http://localhost:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="unloadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="AddShopForm.goods_introduce"> </quill-editor>
            <el-button type="primary" @click="addGoods" style="margin-top:30px"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" style="width:100%" />
    </el-dialog>
  </div>
</template>
<script>
import axios from "axios";
import _ from "lodash";
export default {
  data() {
    return {
      activeIndex: "0",
      AddShopForm: {
        goods_name: "",
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        //图片上传的数组
        pics: [],
        goods_introduce: "",
        attrs: []
      },
      AddShopRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ]
      },
      cateList: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      //商品参数列表
      goodParamsList: [],
      //商品属性列表
      goodAttributeList: [],
      headersObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      previewVisible: false,
      previewPath: ""
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    getCateList() {
      const res = axios.get("categories", { params: { type: 3 } }).then(res => {
        this.cateList = res.data.data;
      });
    },
    handleChange() {
      if (this.AddShopForm.goods_cat.length !== 3) {
        this.AddShopForm.goods_cat = [];
      }
    },
    //在切换Tabs标签页之前触发判断是否选择了三级商品分类
    beforeLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.AddShopForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },

    tabClicked() {
      if (this.activeIndex === "1") {
        const result = axios
          .get(`categories/${this.cateId}/attributes`, {
            params: {
              sel: "many"
            }
          })
          .then(res => {
            this.goodParamsList = res.data.data;
            res.data.data.forEach(item => {
              item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
            });
          });
      }
      if (this.activeIndex === "2") {
        const result = axios
          .get(`categories/${this.cateId}/attributes`, {
            params: {
              sel: "only"
            }
          })
          .then(res => {
            this.goodAttributeList = res.data.data;
          });
      }
      // if(this.activeIndex === '3'){

      // }
    },
    //上传图片成功的函数
    unloadSuccess(response) {
      //1.拼接得到一个图片对象
      const picInfo = {
        pic: response.data.tmp_path
      };
      //2.把对象添加到数组中
      this.AddShopForm.pics.push(picInfo);
    },
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    handleRemove(file) {
      //1.找到要删除图片的临时路径
      const filePath = file.response.data.tmp_path;
      //2.找到要删除图片的索引
      const index = this.AddShopForm.pics.findIndex(item => {
        item.pic = filePath;
      });
      //3.删除图片
      this.AddShopForm.pics.splice(index, 1);
    },
    addGoods() {
      this.$refs.AddShopRuleForm.validate(valid => {
        if (!valid) {
          this.$message.error("请输入必填的表单项");
        }
        //成功的业务逻辑
        //因为模板渲染需要goods_cat为数组，这里转化为字符串就会发生冲突
        // this.AddShopForm.goods_cat = this.AddShopForm.goods_cat.join(",");
        //利用lodash  codeDeep方法进行深拷贝来创建出来一个新的AddShopForm对象 他俩没有任何关系
        const cloneForm = _.cloneDeep(this.AddShopForm);
        cloneForm.goods_cat = cloneForm.goods_cat.join(",");
        //吧动态属性和静态参数的需要的属性取出来添加到attrs数组中
        this.goodParamsList.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          cloneForm.attrs.push(newInfo);
        });
        this.goodAttributeList.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          cloneForm.attrs.push(newInfo);
        });
        const res = axios({
          method: "post",
          url: "goods",
          data: {
            goods_name: cloneForm.goods_name,
            goods_cat: cloneForm.goods_cat,
            goods_price: cloneForm.goods_price,
            goods_number: cloneForm.goods_number,
            goods_weight: cloneForm.goods_weight,
            goods_introduce: cloneForm.goods_introduce,
            pics: cloneForm.pics,
            attrs: cloneForm.attrs
          }
        }).then(
          res => {
            this.$message.success("添加商品成功");
            this.$router.push("/goods");
          },
          error => {
            console.log(error);
          }
        );
      });
    }
  },
  computed: {
    cateId() {
      if (this.AddShopForm.goods_cat.length === 3) {
        return this.AddShopForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>
<style lang="less" scoped>
.el-step__title {
  font-size: 13px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
</style>
