<template>
  <el-card class="box-card" shadow="hover">
    <el-form ref="form">
      <el-row>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input  name" v-model="form.title"><template slot="prepend">Title:</template></el-input>
        </el-col>
        <el-col :span="12">
        <vue-tags-input v-model="form.tags" :tags="tags" @tags-changed="newTags => tags = newTags"></vue-tags-input><!-- <el-input  size="small" placeholder="please input port" v-model="form.tags"><template slot="prepend">Tags:</template></el-input> -->
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input IP or Domain name" v-model="form.ip"><template slot="prepend">IP or Domain name:</template></el-input>
        </el-col>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input port" v-model.number="form.port"><template slot="prepend">Port:</template></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input user name" v-model="form.user"><template slot="prepend">UserName:</template></el-input>
        </el-col>
        <el-col :span="12">
          <el-input  size="small" placeholder="please input password" type="password" v-model="form.p5wd"><template slot="prepend">Password:</template></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-input  size="small" type="textarea" autosize placeholder="please input user Key" v-model="form.key"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label-width="0">
          <v-btn elevation="19" @click="saveSshConfig" ref="r7">保存</v-btn>
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
import axios from 'axios'
import { Message } from 'element-ui'
import VueTagsInput from '@johmun/vue-tags-input'

export default {
  components: {
    VueTagsInput
  },
  data () {
    return {
      tags: [],
      form: {
        title: 'Home AS6510T-60C1',
        tags: 'ssh',
        ip: '192.168.0.111',
        port: 222,
        user: 'root',
        p5wd: 'Miracle***888',
        key: ''
      }
    }
  },
  created () {
  },
  methods: {
    focusNext (nextRef) {
      this.$refs[nextRef].focus()
    },
    saveSshConfig () {
      axios.post('/api/v1/rsc', this.form).then(resp => {
        if (resp.data.code === 1)Message.success('save msg: ' + resp.data.msg)
        else Message.info('save error: ' + resp.data.msg)
        return 0
      }
      ).catch(function (error) {
        alert(error)
      }
      )
    }
  }
}
</script>
