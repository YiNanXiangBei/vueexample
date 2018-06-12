<template>
<div class="container-fluid">
  <div class="hello row">
    <div class="col-xs-12 col-sm-12 col-md-12 show-image">
     <div>
      <img :src="src" alt="" class="image">      
      </div>
      <div class="pic-label">
        <input type="file" id="pic" @change="triggleFile" accept="image/*" name="pic" class="input_file"/>
        <label for="pic" class="btn btn-info btn-block">从相册中选择</label>
      </div>
    </div>
    <div class="show-all">
      <div class="show-result">
      {{name}}
      </div>
      <p>{{label}}</p>
    </div>
    
  </div>
</div>
</template>

<script>
import md5 from 'js-md5'
var Base64 = require('js-base64').Base64
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
const qs = require('qs')
export default {
  name: 'HelloWorld',
  data () {
    return {
      appid: '',
      appkey: '',
      image: '',
      src: '',
      label: '',
      name: ''
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
        // sign: '',
        scene: '2',
        image: ''
      }
      params.image = this.image;
      let result = objKeySort(params);

      result = Object.keys(result).map(function (key) {
        // body...
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
          _this.label = '置信度：' + toPercent(data.data.tag_list[0].label_confd);
          _this.name = data.data.tag_list[0].label_name;
          
          return data;
         
        }],
      })
      
    },
    triggleFile(event) {
      //处理上传图片问题
      let file = event.target.files[0];
      if (file.size > 1024 * 1024) {
        alert('上传图片大小不能超过1M')
      }
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        // console.log(e.target.result.toString().split(',')[1])
        this.src = e.target.result;
        this.image = e.target.result.toString().split(',')[1];
        // console.log(e.target.result);
        this.queryPic();
      };

    }
  }
}

function objKeySort(arys) { 
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newkey = Object.keys(arys).sort();　　 
    //console.log('newkey='+newkey);
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
.input_file {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
}

.image {
  padding: 3px;
  margin-top: 10% ;
}

.pic-label {
  position: relative;
  bottom: 5%
}

.show-result {
  display: inline-block;
  width: 192px;
  height: 148px;
  background-image: url(../assets/icon.png);
  background-position: 0 0;
  font-style: normal;
  padding-top: 58px;
  box-sizing: border-box;
}

.show-all {
  font-size: 22px;
  color: #ffffff;
  position: absolute;
  top: 43%;
  left: 45%;
}

.show-image {
  position: relative;
  
}

.image {
  background-color: #000;
  transition: opacity .5s; 
  opacity: 1;
  width: 50%;
  height: 50%
}
</style>
