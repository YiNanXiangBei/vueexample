<template>
<div class="">
  <el-container>
    <el-header height="250px" style="background: #fff">
      <el-carousel indicator-position="outside" height="180px" style="margin-top: 20px; background: #67C23A">
        <el-carousel-item v-for="item in 4" :key="item">
          <h3>{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
    </el-header>
    <el-container>
      <el-main style="height:500px; text-align:center; display:table-cell;vertical-align:middle;">
        <img :src="src" alt="" class="image" style="height: 200px; width: 100%; ">
        <el-upload
          class="upload-demo"
          action="#"
          :before-upload="handleChange"
          style="margin-top: 30px"
          >
          <el-button size="small" type="primary"  v-loading.fullscreen.lock="fullscreenLoading">上传图片<i class="el-icon-upload el-icon--right"></i></el-button>
        </el-upload>
        <div style="margin-top: 30px">
          <p v-for="(message, index) in messages" :key="index">
            <el-tag type="success" v-show="isShow">{{message.name}}</el-tag>
            <el-tag type="info" v-show="isShow">{{message.label}}</el-tag>
          </p>
          <el-tag type="danger" v-show="errorShow">{{error}}</el-tag>
        </div>
      </el-main>
    </el-container>
  </el-container>
</div>
</template>

<script>
import md5 from 'js-md5'
var Base64 = require('js-base64').Base64
import axios from 'axios'
const qs = require('qs')
export default {
  name: 'HelloWorld',
  data () {
    return {
      appid: '',
      appkey: '',
      image: '',
      src: '',
      isShow: false,
      fullscreenLoading: false,
      messages: [

      ],
      error: '',
      errorShow: false
    }
  },
  methods: {
    queryPic() {
      let datas;
      let timestamp = Date.parse(new Date()).toString();
      timestamp = timestamp.substring(0, 10);
      let nonce_str = Math.random().toString(36).substr(2);
      let params = {
        app_id : this.appid,
        time_stamp: timestamp,
        nonce_str: nonce_str,
        scene: '2',
        image: ''
      }
      params.image = this.image;
      let result = objKeySort(params);

      result = Object.keys(result).map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(result[key]);
      }).join("&");
      result = result + '&app_key=' + this.appkey
      result = md5(result).toUpperCase();
      params.sign = result;
      let _this = this;
      axios({
        url: 'api/fcgi-bin/vision/vision_imgidentify',
        method: 'post',
        data: params,
        transformRequest: [
          function (params) { // 解决传递数组变成对象的问题
            Object.keys(params).forEach((key) => {
              if ((typeof params[key]) === 'object') {
                params[key] = JSON.stringify(params[key]) // 这里必须使用内置JSON对象转换
              }
            })
            params = qs.stringify(params) // 这里必须使用qs库进行转换
            return params
          }
        ],
        transformResponse: [function (data) {
          //处理返回数据问题，异步
        // Do whatever you want to transform the data
          console.log(data);
          data = JSON.parse(data);
          if(data.msg === 'ok') {
            for(var i=0; i< 3; i++) {
              var mem = {
                'label' : '置信度：' + toPercent(data.data.tag_list[i].label_confd),
                'name' : data.data.tag_list[i].label_name
              };
              _this.messages[i] = mem;
            }
            _this.isShow = true;
          } else {
            _this.errorShow = true;
            _this.error='没有找到这种植物';          
          }
          _this.fullscreenLoading = false;
          return data;
        }],
      })
      
    },
    handleChange(file) {
      this.isShow = false;
      this.errorShow = false;
      this.fullscreenLoading = true;
      if (file.size > 1024 * 1024) {
        alert('上传图片大小不能超过1M')
      }
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        this.src = e.target.result;
        this.image = e.target.result.toString().split(',')[1];
        this.queryPic();
      };
    }
  }
}

function objKeySort(arys) { 
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newkey = Object.keys(arys).sort();　　 
    var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
    for(var i = 0; i < newkey.length; i++) {
        //遍历newkey数组
        newObj[newkey[i]] = arys[newkey[i]]; 
        //向新创建的对象中按照排好的顺序依次增加键值对

    }
    return newObj; //返回排好序的新对象
};

function toPercent(num) {
  return ((num * 10000)/100).toFixed(2) + '%';
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}


</style>
