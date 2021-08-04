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
      <!-- 搜索框 和添加商品区域 -->
      <el-row :gutter="10">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="goodsInfo.query"
            @clear="getShopList"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getShopList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button
            type="primary"
            style="margin-left:20px"
            @click="goToAddShop"
            >添加商品</el-button
          >
        </el-col>
      </el-row>
      <!-- 商品列表表格 -->
      <el-table :data="shopList" style="width: 100%" border>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)">
        </el-table-column>
        <el-table-column prop="goods_number" label="商品数量">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template v-slot:default="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteShopGood(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="goodsInfo.pagenum"
        :page-sizes="[1, 2, 5, 100]"
        :page-size="goodsInfo.pagesize"
        layout="sizes, prev, pager, next"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
import axios from "axios";
export default {
  data() {
    return {
      shopList: [],
      //获取商品列表参数
      goodsInfo: {
        query: "",
        pagenum: 1,
        pagesize: 3
      },
      //总数居条数
      total: 0
    };
  },
  created() {
    this.getShopList();
  },
  methods: {
    getShopList() {
      const res = axios
        .get("goods", {
          params: {
            query: this.goodsInfo.query,
            pagenum: this.goodsInfo.pagenum,
            pagesize: this.goodsInfo.pagesize
          }
        })
        .then(res => {
          //   console.log(res.data);
          this.shopList = res.data.data.goods;
          this.total = res.data.data.total;
        });
    },
    //pageSize 改变时会触发 每页条数
    handleSizeChange(newSize) {
      this.goodsInfo.pagesize = newSize;
      this.getShopList();
    },
    // currentPage 改变时会触发 当前页数
    handleCurrentChange(newPage) {
      this.goodsInfo.pagenum = newPage;
      this.getShopList();
    },
    //删除商品
    deleteShopGood(row) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const res = axios.delete(`goods/${row.goods_id}`).then(res => {
            this.$message.success("删除商品成功");
            this.getShopList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //点击添加商品跳转路由
    goToAddShop() {
      this.$router.push("/goods/add");
    }
  }
};
</script>
<style lang="less" scoped></style>
