<template>
  <div class="hello">
    <div>
      <!-- <label for="appid">App_Id:</label>
      <input type="text" id="appid" v-model="appid"/>

      <label for="appkey">App_Key:</label> 
      <input type="text" id="appkey" v-model="appkey"/> -->

      <label for="pic">上传图片:</label>
      <input type="file" id="pic" @change="triggleFile" accept="image/*"/>

      <button @click="queryPic">查询</button>
    </div>
    <div>
      <p v-for="(message, index)  in messages" :key="index">
        {{message.label_confd}}, {{message.label_name}}
      </p>
    </div>
    
    
    
  </div>
</template>

<script>
import md5 from 'js-md5';
var Base64 = require('js-base64').Base64;
import axios from 'axios';
const qs = require('qs');
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      appid: '',
      appkey: '',
      messages: '',
      image: ''
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
          data = JSON.parse(data)
          _this.messages = data.data.tag_list;
          datas = data;
          return data;
         
        }],
      })
    },
    triggleFile(event) {
      //处理上传图片问题
      let file = event.target.files[0];
      console.log(file)
      console.log(file.size)
      if (file.size > 1048576) {
        alert('上传图片大小不能超过1M')
      }
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        // console.log(e.target.result.toString().split(',')[1])
        this.image = e.target.result.toString().split(',')[1];
        // console.log(e.target.result);
      }
      
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
