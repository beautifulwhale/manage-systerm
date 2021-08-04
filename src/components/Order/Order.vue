<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单表格 -->
      <el-table :data="orderList" style="width: 100%" border>
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot:default="scope">
            <el-button
              type="danger"
              v-model="scope.row.pay_status"
              size="mini"
              v-if="(scope.row.pay_status = '0')"
              >未付款</el-button
            >
            <el-button
              type="primary"
              v-model="scope.row.pay_status"
              size="mini"
              v-else
              >已付款</el-button
            >
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="update_time" label="下单时间">
          <template v-slot:default="scope">
            {{ scope.row.update_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column prop="date" label="操作">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEdit"
          ></el-button>
          <el-button
            type="success"
            icon="el-icon-location-information"
            size="mini"
            @click="showOrder"
          ></el-button>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 10, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 编辑对话框 -->

    <el-dialog
      title="修改地址"
      :visible.sync="editVisible"
      @close="resetForm"
      width="50%"
    >
      <el-form
        :model="addressForm"
        :rules="addressRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="citydata"
            expand-trigger="hover"
            style="width:100%"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看订单 -->
    <el-dialog title="查看订单" :visible.sync="showOrderVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in kuaidi.data"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showOrderVisible = false">取 消</el-button>
        <el-button type="primary" @click="showOrderVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import axios from "axios";
import citydata from "@/components/Order/citydata";
export default {
  data() {
    return {
      orderList: [],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      editVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },
      addressRules: {
        address1: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请输入地址名称", trigger: "blur" }
        ]
      },
      citydata: citydata,
      showOrderVisible: false,
      //接口数据无法调用，写死了
      kuaidi: {
        data: [
          {
            time: "2021-08-04 12:30:05",
            context: "已签收，感谢您使用顺丰快递~"
          },
          {
            time: "2021-08-05 14:30:05",
            context: "派送员xxx正在为您派送，请稍后"
          }
        ]
      }
    };
  },
  created() {
    this.getOrderList();
  },

  methods: {
    getOrderList() {
      const res = axios
        .get("orders", {
          params: {
            query: this.queryInfo.query,
            pagenum: this.queryInfo.pagenum,
            pagesize: this.queryInfo.pagesize
          }
        })
        .then(res => {
          this.orderList = res.data.data.goods;
          this.total = res.data.data.total;
          // const orderId = [];
          // this.orderList.forEach(item => {
          //   orderId.push(item.order_id);
          // });
          // console.log(orderId);
        });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newSize) {
      this.queryInfo.pagenum = newSize;
      this.getOrderList();
    },
    showEdit() {
      this.editVisible = true;
    },
    resetForm() {
      this.$refs.addressFormRef.resetFields();
      console.log("1234");
    },
    showOrder() {
      // const res = axios({
      //   method: "get",
      //   url: `orders/${this.orderList[0].order_id}`
      // }).then(res => {
      //   console.log(res.data);
      // });
      this.showOrderVisible = true;
    }
  }
};
</script>
<style lang="less" scoped>
</style>