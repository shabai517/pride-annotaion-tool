<template>
  <div class="check-dataset-container">
      <div class="title">
          Welcome to Pride Annotation System
      </div>
      <Step :step="annotationStep" :des="stepDes"></Step>
      <Card class="card">
        <p slot="title">Search</p>
        <div class="search-container">
          <div>
            <span class="name">Accession</span><Input v-model="keyword" size="small" style="width: 150px; margin-right: 10px"></Input> 
            <Icon type="md-arrow-round-forward" style="margin-right: 10px"/>
            <span class="name">Database</span>
            <Select v-model="database" size="small" style="width:150px">
                <Option v-for="item in databaseArray" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </div>
          <Button type="primary" size="small" @click="search">Search</Button>
        </div>
      </Card>
      <div v-if="false">
          <Card class="card temp-card">
            <p slot="title">Project</p>
                No Data
          </Card>
      </div>
      <div v-else>
        <Row :gutter="16">
          <Col span="16">
              <Card class="card">
                  <p slot="title" class="resource-list-title-container">
                    <span>Project {{accession}}</span>
                    <Icon v-if="editProjectBool" type="android-done" @click="saveProject" size="25" color="#2d8cf0"></Icon>
                    <Icon v-else type="edit" @click="editProject" size="20" ></Icon>
                  </p>
                  <div class="card-content">
                        <div class="card-item-wrapper">
                            <div class="summary-content-header">Title</div>
                            <p v-if="editProjectBool"><Input v-model="title" type="textarea" :autosize="true" placeholder="Enter something..."></Input></p>
                            <p v-else>{{title}}</p>
                        </div>
                        <div class="card-item-wrapper">
                            <div class="summary-content-header">Description</div>
                            <p v-if="editProjectBool"><Input v-model="projectDescription" type="textarea" :autosize="true" placeholder="Enter something..."></Input></p>
                            <read-more v-else class="readMore" more-str="Read more" :text="projectDescription" link="#" less-str="Read less" :max-chars="200"></read-more>
                        </div>
                        <div class="card-item-wrapper">
                            <div class="summary-content-header">Sample Processing Protocol</div>
                            <div v-if="sampleProcessingProtocol != 'Not available'">
                              <p v-if="editProjectBool"><Input v-model="sampleProcessingProtocol" type="textarea" :autosize="true" placeholder="Enter something..."></Input></p>
                              <read-more v-else class="readMore" more-str="Read more" :text="sampleProcessingProtocol" link="#" less-str="Read less" :max-chars="200"></read-more>
                            </div>
                            <div v-else>
                                <div v-if="publications.length == 0">
                                  <p>Not available</p>
                                </div>
                                <div v-else>
                                  <div v-for="item in publications">
                                    <p>See details in reference(s): <a @click="europePMC(item.pmid)">{{item.pmid}}</a></p>
                                  </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-item-wrapper">
                            <div class="summary-content-header">Data Processing Protocol</div>
                            <div v-if="dataProcessingProtocol != 'Not available'">
                              <p v-if="editProjectBool"><Input v-model="sampleProcessingProtocol" type="textarea" :autosize="true" placeholder="Enter something..."></Input></p>
                              <read-more v-else class="readMore" more-str="Read more" :text="dataProcessingProtocol" link="#" less-str="Read less" :max-chars="200"></read-more>
                            </div>
                            <div v-else>
                                <div v-if="publications.length == 0">
                                  <p>Not available</p>
                                </div>
                                <div v-else>
                                  <div v-for="item in publications">
                                    <p>See details in reference(s): <a @click="europePMC(item.pmid)">{{item.pmid}}</a></p>
                                  </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-item-wrapper">
                            <div class="summary-content-header">Contact</div>
                            <p v-for ="item in contactors"> <a :href="'mailto:'+item.email">{{item.name}}</a><span>, {{item.affiliation}}</span></p>
                        </div>
                        <div class="card-item-wrapper">
                            <div class="summary-content-header">Submission Date</div>
                            <p>{{submissionDate}}</p>
                        </div>
                        <div class="card-item-wrapper">
                            <div class="summary-content-header">Publication Date</div>
                            <p>{{publicationDate}}</p>
                        </div>
                  </div>
              </Card>
          </Col>
          <Col span="8"> 
              <Card class="card">
                   <p slot="title">Properties</p>
                   <div class="property">
                        <div class="property-row">
                            <div class="summary-content-header">Organism</div>
                            <div class="property-wrapper">
                              <div v-if="species.length>0">
                                <div v-for="item in species">
                                  <a>{{item.name}}</a>
                                </div>
                              </div>
                              <div v-else>
                                  <p>Unknown</p>
                              </div>
                            </div>
                        </div>
                        <div class="property-row">
                            <div class="summary-content-header">Organism part</div>
                            <div class="property-wrapper">
                              <div v-if="tissues.length>0">
                                <div v-for="item in tissues">
                                  <a>{{item.name}}</a>
                                </div>
                              </div>
                              <div v-else>
                                  <p>Unknown</p>
                              </div>
                            </div>
                        </div>
                        <div class="property-row">
                            <div class="summary-content-header">Diseases</div>
                            <div class="property-wrapper">
                              <div v-if="diseases.length>0">
                                <div v-for="item in diseases">
                                  <a>{{item.name}}</a>
                                </div>
                              </div>
                              <div v-else>
                                  <p>Unknown</p>
                              </div>
                            </div>
                        </div>
                        <div class="property-row">
                            <div class="summary-content-header">Modification</div>
                            <div class="property-wrapper">
                              <div v-if="modification.length>0">
                                <div v-for="item in modification">
                                  <a>{{item.name}}</a>
                                </div>
                              </div>
                              <div v-else>
                                  <p>No PTMs are included in the dataset</p>
                              </div>
                            </div>
                        </div>
                        <div class="property-row">
                            <div class="summary-content-header">Instrument</div>
                            <div class="property-wrapper">
                              <div v-if="instrumentNames.length>0">
                                <div v-for="item in instrumentNames">
                                  <a>{{item.name}}</a>
                                </div>
                              </div>
                              <div v-else>
                                  <p>Unknown</p>
                              </div>
                            </div>
                        </div>
                        <div class="property-row">
                            <div class="summary-content-header">Software</div>
                            <div class="property-wrapper">
                              <div v-if="softwares.length>0">
                                <div v-for="item in softwares">
                                  <a>{{item.name}}</a>
                                </div>
                              </div>
                              <div v-else>
                                  <p>Unknown</p>
                              </div>

                            </div>
                        </div>
                        <div class="property-row">
                            <div class="summary-content-header">Experiment Type</div>
                            <div class="property-wrapper">
                              <div v-if="experimentTypes.length>0">
                                <div v-for="item in experimentTypes">
                                  <a>{{item}}</a>
                                </div>
                              </div>
                              <div v-else>
                                  <p>Unknown</p>
                              </div>
                            </div>
                        </div>
                        <div class="property-row">
                            <div class="summary-content-header">Quantification</div>
                            <div class="property-wrapper">
                              <div v-if="quantificationMethods.length>0">
                                <div v-for="item in quantificationMethods">
                                  <a>{{item.name}}</a>
                                </div>
                              </div>
                              <div v-else>
                                  <p>Unknown</p>
                              </div>
                            </div>
                        </div>
                   </div>
              </Card>
          </Col>
        </Row>
         
        <Card class="card">
           <p slot="title"></i>MsRun Files</p>
           <!--
           <div class="filter-wrapper">
               <div class="summary-content-header">Filter</div>
               <Select v-model="model1" size="small" style="width:100px">
                  <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
               </Select>
           </div>
            -->
           <div class="download-list-wrapper">
             <!--<div class="summary-content-header">List</div>-->
             <div class="download-list">
               <Table border ref="selection" height="350" :loading="fileListLoading" :columns="fileListCol" :data="fileList" @on-select="downLoadSelect" @on-select-all="filesSelectAll"></Table>
               <!--
               <div class="page-container">
                  <Page :total="totalDownLoad" :page-size="pageSizeDownLoad" size="small" class-name="page" @on-change="pageChangeDownload" @on-page-size-change="pageSizeChangeDownload"></Page>
               </div>
               -->
               <!--<Button v-if="selectAllfiles" class= "download-button">Download</Button>-->
             </div>
           </div>
        </Card>
      </div>
  </div>
