<template>
  <div id='wrapper' v-bind:style="{height: this.height + 'px'}">
    <div class="control">
      <input class="input" type="text" placeholder="Search" v-model="search" v-on:blur="cleanSearch">
    </div>
    <ul>
      <li v-for="item in searchViewer" :key="item">{{item}}</li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: ['height'],
    computed: {
      viewers () {
        return this.$store.state.chat.viewers
      },
      searchViewer () {
        var search = this.search.trim().toLowerCase()
        if (search === '') {
          return Object.keys(this.$store.state.chat.viewers)
        } else {
          return Object.keys(this.$store.state.chat.viewers).filter(
            function (s) { return s.toLowerCase().indexOf(search) > -1 }
          )
        }
      }
    },
    data () {
      return {
        search: ''
      }
    },
    methods: {
      cleanSearch: function (e) {
        this.search = ''
      }
    },
    mounted () {
    }
  }
</script>

<style scoped>
  #wrapper {
    padding: 5px;
    overflow-y: auto !important;
  }
</style>
