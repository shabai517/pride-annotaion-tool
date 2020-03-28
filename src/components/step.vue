<template>
  <div class="step-wrapper">
      <Steps :current="step">
          <Step title="Search" content="Find your project to annotate"></Step>
          <!-- <Step title="Check" content="Confirm your project information"></Step> -->
          <Step title="Sample" content="Give the number of samples"></Step>
          <Step title="Annotate" content="Add the raw file"></Step>
      </Steps>
      <p class="des">
        {{des}}
      </p>
  </div>
</template>

<script>
  export default {
    name: 'step',
    props:['step','des'],
    data(){
        return {
           
        }
    },
    mounted: function(){
    
    },
    created(){
      
    },
    beforeDestroy(){
          
    },
  }
</script>



<style scoped>
   .des{
      margin-top: 30px;
   }
</style>
