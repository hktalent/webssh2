<template>
  <div id="app">
    <el-container>
      <el-header background="trasla">
        <el-menu dark :router="true" :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" @select="handleCommand" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
          <el-submenu index="1">
            <template slot="title"><i class="icon-fixed-width icon-cogs icon-1x"></i>RemoteConfig</template>
            <el-menu-item index="/sshrmt">+add</el-menu-item>
            <el-menu-item index="/conn/1">Home AS6510T-60C1</el-menu-item>
            <el-menu-item index="/conn/2">My Vps-01</el-menu-item>
            <el-menu-item index="1-3">选项3</el-menu-item>
            <el-submenu index="1-4">
              <template slot="title">选项4</template>
              <el-menu-item index="1-4-1">选项1</el-menu-item>
              <el-menu-item index="1-4-2">选项2</el-menu-item>
              <el-menu-item index="1-4-3">选项3</el-menu-item>
            </el-submenu>
          </el-submenu>
          <el-menu-item index="2">处理中心</el-menu-item>
          <el-menu-item index="3">
            <router-link to="/">Home</router-link>
          </el-menu-item>
          <el-menu-item index="4">
            <router-link to="/about">About</router-link>
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-container>
        <el-aside width="70px">
          <el-scrollbar class="myscrollbar">
            <el-menu default-active="2-4-1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse">
              <el-menu-item index="1" @click="handleOpen">
                <i class="el-icon-right-open"></i><span slot="title">打开菜单导航</span>
              </el-menu-item>
              <el-submenu index="2">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span slot="title">导航一</span>
                </template>
                <el-menu-item-group>
                  <span slot="title">分组一</span>
                  <el-menu-item index="2-1">选项1</el-menu-item>
                  <el-menu-item index="2-2">选项2</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="分组2">
                  <el-menu-item index="2-3">选项3</el-menu-item>
                </el-menu-item-group>
                <el-submenu index="2-4">
                  <span slot="title">选项4</span>
                  <el-menu-item index="2-4-1">选项1</el-menu-item>
                </el-submenu>
              </el-submenu>
              <el-menu-item index="3">
                <i class="el-icon-menu"></i>
                <span slot="title">导航二</span>
              </el-menu-item>
              <el-menu-item index="4" disabled>
                <i class="el-icon-document"></i>
                <span slot="title">导航三</span>
              </el-menu-item>
              <el-menu-item index="5">
                <i class="el-icon-setting"></i>
                <span slot="title">导航四</span>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </el-aside>
        <el-main style="height:calc(-100px + 100vh)">
          <el-tabs type="border-card" style="height:100%;flex-grow:1;">
          <el-tab-pane v-for="(item) in editableTabs"
    :key="item.name"
    :label="item.title"
    :name="item.name"
  >
    {{item.content}}
  </el-tab-pane>
            <el-tab-pane label="Remoute Config Manager">
            <router-view></router-view>
            </el-tab-pane>
            <el-tab-pane label="配置管理">
              <template>
                <el-select v-model="value" filterable multiple collapse-tags placeholder="请选择" :filter-method="fltFunc">
                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </template>
            </el-tab-pane>
            <el-tab-pane label="角色管理" closable>
            <el-button @click="drawer = true" type="primary" style="margin-left: 16px;">
                点我打开
              </el-button>
              <el-drawer :visible.sync="drawer" :direction="direction" :with-header="false" size="120px">
                <span>我来啦!</span>
              </el-drawer></el-tab-pane>
            <el-tab-pane label="定时任务补偿"><el-row :gutter="12">
            <el-col :span="8">
    <el-card shadow="hover" id="xFw">
    <div class="winCtrl"><i class="icon-mail-reply" title="back to view" @click="fnMinWin"></i><i class="icon-external-link-sign" title="max window" @click="fnMaxWin"></i><i @click="fnFsc" class="icon-fullscreen" title="fullscreen"></i></div>
    <i class="clearfix"></i>
    <iframe :src="rmtHref" class="ifrm" id="xFsc"></iframe>
    </el-card>
  </el-col></el-row>
  </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
      <el-footer><i class="icon-play"></i>Footer</el-footer>
    </el-container>
  </div>
</template>
<script>
import myjs from './myjs'
/* eslint-disable */
export default {
  name: 'app',
  runtimeCompiler: true,
  data () {
    return {
      fullScreen: false,
      rmtHref: '',
      wdwidth:"100px",
       editableTabsValue: '2',
        editableTabs: [{
          title: 'Tab 1',
          name: '1111',
          content: 'Tab 1 <pre>con\nte\nnt</pre>'
        }, {
          title: 'Tab 2',
          name: '2222',
          content: 'Tab 2 content'
        }],
        tabIndex: 99,
      isCollapse: true,
      activeIndex2: '2-0',
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      value: '',
      drawer: false,
      direction: 'rtl',
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    handleCommand (command) {
      if (-1 < String(command).indexOf('/conn/')){
          this.rmtHref = command
      }
    },
    handleClose1 (done) {
      done()
    },
    fnMinWin () {
      myjs.fnMinWin('xFw')
    },
    fnMaxWin () {
      myjs.fnMaxWin('xFw')
    },
    fnFsc () {
      myjs.fnFullScreen('xFsc')
    },
    fltFunc (s) {// 下拉列表过滤
      if ("" != s) {
        s = String(s).toLowerCase()
        if (!this.oldOtp) this.oldOtp = this.options
        this.options = this.oldOtp.filter(item => {
          return item.label.toLowerCase().indexOf(s) > -1 || item.value.toLowerCase().indexOf(s) > -1;
        });
      } else { this.options = this.oldOtp; }
    },
    handleOpen (key, keyPath) {
      this.isCollapse = !this.isCollapse;
      console.log(key, keyPath);
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath);
    },
    handClickMm () {
      console.log(arguments)
    }
  }
}
</script>
<style lang="less">
@import url("//unpkg.com/element-ui@2.15.7/lib/theme-chalk/index.css");
@import url("css/font-awesome.css");

body {
  margin: 0
}
.winCtrl{
  float: right;
  position: relative;
  top:-15px;
}

.maxWin {
  position: fixed;
  float: left;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index:999999
}

.winCtrl i{margin:3px !important;cursor:pointer}
.ifrm{
border:0;
margin: 0;
padding: 0;
width:100%;
height:100%;
}
.el-card__body {
  padding:20px 0 0 0;
  width:100%;
  height:100%
}
.el-header {
  width: 100vw;
  padding: 0;
  padding:0;
}

.el-menu-demo {
  padding-left: 65px
}

.el-drawer {
  z-index: 99999;
  height: calc(-100px + 100vh);
  margin-top: 60px
}

.myscrollbar {
  height: 100%;
}

.myscrollbar>.el-scrollbar__wrap {
  overflow-x: hidden;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}
</style>