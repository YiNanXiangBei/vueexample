<template>
  <div id="app">
    <!-- <div class="image" style="height: 100px">
      <img src="./assets/header.jpg" style="width:100%;overflow: hidden;" alt="">
    </div> -->
    <HelloWorld/>
  </div>
</template>

<script>
import Vue from 'vue'
import HelloWorld from './components/HelloWorld'
export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
} */
</style>
