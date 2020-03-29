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
            <selfTable class="sample-class-table" :loading="loading" :columns="sampleCol" :data="sampleData"  @update="update"></selfTable>
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
            sampleCol:[],
            sampleData:[],
            loading:false,
            //pageSize:100
      }
    },
    beforeRouteUpdate:function (to, from, next) {
      //console.log('to.params',to.params);
      //console.log('beforeRouteUpdate',to.query);
      //this.$bus.$emit('submit-search', {params: to.params, query: to.query});
      next();
    },
    components: {
      Step,
      selfTable
    },
    methods:{
      init(){
        let tempSampleData = JSON.parse(localStorage.getItem("sampleData"));
        
        if(tempSampleData)
          this.sampleData = tempSampleData;

        this.experimentType = localStorage.getItem('selectedExperimentType')
        this.sampleNumber  = +localStorage.getItem("samplesNum")
        this.fractionNumber = +localStorage.getItem("fractionsNum")
        this.trNumber = +localStorage.getItem("trNum")
      },
      async getSampleAttributes(){
          this.loading=true
          this.sampleData=[]
          this.sampleCol=[
              {
                  name:'Accession',
                  key:'accession',
                  required:true,
              },
          ]
          try{
              let res = await this.$Api.getSampleAttributes()
              this.loading = false
              let sampleDataItem={};//temp sampledata item for table rows
              for(let i=0; i<res.body.length; i++){
                  if(res.body[i].first == this.experimentType){
                      let item = {
                        experimentType:res.body[i].first,
                        required: res.body[i].second == 'REQUIRED'? true:false,
                        cvLabel:res.body[i].third.cvLabel.toLowerCase(),
                        accession:res.body[i].third.accession,
                        name:this.titleCase(res.body[i].third.name),
                        orignal_name:res.body[i].third.name,
                        key: this.titleCase(res.body[i].third.name).toLowerCase().replace(/\s/ig,''),
                      }
                      //we are creating sample table columns
                      if(item.required)
                        this.sampleCol.push(item);
                      this.newData.push(item);
                      //we are creating sample table rows
                      //sampleDataItem.accession={};//we will apply for the value for ac
                      sampleDataItem[item.key]={
                          value:'',
                          dropdown:false,
                          accession:'null',
                          accessionKey:this.accessionKey,
                          cvLabel:'null',
                          col:item,
                          icon:'',
                          checked:true,
                      }
                  }
              }
              let projectAccession = localStorage.getItem("projectAccession")
              if(!projectAccession){
                  for(let k=0; k<this.sampleNumber * this.fractionNumber; k++){
                        let item = JSON.parse(JSON.stringify(sampleDataItem))
                        item.accession={
                            value:"PXD_S"+(k+1),
                            dropdown:false,
                            accession:'null',
                            accessionKey:this.accessionKey++,
                            cvLabel:'null',
                            col:this.sampleCol[0],
                            icon:'',
                            checked:true,
                        }
                        //if(item.col.required)
                          this.sampleData.push(item)
                  }    
              }
          }
          catch(e){
              this.loading = false
              this.$Message.error({content:'Can not query Data', duration:3});
          }
      },
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
      confirm(){
          let results = [];
          let tempAccession='';
          let sampleDataCheckPass=true;
          let msRunCheckPass= true;
          console.log('this.sampleData',this.sampleData);
          console.log('this.msRunArray',this.msRunArray)
          //check for sample data completed
          for(let i=0; i<this.sampleData.length; i++){
              for(let j in this.sampleData[i]){
                    if(j=='accession'){
                        tempAccession = this.sampleData[i][j];
                        continue;
                    }
                    else if(j=="accessionKey"){
                      continue;
                    }
                    else{
                        if(!this.sampleData[i][j].value && this.sampleData[i][j].col.required){
                            sampleDataCheckPass=false;
                            this.sampleData[i][j].checked=false;
                        }
                        else{
                             this.sampleData[i][j].checked=true;
                        }
                    }
              }
          }
          console.log('sampleDataCheckPass',sampleDataCheckPass);
          console.log('msRunCheckPass',msRunCheckPass);
          if(sampleDataCheckPass){
          //if(true){
              console.log('pass');
              let submitData = [];
              for(let i=0; i<this.sampleData.length; i++){
                  let item = {};
                  item.projectAccession = this.$route.params.id;
                  item.sampleAccession = this.sampleData[i].accession.value;
                  item.sampleProperties = [];
                  for(let j in this.sampleData[i]){
                      let sampleItem = {};
                      if(j == 'accession' || j == 'accessionKey' || j == 'disable')
                        continue;
                      else{
                          sampleItem.key={};
                          sampleItem.key.accession=this.sampleData[i][j].col.accession; 
                          sampleItem.key.cvLabel=this.sampleData[i][j].col.cvLabel;
                          sampleItem.key.name=this.sampleData[i][j].col.name;
                          sampleItem.key.value=this.sampleData[i][j].col.orignal_name;
                          sampleItem.value={};
                          sampleItem.value.accession=this.sampleData[i][j].accession;
                          sampleItem.value.cvLabel=this.sampleData[i][j].cvLabel;
                          sampleItem.value.name=this.sampleData[i][j].col.name;
                          sampleItem.value.value=this.sampleData[i][j].value;
                          item.sampleProperties.push(sampleItem);
                      }  
                  }
                  item.msrunProperties = [];//TODO 
                  let sampleLable={
                      accession: this.msRunArray[i].label.accession,
                      cvLabel: this.msRunArray[i].label.cvLabel,
                      name: this.msRunArray[i].label.value,
                      value: ''
                  }
                  item.sampleLabel = sampleLable;
                  let labelReagent = {
                      accession: this.msRunArray[i].labelReagent.accession,
                      cvLabel: this.msRunArray[i].labelReagent.cvLabel,
                      name: this.msRunArray[i].labelReagent.value,
                      value: ''
                  }
                  item.labelReagent = labelReagent;

                  if(!this.sampleData[i].disable)
                    submitData.push(item);
              }
              let sendData = {};
              sendData.SampleMSRunTable = {};
              sendData.SampleMSRunTable.sampleMSRunRows = submitData;
              console.log('sendData',sendData)
              this.$http
                  .put(this.updateSampleApi,sendData,{
                    headers: {
                      'Authorization':'Bearer '+ localStorage.getItem('token')
                    }
                  })
                  .then(function(res){
                    console.log('success',res);
                    this.$Message.success({content:'Annotation Success', duration:1});
                    localStorage.clear();
                    this.$router.push({path:'/annotation'});
                  },function(err){
                    console.log('err',err);
                    if(err.body.error == 'TOKEN_EXPIRED'){
                        this.logout();
                    }
                    this.$Message.error({content:'Annotation Error', duration:1});
                  });
          }
          else{
            this.$Message.error({content:'Fill required content', duration:1});
          }
      },
      update(){

      },
      save(){
          let sampleDataStr = JSON.stringify(this.sampleData);
          if(this.sampleData.length>0)
            this.localStorageItemAdd('sampleData', sampleDataStr);

          localStorage.setItem('projectAccession',this.$route.params.id);
          localStorage.setItem('selectedExperimentType',this.experimentType);
          localStorage.setItem('samplesNum',this.sampleNumber);
          localStorage.setItem('fractionsNum',this.fractionNumber);
          localStorage.setItem('trNum',this.trNumber);

          this.$Message.success({content:'Save Successfully', duration:1});
          //let sampleDataB64 = Base64.encode(sampleDataStr)  TODO for backend.
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
