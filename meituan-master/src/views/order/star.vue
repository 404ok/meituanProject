<!--选择评分-->
<template>
  <div class="star-container">
    <i :class='["iconfont", "star",item? "active":"no-active"]' v-for="(item,index) in score" @click="makeScore(item,index)" :key="index">&#xe70a;</i>
   
  </div>
</template>

<script>
  export default {
    data(){
      return {
        score:[1,0,0,0,0]   //默认1分
      }
    },
    methods:{
      makeScore(item,index){
        let scoreIndex = item == 1? 0 : 1; 
        this.score.splice(index,1,scoreIndex)
        let sum = 0;
        this.score.forEach(function(item){
          sum += item;
        })
        this.$emit('makeScore', sum);
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../../style/mixin";
  .star-container{
    display: flex;
    justify-content: center;
    @include px2rem(height,140);
    margin:0 0.5rem;
    padding:0.5rem 0;
    border-top:1px solid $mtGrey;
    text-align: center;
    .star{
      margin:0 0.1rem;
    }
    .active{
      color:$mtYellow;
    }
    .no-active{
      color:#999;
    }
  }
</style>
