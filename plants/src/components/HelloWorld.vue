<template>
<div class="">
  <el-container>
    <el-header height="250px">
      <el-carousel indicator-position="outside" height="180px" style="margin-top: 20px;">
        <el-carousel-item v-for="(url, index) in urls" :key="index">
          <img :src="url" alt="" style="height: 100%; width: 100%">
        </el-carousel-item>
      </el-carousel>
    </el-header>
    <el-container>
      <el-main style="height:500px; text-align:center; display:table-cell;vertical-align:middle;">
        <img :src="src" alt="" class="image" style="height: 200px; width: 100%; ">
        <el-upload
          class="upload-demo"
          action="strings"
          :multiple=false
          :http-request="uploadFile"
          :file-list = []
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
import Resize from '../../static/resize.js'
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
      errorShow: false,
      uploaddata: {

      },
      urls: [

      ]
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
          data = JSON.parse(data);
          if(data.msg === 'ok') {
            for(var i=0; i< 1; i++) {
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
          _this.getUrls();
          return data;
        }],
      })
      
    },
    uploadFile: function(item) {
      this.fullscreenLoading = true;
      this.isShow = false;
      this.errorShow = false;
      let file = item.file;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        this.src = e.target.result;
        this.uploaddata.pic = e.target.result.toString().split(',')[1];
        this.uploaddata.fileName = file.name;
        let _this = this;
        axios({
          url: 'http://api.wongwongsu.com/api/v1/images',
          method: 'post',
          data: this.uploaddata,
          transformRequest: [
            function (uploaddata) { // 解决传递数组变成对象的问题
              Object.keys(uploaddata).forEach((key) => {
                if ((typeof uploaddata[key]) === 'object') {
                  uploaddata[key] = JSON.stringify(uploaddata[key]) // 这里必须使用内置JSON对象转换
                }
              })
              uploaddata = qs.stringify(uploaddata) // 这里必须使用qs库进行转换
              return uploaddata
            }
          ],
          transformResponse: [function (data) {
            //处理返回数据问题，异步
          // Do whatever you want to transform the data
            data = JSON.parse(data);
            if(data.code == 201) {
              _this.image = data.data.base64;
              // console.log(_this.image)
              _this.queryPic();
            } else {
              console.log(data);
            }
            return data;
          }],
        })
      };
    },
    getUrls: function() {
      let _this = this;
      axios.get('http://api.wongwongsu.com/api/v1/urls').then(function(response){  
        _this.urls = response.data.data.urls;
      }).catch(function (response){  
        console.log(response);//发生错误时执行的代码  
      }); 
    }
  },
  mounted() {
     this.getUrls();
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
