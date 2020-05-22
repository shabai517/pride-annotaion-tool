<template>
  <div class="srdf-container">
      <div class="browse-data-container">
          <Row style="margin-bottom: 20px">
              <div class="title">
                 Omics Sample to Data Annotation Tool
              </div>
              <div class="upload">
                <a href="javascript:;" class="file">
                    <i class="ivu-icon ivu-icon-ios-cloud-upload-outline"></i><span style="margin-left: 5px;">Upload SRDF File</span>
                    <input type="file" name="" id="file" @change="readFile">
                </a>
              </div>
          </Row>
          <!-- <Row>
              <Card>
                <p slot="title">Omics SDRF Reader</p>
                <div class="table-container">
                    <Table stripe border ref="selection" :height='tableHeight'  :loading="fileListLoading" :columns="fileListCol" :data="fileList" ></Table>
                </div>
              </Card>
          </Row>  -->
          <Row>
                <selfTable :name="name" :height='tableHeight' :loading="loading" :columns="sampleCol" :addedCol="addedCol" :data="sampleData"></selfTable>
                <div class="button-wrapper">
                <div class="search-button">
                    <Button type="primary" @click="back">Back</Button>
                </div>
                <div v-if="sampleCol.length>0 && sampleData.length>0" class="search-button right">
                    <Button type="primary" @click="annotationSave">Save</Button>
                    <Button type="primary" @click="annotationConfirm">Confirm</Button>
                </div>
            </div>
          </Row>
      </div>
  </div>
