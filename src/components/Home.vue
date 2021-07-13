<template>
    <div>
    <el-button type="info" @click="logout">退出</el-button>       
    </div>
</template>
<script>
export default {
    methods:{
        logout(){
            //销毁token  跳转到登录界面
            window.sessionStorage.clear();
            this.$router.push('/login')
        }
    }
}
</script>

<style lang="less" scoped>

</style>