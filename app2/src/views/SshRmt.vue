<template>
  <el-card class="box-card">
    <el-form>
      <el-row>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input  name" v-model="input6"><template slot="prepend">Name:</template></el-input>
        </el-col>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input port" v-model="input7"><template slot="prepend">Fingerprint:</template></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input IP or Domain name" v-model="input1">><template slot="prepend">IP or Domain name:</template></el-input>
        </el-col>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input port" v-model="input2"><template slot="prepend">Port:</template></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input user name" v-model="input3"><template slot="prepend">UserName:</template></el-input>
        </el-col>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input password" v-model="input4"><template slot="prepend">Password:</template></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-input  size="small" type="textarea" autosize placeholder="please input user Key" v-model="input5"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label-width="0">
          <el-button @click="saveSshConfig">保存</el-button>
        </el-form-item>
      </el-row>
    </el-form>
  </el-card>
</template>
<style>
.el-form-item {
  text-align: center;
  padding-top: 20px;
}

.el-row {
margin:8px 0 8px 0;
}
</style>
<script>
import axios from "axios";
export default {
  data () {
    return {
      sshInfo: true,
      input1: '',
      input2: '22',
      input3: 'root',
      input4: '',
      input5: '',
      input6: '',
      input7: 'ip,指纹,经纬度'
    }
  },
  methods: {
    saveSshConfig () {
      const article = { title: "Vue POST Request Example" };
      axios.post("https://reqres.in/api/articles", article).then(response => this.articleId = response.data.id);
    }
  }
}
</script>