</template>
<script>
  var fs = require("fs");
  import selfTable from '@/components/table.vue'
  export default {
    name: 'srdf',
    data(){
      return {
           name:'Omics SDRF Reader',
           loading:false,
           sampleCol:[],
           sampleData:[],
           keyList:[],
           addedCol:[],
           screenHeight: document.documentElement.clientHeight,
           getTableDataAPI:this.$store.state.baseApiURL + '/properties/getPropertiesFromText',
           getAddedColAPI:this.$store.state.baseApiURL + '/properties/getProperties',
      }
    },
    beforeRouteUpdate:function (to, from, next) {

    },
    components: {
      selfTable
    },
    methods:{
      readFile(event){
        var files = event.target.files || event.dataTransfer.files;
        if (!files.length)
          return;

        let reader = new FileReader();
        reader.readAsText(files[0],'UTF-8');
        this.loading=true
        // this.$set
        this.sampleCol=[]
        this.sampleData=[]
        this.keyList=[]
        this.addedCol=[]
        reader.onload =  async (e)=> {
            try{
                let arr = e.currentTarget.result.split('\n');
                // this.sampleData = []
                for(let i in arr){
                    if(i == 0){ //for first row which is the col in the table
                      let header = arr[i].split('\t');
                      let properties = ''
                      for(let j in header){
                          // if(header[j].match(/\[/))
                            properties+=(header[j]+', ')
                      }
                      let sdrf_properties = properties.slice(0,properties.length-2)
                      let query = {
                          sdrf_properties:sdrf_properties,
                          // sdrf_properties:'Characteristics[organism], Characteristics[organism part], Characteristics[age], Characteristics[developmental stage], Characteristics[sex], Characteristics[disease], Characteristics[individual], comment[fraction identifier], comment[file uri], comment[instrument], comment[label], comment[cleavage agent details], comment[modification parameters], comment[modification parameters], comment[precursor mass tolerance], comment[fragment mass tolerance], comment[data file]',
                        }
                      let results = await this.$http.get(this.getTableDataAPI,{params: query})
                      // this.sampleCol = []
                      this.sampleCol.push({
                          name: '#',
                          key: 'index',
                          // align: 'center',
                          required: true,
                      })
                      //console.log('results',results)
                      for(let i in results.body){
                        let item = {
                          name:results.body[i].freeTextColumn,
                          key:results.body[i].freeTextColumn.replace(/\s+/g,"") + Math.floor(100000 + Math.random() * 900000),
                          required:false,
                          typeNode:results.body[i].templateColumn.typeNode ? results.body[i].templateColumn.typeNode : '',
                          ontologyTerm:results.body[i].templateColumn.ontologyTerm ? results.body[i].templateColumn.ontologyTerm : null,
                          searchable:results.body[i].templateColumn.searchable
                        }
                        this.keyList.push(item)
                        this.sampleCol.push(item)
                      }
                    }
                    else{ //for the table data
                      if(!arr[i]){
                        this.$Modal.warning({
                              title: 'WARNING',
                              content: '<p>The current file has some empty lines and the end, please remove it. Check specification</p>',
                              onOk: () => {
                                  
                              },
                          });
                        continue
                      }
                      let body = arr[i].split('\t');
                      let item = {}
                      for(let j in body){
                          item.index=parseInt(i)
                          item[this.keyList[j].key]={
                            value:body[j],
                            checked:true,
                            active:false,
                            required:this.keyList[j].required
                          }
                          //console.log('item',item)
                      }
                      this.sampleData.push(item)
                    }  

                }
                let tempAddedCol = await this.$http.get(this.getAddedColAPI)
                for(let i in tempAddedCol.body){
                    tempAddedCol.body[i].key = tempAddedCol.body[i].name.replace(/\s+/g,"") + Math.floor(100000 + Math.random() * 900000),
                    tempAddedCol.body[i].required = false
                }
                this.addedCol = tempAddedCol.body
                // console.log('addedCol',this.addedCol)
                this.loading=false

                //reset value for loading the same file
                event.target.value = ''
                //console.log(this.sampleCol,this.sampleData)
                //this.$forceUpdate()
            }
            catch(e){
              this.$Message.error({content:'File Read Error', duration:2});
              console.log(e)
            }
        };
      },
      setClassName(name){
        if(name.match('sourcename') || name.match('characteristics'))
          return 'blue'
        else if(name.match('assayname') || name.match('comment'))
          return 'green'
        else
          return 'red'
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
          this.$router.push({name:'index'});
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
      getTableData(){
          console.log('getTableData sampleCol',this.sampleCol)
          let query = {
            sdrf_properties:'characteristics[organism], characteristics[organism part]',

          }
          this.$http
              .get(this.getTableDataAPI,{params: query})
              .then(function(res){
                 console.log(res.body)
                
                  // if(res.body._embedded && res.body._embedded.files){
                   
                  // }
                  // else{
                  //     this.$Message.error({content:'No Files', duration:1});
                  // }
              },function(err){
                  this.fileListLoading = false;
              });
      },
    },
    watch: {

    },
    computed:{
      tableHeight:function(){
        let minHeight = 300
        return this.screenHeight - 90*2 - 138 - 20 - 55 - 16*2 > minHeight ? this.screenHeight - 90*2 - 138 - 20 - 55 - 16*2 : minHeight
      }
    },
    mounted: function(){
        window.onresize = () => {
          this.screenHeight = document.documentElement.clientHeight
        }
    },
    created(){

    },
    beforeDestroy(){

    },

  }
</script>

<style scoped>
  .browse-data-container{
    width: 80%;
    margin:0 auto;
    padding: 90px 0;
  }
  .title{
    font-size: 35px;
    color: #454548;
    margin-bottom: 50px;
  }
  .file {
      position: relative;
      display: inline-block;
      background: white;
      border: 1px solid #2d8cf0;
      border-radius: 4px;
      padding: 4px 12px;
      overflow: hidden;
      color: #2d8cf0;
      text-decoration: none;
      text-indent: 0;
      line-height: 20px;
  }
  .file input {
      position: absolute;
      font-size: 100px;
      right: 0;
      top: 0;
      opacity: 0;
  }
  .file:hover {
      background: #2d8cf0;
      border-color: #2d8cf0;
      color: white;
      text-decoration: none;
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
</style>
<style >
.table-container .ivu-table-header table{
  width: 100% !important;
}
.table-container .ivu-table-body table{
  width: 100% !important;
}
th.blue{
    background-color: #84bafd !important;
    color: white !important;
}
th.green{
    background-color: #96d810 !important;
    color: white !important;
}
th.red{
    background-color: #ea7e7c !important;
    color: white !important;
}
</style>