</template>

<script>
  import Step from "@/components/step.vue"
  import store from "@/store.js"
  export default {
    name: 'checkdataset',
    data(){
      return {
            keyword:'',
            loading:true,
            queryArchiveProjectApi: this.$store.state.baseApiURL + '/projects/',
            queryArchiveProjectFilesApi: this.$store.state.baseApiURL + '/projects/',
            annotationStep:0,
            stepDes:'Here is used to put the explanation about steps',
            database:'pride',
            databaseArray:[
              {
                label:'Pride',
                value:'pride'
              },
              {
                label:'xxxxx',
                value:'xxxxx'
              }
            ],
            accession:'',
            title:'',
            projectDescription:'',
            species:[],
            diseases:[],
            tissues:[],
            instrumentNames:[],
            quantificationMethods:[],
            experimentTypes:[],
            softwares:[],
            modification:[],
            publicationDate:'',
            submissionDate:'',
            editProjectBool:false,
            sampleProcessingProtocol:'',
            dataProcessingProtocol:'',
            contactors:[],
            fileListLoading:false,
            fileListCol: [
              /*
                {
                    type: 'selection',
                    width: 40,
                    align: 'center'
                },*/
                {
                    title: 'Name',
                    key: 'name',
                    align:'left',
                    ellipsis:true
                },
                {
                    title: 'Type',
                    width: 150,
                    key: 'type',
                    align:'center',
                    sortable: true,
                    ellipsis:true,
                    render: (h, params) => {
                        var className;
                        var iconColor;
                        if(params.row.type == 'PEAK'){
                          className='far fa-chart-bar';
                          iconColor='#bd7edc'
                        }
                        else if (params.row.type == 'RAW'){
                          className ='far fa-list-alt';
                          iconColor='#e2c94c'
                        }
                        else if (params.row.type == 'RESULT'){
                          className ='far fa-envelope-open';
                          iconColor='#6acaef'
                        }
                        else if (params.row.type == 'OTHER'){
                          className ='far fa-file';
                          iconColor='#999c9c'
                        }
                        else if (params.row.type == 'SEARCH'){
                          className ='fas fa-search';
                          iconColor='#2d8cf0'
                        }
                        return h('div', [

                            h('i', {
                                attrs: { class: className},
                                style: {
                                    color:iconColor,
                                    marginRight: '5px',
                                    marginLeft: '0px'
                                },
                            }),
                            h('span', {
                                on: {
                                    click: () => {

                                    }
                                }
                            }, params.row.type),

                            /*
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    display:'inline-block',
                                    marginRight: '5px',
                                    paddingLeft: '22px',
                                    paddingRight: '22px'
                                },
                                on: {
                                    click: () => {
                                        //window.location.href = params.row.url.ftp;
                                        window.open(params.row.url.ftp)
                                        console.log(params.row.url.ftp);
                                        //this.gotoBlast(params);
                                    }
                                }
                            }, 'FTP'),*/

                        ]);
                    }
                },
                {
                    title: 'Size (M)',
                    width: 150,
                    key: 'size',
                    sortable: true,
                    align:'center'
                },
                // {
                //     title: 'Download',
                //     key: 'download',
                //     align:'center',
                //     width:160,
                //     render: (h, params) => {
                //         return h('div', [
                //             /*
                //             h('Button', {

                //                 on: {
                //                     click: () => {
                //                         this.gotoBlast(params);
                //                     }
                //                 }
                //             }, 'Blast'),
                //             */
                //             h('Button', {
                //                 props: {
                //                     type: 'primary',
                //                     size: 'small'
                //                 },
                //                 style: {
                //                     display:'inline-block',
                //                     marginRight: '5px',
                //                     paddingLeft: '22px',
                //                     paddingRight: '22px'
                //                 },
                //                 on: {
                //                     click: () => {
                //                         //window.location.href = params.row.url.ftp;
                //                         window.open(params.row.url.ftp)
                //                         console.log(params.row.url.ftp);
                //                         //this.gotoBlast(params);
                //                     }
                //                 }
                //             }, 'FTP'),
                //             // h('Button', {
                //             //     props: {
                //             //         type: 'primary',
                //             //         size: 'small'
                //             //     },
                //             //     style: {
                //             //         display:'inline-block',
                //             //         marginRight: '0px'
                //             //     },
                //             //     on: {
                //             //         click: () => {
                //             //             //window.location.href = params.row.url.asp;
                //             //             window.open(params.row.url.asp)
                //             //             console.log(params.row.url.asp);
                //             //         }
                //             //     }
                //             // }, 'ASPERA'),
                //         ]);
                //     }
                // }
            ],
            fileList: [],
            pageDownLoad:0,
            pageSizeDownLoad:100,
      }
    },
    beforeRouteUpdate:function (to, from, next) {
     
      next();
    },
    components: {
      Step
    },
    methods:{
        showDataset(id){
             this.loading=true;
             this.$http
              .get(this.queryArchiveProjectApi + id)
              .then(function(res){
                  this.loading = false;
                  this.accession = res.body.accession;
                  //for self table
                  this.projectAccession=res.body.accession;
                  this.title = res.body.title;
                  this.projectDescription = res.body.projectDescription;
                  this.publicationDate = res.body.publicationDate.split('-')[2] +'/'+ res.body.publicationDate.split('-')[1] +'/'+ res.body.publicationDate.split('-')[0];
                  this.submissionDate = res.body.submissionDate.split('-')[2] +'/'+ res.body.submissionDate.split('-')[1] +'/'+ res.body.submissionDate.split('-')[0];
                  
                  this.sampleProcessingProtocol = res.body.sampleProcessingProtocol;
                  this.dataProcessingProtocol = res.body.dataProcessingProtocol;

                  //for contactors
                  for(let i=0; i<res.body.submitters.length; i++){
                    let item = {
                      name: res.body.submitters[i].name,
                      affiliation: res.body.submitters[i].affiliation,
                      email:res.body.submitters[i].email
                    }
                    this.contactors.push(item);
                  }
                  for(let i=0; i<res.body.labPIs.length; i++){
                    let item = {
                      name: res.body.labPIs[i].name,
                      affiliation: res.body.labPIs[i].affiliation + ' ' +'(lab head)',
                      email:res.body.labPIs[i].email
                    }
                    this.contactors.push(item);
                  }
                  
                  this.species = res.body.organisms || [];
                  this.tissues = res.body.organismParts || [];
                  this.diseases = res.body.diseases || [];
                  this.instrumentNames = res.body.instruments || [];
                  this.softwares = res.body.softwares || [];
                  this.quantificationMethods = res.body.quantificationMethods || [];
                  this.experimentTypes = res.body.projectTags || [];
                  this.modification = res.body.identifiedPTMStrings || [];

                  //for id checking
                  localStorage.setItem('tempProjectAccession',this.$route.params.id);
                  console.log('tempProjectAccession',localStorage.getItem('tempProjectAccession'));
                  /*
                  //for publications
                  //console.log('res.body',res.body);
                  for(let i=0; i<res.body.references.length; i++){
                    let item = {
                      desc:res.body.references[i].referenceLine,
                      pmid:res.body.references[i].pubmedId,
                    }
                    this.publications.push(item);
                  }*/

              },function(err){
                    this.$Message.error({content:'Project Query Error', duration:1});
                    this.back();
              });
        },
        queryArchiveProjectFiles(id){
             var id = id || this.$route.params.id;
             this.fileListLoading = true;
             this.$http
              .get(this.queryArchiveProjectFilesApi +id+ '/files'+ this.queryDownload)
              .then(function(res){
                  console.log(res.body);
                  this.fileListLoading = false;
                  this.totalDownLoad = res.body.page.totalElements;
                  if(res.body._embedded && res.body._embedded.files){
                    let filesArray = res.body._embedded.files;
                    let tempArray = [];
                    for(let i=0;i<filesArray.length;i++){
                        let item ={
                              name: filesArray[i].fileName,
                              type: filesArray[i].fileCategory.value,
                              size: Math.round(filesArray[i].fileSizeBytes/1024/1024),
                              url: {
                                ftp: filesArray[i].publicFileLocations[0].value,
                                asp: filesArray[i].publicFileLocations[1].value
                              }
                        }
                        tempArray.push(item);
                    }

                    this.fileList=tempArray;
                  }
                  else{
                      this.$Message.error({content:'No results', duration:1});
                  }
              },function(err){
                  this.fileListLoading = false;
              });
        },
        search(){
            this.showDataset(this.keyword)
            this.queryArchiveProjectFiles(this.keyword);
        },
        editProject(){
          this.editProjectBool=true;
        },
        saveProject(){
          this.editProjectBool=false;
        },
        downLoadSelect(selection,row){
            console.log(selection);
            console.log(row);
        },
        filesSelectAll(){
            this.selectAllfiles =! this.selectAllfiles;
            this.$refs.selection.selectAll(this.selectAllfiles);
        },
    },

    watch: {
     
    },
    computed:{
        query:function(){
            let page='page='+this.page+'&';
            let size='size='+this.size;
            return '?'+sequence+project+mod+page+size;
        },
        queryDownload:function(){
            let pageDownLoad='page='+this.pageDownLoad+'&';
            let pageSizeDownLoad='pageSize='+this.pageSizeDownLoad;
            return '?'+pageDownLoad+pageSizeDownLoad;
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>  
  .check-dataset-container{
    width: 80%;
    margin:0 auto;
    padding: 90px 0;
  }
  .check-dataset-container a{
    color:#2c3e50 !important;
    border-bottom: 1px black dotted;
  }
  .check-dataset-container a:hover{
    color:#2d8cf0;
  }
  .title{
    font-size: 35px;
    color: #454548;
    margin-bottom: 50px;
  }
  .card{
    margin-top: 20px;
  }
  .search-container{
    display: flex;
    justify-content: space-between;
  }
  .search-container .name{
    margin-right: 10px;
  }
  .summary-content-header{
    font-size: 14px;
    color: #2d8cf0;
    font-weight: bold;
  }
  .card-item-wrapper{
    margin-bottom: 10px;
  }
  .property-row{
    margin-top: 10px;
  }
</style>

<style>
  .temp-card .ivu-card-body{
    height: 30vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .readMore a{
      font-size: 12px;
      color: #495060;
      border-bottom: 1px black dotted;
  }
  .readMore a:hover{
      color: #2d8cf0;
  }
  .readMore span{
      display: block;
      margin-top: 15px;
  }
</style>
