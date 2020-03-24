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
          <Row>
            <Card>
                  <p slot="title">Omics SDRF Reader</p>
                  <div class="table-container">
                      <Table stripe border ref="selection" :height='tableHeight'  :loading="fileListLoading" :columns="fileListCol" :data="fileList" ></Table>
                  </div>
                </Card>
          </Row>
      </div>
  </div>
</template>
<script>
  var fs = require("fs");
  export default {
    name: 'srdf',
    data(){
      return {
           fileListLoading:false,
           fileListCol:[
           ],
           fileList:[],
           keyList:[],
           screenHeight: document.documentElement.clientHeight
      }
    },
    beforeRouteUpdate:function (to, from, next) {

    },
    components: {

    },
    methods:{
      readFile(e){
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length)
          return;

        let that = this
        let reader = new FileReader();
        reader.readAsText(files[0],'UTF-8');
        this.fileListLoading=true
        reader.onload = function (e) {
            let arr = this.result.split('\n');
            for(let i in arr){
                if(i == 0){
                  let header = arr[i].split('\t');
                  that.fileListCol.push({
                      type: 'index',
                      width: 80,
                      align: 'center'
                  })
                  for(let j in header){
                      let item = {
                        title:header[j],
                        key:header[j].replace(/\s+/g,""),
                        className:that.setClassName(header[j].replace(/\s+/g,"")),
                        width:300
                      }
                      that.keyList.push(item.key)
                      that.fileListCol.push(item)
                  }
                }
              else{
                let body = arr[i].split('\t');
                let item = {}
                for(let j in body){
                    item[that.keyList[j]]=body[j]
                }
                that.fileList.push(item)
              }
            }
            that.fileListLoading=false
            // for(let i in header)
            // console.log(header)
            //document.getElementById("result").innerHTML += urlData;
        };

          // var inputElement = document.getElementById("file");
          // inputElement.addEventListener("change", (e)=>{
          //   console.log(e)
          // }, false);
      },
      setClassName(name){
        if(name.match('sourcename') || name.match('characteristics'))
          return 'blue'
        else if(name.match('assayname') || name.match('comment'))
          return 'green'
        else
          return 'red'
      },
    },
    watch: {

    },
    computed:{
      tableHeight:function(){
        let minHeight = 400
        return this.screenHeight - 90*2 - 138 - 20 - 55 - 16*2 > minHeight ? this.screenHeight - 90*2 - 138 - 20 - 55 - 16*2 : minHeight
      }
    },
    mounted: function(){
        var that = this
        window.onresize = function () {
          that.screenHeight = document.documentElement.clientHeight
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
