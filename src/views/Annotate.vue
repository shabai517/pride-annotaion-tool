<template>
  <div class="annotate-container">
      <div class="browse-data-container">
          <Row>
              <div class="title">
                  SDRF Annotation Tool
              </div>
              <div class="step-wrapper">
                  <Step :step="annotationStep" :des="stepDes"></Step>
              </div>
          </Row>
          <Row>
            <selfTable class="sample-class-table" ></selfTable>
            <div class="button-wrapper">
                <div class="search-button">
                    <Button type="primary" @click="back">Back</Button>
                </div>
                <div class="search-button right">
                    <Button type="primary" @click="annotationSave">Save</Button>
                    <Button type="primary" @click="annotationConfirm">Confirm</Button>
                </div>
            </div>
          </Row>
         
      </div>
  </div>
</template>

<script>
  import Step from "@/components/step.vue"
  import selfTable from '@/components/table.vue'
  //var paramsFromLandingPage='';
  export default {
    name: 'annotate',
    data(){
      return {
            annotationStep:2,
            stepDes:'Here is used to put the explanation about steps',
            title:'',
            keyword:'',
            total:0,
            //pageSize:100
      }
    },
    beforeRouteUpdate:function (to, from, next) {
      console.log('to.params',to.params);
      console.log('beforeRouteUpdate',to.query);
      //this.$bus.$emit('submit-search', {params: to.params, query: to.query});
      next();
    },
    components: {
      Step,
      selfTable
    },
    methods:{
      back(){
        let projectAccession = localStorage.getItem("projectAccession")
        if(projectAccession){
            this.$Modal.confirm({
                title: 'Uncompleted Annotaion',
                content: '<p>Do you want to delete the uncompleted annotation?</p>',
                onOk: () => {
                    localStorage.clear();
                    this.$router.push({name:'index'});
                },
                onCancel: () => {
                   
                }
            });
        }
        else
          this.$router.push({path:'/sample/'+this.$route.params.id});
      },
      annotationConfirm(){
          this.$Modal.confirm({
              title: 'Finish Annotation',
              content: '<p>Do you want to submit this annotation?</p>',
              onOk: () => {
                  this.$bus.$emit('annotation-confirm');
              },
              onCancel: () => {
                  
              }
          });
      },
      annotationSave(){
          this.$bus.$emit('annotation-save');
      },
      localStorageCheck(){
          var tempProjectAccession = localStorage.getItem("tempProjectAccession");
          if(tempProjectAccession &&  tempProjectAccession!= this.$route.params.id){
            this.$Message.error({content:'Wrong Project Accession', duration:1});
            this.$router.push({path:'/annotation'});
          }

          let sampleNumber = +localStorage.getItem("samplesNum")
          let fractionNumber = +localStorage.getItem("fractionsNum")
          this.total = sampleNumber * fractionNumber;
      },
    },
    watch: {

    },
    computed:{
  
    },
    mounted: function(){
      this.localStorageCheck();
      //this.queryConfig();
      //this.updateCondition();//move into queryConfig function
      //this.queryArchiveProjectList();//move into queryConfig function
      //this.setFilter();//move into queryConfig function
      //this.searchInputListener();
    },
    created(){
      
    },
    beforeDestroy(){
          
    },
    // beforeRouteEnter(to,from,next){
    //   //console.log('from',from);
    //   if(from.name == 'landingpage' && from.params.keyword)
    //     paramsFromLandingPage = from.params.keyword;
    //   next(vm=>{
    //     let username = localStorage.getItem('username') || '';
    //     if(!username){
    //       vm.$Message.error({content:'Please Login', duration:2})
    //       vm.$router.push({name:'annotation'})
    //     }
    //   });
    // }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>  
  .annotate-container{
    width: 100%;
  }
  .title{
    font-size: 35px;
    color: #454548;
    margin-bottom: 50px;
  }
  .step-wrapper{
    margin-bottom: 50px;
  }
  .button-wrapper{
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  .search-button.right{
    display: flex;
    width: 180px;
    justify-content: space-between;
  }
  .search-button button{
    width: 85px;
  }
  .browse-data-container{
    width: 80%;
    margin:0 auto;
    padding: 90px 0;
  }
  .input-number{
    width: 60px;
  }
  .modal-column-name{
    font-size: 14px;
    color: #5bc0be;
    font-weight: bold;
    margin-bottom: 15px;
  }
  .new-column-checkbox{
        display: flex;
        flex-direction: column;
  }
  .checkbox-item-wrapper{
    display: flex;
  }
  .sample-class-table{
    margin-bottom: 20px;
  }
  
</style>
<style > 
 /* .annotation-page a{
    text-decoration:none !important;
    border-bottom-style:none !important;
  }*/
</style>
