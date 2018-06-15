<template>
  <div id="app">
    <Menubar></Menubar>
    <router-view></router-view>
  </div>
</template>

<script>
  import Menubar from './components/Menubar'
  export default {
    name: 'nanaba',
    components: { Menubar },
    mounted () {
      document.addEventListener('drop', event => event.preventDefault())
    }
  }
</script>

<style>
  * {
    overflow: hidden !important;
  }
</style>
