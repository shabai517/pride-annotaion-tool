<template>
  <div class="archive-container">
      <Card id="sample-card" class="card annotation">
          <p slot="title" class="resource-list-title-container">
            <span>{{name}}</span>
          </p>
          <!-- <p v-if="sampleData.length>0 && sampleCol.length>0" slot="extra" class="sample-table-extra">
            <a @click="showAddColModal"><span>Add Col</span><Icon type="ios-add" size="20"></Icon></a>
            <a @click="addRow"><span>Add Row</span><Icon class="add-row-icon" type="ios-add" size="20"></Icon></a>
          </p> -->
          <!-- <div class="card-content" @scroll="scroll" :style="{height:height + 'px'}"> -->
          <div class="card-content" :style="{height:height + 'px'}">
              <div v-if="sampleData.length == 0" class="no-data-table-wrapper">
                  <span>No data</span>
              </div>
              <template v-else>
                  <!-- <div :style="{'padding-top': rowStart*45+'px'}"></div> -->
                  <div style="display: flex"> 
                      <div class="table-col" v-for="(itemCol,i) in sampleCol" :key="itemCol.key">
                          <div class="table-row first">
                            <Icon class="icon-in-th-left" type="ios-remove-circle-outline" @click="removeAll(itemCol.key)" size="14"></Icon>
                            {{itemCol.name}}
                            <Icon class="icon-in-th-right" type="ios-close-circle-outline" @click="deleteCol(itemCol,i)" size="14"></Icon>
                            <Icon style="position: absolute; top: 0px; right: 0px" class="icon-in-th-right" type="ios-add-circle-outline" size="6" @click="showAddColModal(i)"></Icon>
                          </div>
                          <div class="table-row" :class="{'index':itemCol.key=='index'}" v-for="(itemRow,j) in list" :key="itemRow.index">
                          <!-- <div class="table-row" :class="{'index':itemCol.key=='index'}" v-for="(itemRow,j) in sampleData" :key="itemRow.index"> -->
                                <!-- <p>{{itemRow.index}}</p> -->
                                <template v-if="itemCol.key!='index'">
                                      <Input :class="{inputError:!itemRow[itemCol.key].checked}" size="small" type="text" v-model="itemRow[itemCol.key].value" :icon="(itemCol.key.match('modification') && itemRow[itemCol.key].active) ? '':''" @on-enter ="showPTMsModal(itemCol,itemRow)" @on-change="getAutoCompleteList(itemCol,itemRow)" @on-focus="focus($event,itemCol,itemRow,j)" @on-blur="inputBlur(itemRow[itemCol.key])">
                                      </Input>
                                      <div class="copy-icon"><Icon @click="showCopyModal(itemRow,itemCol,j)" type="ios-copy-outline" size="16"></Icon></div>
                                </template>
                                <template v-else>
                                    <Icon v-if="list.length>1" class="icon-in-row" type="ios-remove-circle-outline" @click="deleteRow(itemRow,j)" size="14"></Icon>
                                    <!-- <Icon v-if="sampleData.length>1" class="icon-in-row" type="ios-remove-circle-outline" @click="deleteRow(itemRow,j)" size="14"></Icon> -->
                                    <Icon style="position: absolute; bottom: 0px; left: 0px" class="icon-in-row" type="ios-add-circle-outline" size="6" @click="addRow(j)"></Icon>
                                    <div class="index-col">
                                        <div>
                                          {{itemRow.index}}
                                        </div>
                                    </div>
                                </template>                
                          </div>
                      </div>
                  </div>
                  
                  <!-- <div :style="{'padding-top': (sampleData.length-rowEnd)*45+'px'}"></div> -->
                  <!-- <div class="sample-table-extra add-row-icon">
                     <Icon class="add-row-icon" type="plus-round" @click="addRow" size="20"></Icon><span>Add Sample</span>
                  </div> -->
              </template>
              
          </div>
          <div class="page-container">
            <Page v-if="sampleData.length > 0" :total="sampleData.length" :page-size="pageSizeSdrf" :current="pageSdrf" size="small" show-sizer show-total :page-size-opts="[100,200,300,400]" @on-change="sdrfPageChange" @on-page-size-change="sdrfPageSizeChange"></Page>
          </div>
          <Dropdown class="dropdown-remote" :style="{left:dropdown.left + 'px', top:dropdown.top + 'px'}" trigger="custom" :visible="dropdown.visible" placement="bottom-end" @on-click="dropdownClick($event,dropdown.row[dropdown.col.key])">
              <DropdownMenu slot="list">
                  <DropdownItem v-if="dropdownLoading"><Spin></Spin></DropdownItem>
                  <template v-else>
                      <DropdownItem v-if="dropdownOptions.length == 0" name="nodata">No data
                          <Icon class="apply-all-button" type="md-arrow-round-down" size="15" @click.stop="applyAll('no data',dropdown.col,dropdown.row,dropdown.index)"></Icon>
                      </DropdownItem>
                      <DropdownItem v-for="item in dropdownOptions" :name="item.name" :key="item.name">{{item.name}}
                          <Icon class="apply-all-button" type="md-arrow-round-down" size="15" @click.stop="applyAll(item.name,dropdown.col,dropdown.row,dropdown.index)"></Icon>
                      </DropdownItem>
                  </template>
              </DropdownMenu>
          </Dropdown>
          <Spin class="table-spin" v-if="tableLoadingTemp"></Spin>  
      </Card>
      <Modal
          title="Add Column"
          class-name="addColModal"
          v-model="addColumnBool"
          :closable="false"
          @on-ok="addCol"
          @on-visible-change="modalVisibleChange">
          <Table border ref="addPropertyTable" class="add-col-table" :columns="newCol" :data="addedColData" @on-selection-change="newColSelectChange"></Table>
      </Modal>
      <Modal
          title="Copy"
          v-model="copyModalBool"
          :closable="false"
          @on-ok="copy"
          @on-visible-change="copyModalVisibleChange">
          <Input id="text-to-copy" v-model="copyValue" type="textarea" placeholder="Enter something..." :rows="8"/>
      </Modal>
      <Modal
          title="PTMs Choose"
          v-model="ptmsModalBool"
          :closable="false"
          @on-ok="ptmsApply"
          @on-cancel="ptmsCancel"
          @on-visible-change="ptmsModalVisibleChange">
          <Form :model="ptms" label-position="top">
              <FormItem label="Input">
                  <Input v-model="ptms.search" :disabled="true"></Input>
              </FormItem>

              <FormItem label="NT">
                  <Select v-model="ptms.NT" @on-change="ntChange">
                      <Option v-for="item in ntOptionsArray" :value="item.label">{{item.label}}</Option>
                  </Select>
              </FormItem>

              <FormItem label="TA">
                  <template v-if="taOptionsArray.length>0">
                    <CheckboxGroup v-model="ptms.TA">
                        <Checkbox style = "min-width: 40px" v-for="item in taOptionsArray" :label="item.label"></Checkbox>
                    </CheckboxGroup>
                  </template>
                  <template v-else >
                    <Input value="No Sites" :disabled="true"></Input>
                  </template>
              </FormItem>

              <FormItem label="MT">
                  <Select v-model="ptms.MT">
                      <Option value="variable">variable</Option>
                      <Option value="fixed">fixed</Option>
                  </Select>
              </FormItem>
                  
              <FormItem label="AC">
                  <Input v-model="ptms.AC" :disabled="true"></Input>
              </FormItem>

              <FormItem label="Results">
                  <Input class="ptmsResults-input" v-model="ptmsResults" :disabled="true"></Input>
              </FormItem>
          </Form>
      </Modal>
      <div v-if="drawerShowBool" class="annotate-drawer-container">
          <!-- <div class="annotate-drawer-wrapper" @wheel.stop="wheel" @wheel.prevent="wheel"> -->
          <div class="annotate-drawer-wrapper">
            <div class="annotate-drawer" :class="{ active: drawerShowBool }">
                <div class="header"><span>MsRUN Table</span><a @click="hideMsRunTable"><Icon color="rgba(0, 0, 0, 0.6)" type="ios-close"  size="20"/></a></div>
                <div class="content">
                  <Table border ref="selection" class="msrun-modal-table" :columns="msRunModalTableCol" :data="msRunModalTableData" height="400"></Table>
                </div>
                <div class="footer">
                    <Button type="primary" style="width: 85px; margin-right: 10px" @click="msRunAnnotate">OK</Button>
                    <Button type="primary" style="width: 85px"@click="hideMsRunTable">Cancel</Button>
                </div>
            </div>
          </div>
      </div>
  </div>
</template>

<script>
  import { cloneDeep } from 'lodash'
  import store from "@/store.js"
  export default {
    name: 'archive',
    props: ['columns','data','addedCol','loading','height','name'],
    data(){
      return {
          sampleData: cloneDeep(this.data),
          sampleCol: cloneDeep(this.columns),
          addedColData: cloneDeep(this.addedCol),
          tokenApi:this.$store.state.baseApiURL + '/getAAPToken', 
          updateSampleApi:this.$store.state.baseApiURL + '/annotator/'+this.$route.params.id+'/updateSampleMsRuns',
          visible:true,
          addColumnBool:false,
          drawerShowBool:false,
          newColumnNameSelectedArray:[],
          inputDeleteAllIcon:'',
          newCol:[
              {
                  type: 'selection',
                  width: 70,
                  align: 'center'
              },
              {
                  title: 'Name',
                  key: 'name',
                  className:'new-col-table' //for css right border settings
              },
              {
                  title: '',
                  key: 'key',
                  width:1,
                  render:(h,params)=>{
                    return h('div')
                  },
                  // width:0.1,
                  className:'new-col-table' 
              },
              {
                  title: '',
                  key: 'searchable',
                  width:1,
                  render:(h,params)=>{
                    return h('div')
                  },
                  // width:0.1,
                  className:'new-col-table' 
              },
              {
                  title: '',
                  key: 'required',
                  width:1,
                  render:(h,params)=>{
                    return h('div')
                  },
                  // width:0.1,
                  className:'new-col-table' 
              },
          ],
          newData:[],
          msRunModalTableCol:[
              {
                  width: 40,
                  align: 'center',
                  render: (h, params) => {
                      return h('Checkbox', {
                          props: {
                              value: params.row.select
                          },
                          on: {
                              'on-change': (val) => {
                                  this.msRunModalTableData.map(x => {
                                      x.select= false;
                                      return x;
                                  });
                                  this.msRunModalTableData[params.index].select= val;
                                  if(val)
                                    this.selectedFileItem = params;
                                  else
                                    this.selectedFileItem={};
                              }
                          }
                      });
                  }
              },
              {
                  title: 'Name',
                  key: 'name',
                  align: 'center',
              },
              {
                  title: 'Size (M)',
                  key: 'size',
                  width: 70,
                  align: 'center',
              },
              {
                  title: 'Accession',
                  width:1,
                  key: 'accession',
                  className:'msrun-modal-table-accession'
              },
          ],
          msRunModalTableData:[],
          dropdownOptions:[],
          experimentType:'',
          sampleNumber:0,
          fractionNumber:0,
          trNumber:0,
          accessionKey:0,
          msRunTableRowID:'',
          selectedFileItem:{},
          copyArray:[],
          copyModalBool:false,
          ptmsModalBool:false,
          copyContent:'',
          copyValue:'',
          pasteIndex:null,
          timeoutId:0,
          dropdown:{
            left:0,
            top:0,
            visible:false,
            row:null,
            col:null,
            index:null,
            type:null,
          },
          rowStart:0,
          rowEnd:75,
          tableLoading:false,
          colIndex:0,
          ptms:{
            search:'',
            NT:'',
            MT:'',
            TA:[],
            AC:'',
          },
          taOptionsArray:[],
          ntOptionsArray:[{
            key:'',
            label:'',
            taOptionsArray:[]
          }],
          dropdownLoading:false,
          pageSizeSdrf:200,
          pageSdrf:1,
          // start: 0,
          // end: 75
      }
    },
    components: {
      //draggable,
      //ModelSelect
    },
    methods:{
          async getAutoCompleteList(itemCol,itemRow){
              console.log(itemCol,itemRow)
              if(itemCol.key.match('modification'))
                return
              if(!itemCol.searchable)
                  return
              let searchValue = itemRow[itemCol.key].value;
              if(searchValue)
                  itemRow[itemCol.key].icon = 'close-circled'
              else{
                  itemRow[itemCol.key].icon= '';
                  this.dropdown.visible = false;
                  return;
              }

              this.dropdownOptions=[]
              this.dropdown.visible = true
              this.dropdownLoading = true
              let query={
                accession: itemCol.ontologyTerm.iri_id,
                ontology: itemCol.ontologyTerm.ontology,
                filter:searchValue
              }
              clearTimeout(this.timeoutId);
              this.timeoutId = 0;
              this.timeoutId = setTimeout( async()=> {
                    try{
                        let res = await this.$Api.getValuesByAttributes(query) 
                        if(this.timeoutId == 0)
                          return;
                        if(!itemRow[itemCol.key].active)
                          return;

                        this.dropdownLoading = false;

                        if(res.body.length>0 || searchValue){
                          itemRow[itemCol.key].dropdown=true;
                          // this.dropdown.visible = true
                        }
                        console.log('getAutoCompleteList',res.body)
                        this.dropdownOptions=res.body;
                        if(this.dropdownOptions.length == 0){
                            itemRow[itemCol.key].value=searchValue;
                        }
                    }
                    catch(e){
                        this.dropdownLoading = false;
                        this.$Message.error({content:'Auto Comeplete Error', duration:2});
                        console.log(e)
                    }
              }, 200);
              this.$forceUpdate();
          },
          titleCase(str) {
            str=str.toLowerCase().split(" ");
            for(var i=0;i<str.length;i++){
              var char=str[i].charAt(0);
              str[i]=str[i].replace(char,function(s){return s.toUpperCase();});
            }
            str=str.join(" ");
            return str;
          },
          focus(e,itemCol,itemRow,index){
              let left = e.target.parentNode.parentNode.parentNode.offsetLeft-document.querySelector('.card-content').scrollLeft;
              let top = e.target.parentNode.parentNode.offsetTop-document.querySelector('.card-content').scrollTop;

              //console.log('itemCol',itemCol)

              itemRow[itemCol.key].active=true;

              if(itemCol.key.match('modification'))
                return

              this.dropdown.focus = itemCol.key+index
              this.dropdown.visible = false
              this.dropdown.index = index
              this.dropdown.col = itemCol
              this.dropdown.row = itemRow
              this.dropdown.top = top
              this.dropdown.left =left

              if(!itemRow[itemCol.key].value)
                return;

              this.getAutoCompleteList(itemCol,itemRow);
          },
          inputBlur(item){
            this.pasteIndex = null;
            this.blur(item)
          },
          blur(item){
              //console.log('blurblur',item);
              item.active=false;
              item.dropdown = false;

              if(item.required){
                if(item.value)
                  item.checked=true;
                else
                  item.checked=false;
              }
              let lastFocus = this.dropdown.focus;
              setTimeout(()=>{ 
                if(lastFocus != this.dropdown.focus)
                  return;
                this.dropdown.visible = false
                this.dropdown.index = null
                this.dropdown.col = null
                this.dropdown.row = null
              },200);//set 200ms to avoid dropdown click item of "null"
          },
          removeInputContent(item){
              //item.dropdown = false;
              item.value="";
              item.icon="";
          },
          showAddColModal(index){
            this.newColumnNameSelectedArray=[];
            this.addColumnBool=true;
            this.colIndex = index
          },
          addCol(){
              for(let i=0; i<this.newColumnNameSelectedArray.length; i++){
                  let item = this.newColumnNameSelectedArray[i]
                  this.colIndex++
                  this.sampleCol.splice(this.colIndex, 0, item);
                  for(let j=0; j<this.sampleData.length; j++){
                      this.sampleData[j][item.key] = {
                        value:'',
                        checked:true,
                        active:false
                      }
                  }
              }
          },
          deleteCol(itemCol, index){
            this.$Modal.confirm({
                title: 'Delete Column',
                content: '<p>Are you sure to remove this column?</p>',
                onOk: () => {
                    this.tableLoading = true
                    this.sampleCol.splice(index,1);
                    let key = itemCol.key;
                    for(let i=0; i<this.sampleData.length; i++){
                        for(let j in this.sampleData[i]){
                            if(j == key){
                              delete this.sampleData[i][key]
                              break;
                            }
                        }
                    }
                    console.log('delete col', this.sampleData, this.sampleCol)
                    setTimeout(()=>{
                      this.tableLoading = false
                    },200)
                },
                onCancel: () => {
                    
                }
            });
          },
          addRow(pageIndex){
            let index = pageIndex + (this.pageSdrf-1)*this.pageSizeSdrf
            this.tableLoading = true
            let item={};
            for(let i=0;i<this.sampleCol.length;i++){
                item[this.sampleCol[i].key] = {
                    value:'',
                    checked:true,
                    active:false,
                } 
            }
            item.index=index
            this.sampleData.splice(index+1, 0, item);
            for(let i=0; i<this.sampleData.length; i++){
              this.sampleData[i].index = i+1
            }
            console.log('add row',this.sampleData, this.sampleCol)
            setTimeout(()=>{
              this.tableLoading = false
            },200)
          },    
          deleteRow(itemRow, index){
              this.$Modal.confirm({
                  title: 'Delete Row',
                  content: '<p>Are you sure to remove this row?</p>',
                  onOk: () => {
                      this.tableLoading = true
                      this.sampleData.splice(index,1);
                      for(let i=0; i<this.sampleData.length; i++){
                        this.sampleData[i].index = i+1
                      }
                      console.log('delete row',this.sampleData, this.sampleCol)
                      setTimeout(()=>{
                        this.tableLoading = false
                      },200)
                  },
                  onCancel: () => {
                      
                  }
              });
          },
          showCopyModal(row, col, index){
            this.pasteIndex = {
              row:row,
              col:col,
              index:index
            };
            this.copyValue='';
            this.copyArray=[];
            this.copyModalBool=true;
          },
          copy(){
            document.querySelector('#text-to-copy textarea').select();
            document.execCommand('copy');
            this.paste();
          },
          paste(){
            if(this.pasteIndex && this.copyValue){
              this.tableLoading=true;
              setTimeout(()=>{

                let msrunBool = null;
                let tempArray = this.copyValue.split('\n');
                console.log('tempArray',tempArray)
                console.log('this.pasteIndex.index',this.pasteIndex.index)
                if((this.sampleData.length - this.pasteIndex.index) < tempArray.length){ //How to caclate the length of the table needs to be considered
                  this.tableLoading=false;
                  this.$Message.error({content:'Insufficient Rows', duration:3});
                  return
                }
                
                for(let i=0; i< tempArray.length; i++){
                    if(this.sampleData[parseInt(this.pasteIndex.index)+parseInt(i)]){
                      this.sampleData[parseInt(this.pasteIndex.index)+parseInt(i)][this.pasteIndex.col.key].value= tempArray[i];
                      this.sampleData[parseInt(this.pasteIndex.index)+parseInt(i)][this.pasteIndex.col.key].icon= 'close-circled';
                      this.sampleData[parseInt(this.pasteIndex.index)+parseInt(i)][this.pasteIndex.col.key].checked = true;
                    }
                }
    
                this.blur(this.pasteIndex.row[this.pasteIndex.col.key]);
                this.tableLoading=false;
              },100)
            }
          },
          modalVisibleChange(stat){
              if(!stat)
                this.$refs.addPropertyTable.selectAll(false);
          },
          copyModalVisibleChange(stat){
              console.log(stat)
              //if(!stat)
                //this.$refs.addPropertyTable.selectAll(false);
          },
          
          dropdownClick(e,item){
            console.log('dropdownClick',item)
            item.dropdown=false;
            if(e == "nodata" && !item.value){
                item.icon="";
                return;
            }
            item.value=e;
            item.checked=true;
            
            for(let i=0; i<this.dropdownOptions.length;i++){
                if(this.dropdownOptions[i].name==e){
                  //TODO:set data for sample data
                    // item[this.keyList[j].key]={
                    //     value:body[j],
                    //     checked:true,
                    //     active:false,
                    //     required:this.keyList[j].required
                    //   }


                      // item.value = 
                    // item.accession = this.dropdownOptions[i].accession;
                    // item.cvLabel = this.dropdownOptions[i].cvLabel;
                    break;
                }
            }
            this.blur(item)
          },
          newColSelectChange(selection){
              console.log('selection',selection)
              this.newColumnNameSelectedArray=selection;
          },
          applyAll(name,itemCol,itemRow,index){
               this.tableLoading=true;
               let tempValue = itemRow[itemCol.key].value;
               console.log('tempValue',tempValue)
               this.dropdownClick(name,itemRow[itemCol.key]);
               this.$nextTick(()=>{ //make the value bind with the input first and then apply this value to all the other rows
                  for(let i=index;i<this.sampleData.length; i++){
                      let newItem =  JSON.parse(JSON.stringify(itemRow[itemCol.key]));
                      console.log('newItem',newItem)
                      this.sampleData[i][itemCol.key].value = newItem.value

                      //TODO:here is the logic for applying all new values
                      // if(tempValue == this.sampleData[i][itemCol.key].value || !this.sampleData[i][itemCol.key].value){
                      //   //TODO:
                      //   this.sampleData[i][itemCol.key].value = newItem.value
                      // }
                      
                  }
                  this.blur(itemRow[itemCol.key]);
                  //current no need to force update
                  // this.$forceUpdate();
                  this.tableLoading=false;
              });
          },
          removeAll(key){
              this.$Modal.confirm({
                  title: 'Remove All',
                  content: '<p>Are you sure to remove all the content of this column?</p>',
                  onOk: () => {
                      this.tableLoading = true
                      for(let i=0;i<this.sampleData.length; i++){
                          this.sampleData[i][key].value = '';
                          //TODO: the following code needed when col is confirmed
                          // if(this.sampleData[i][key].col.required)
                          //     this.sampleData[i][key].checked = false;
                      }
                      setTimeout(()=>{
                        this.tableLoading = false
                      },200)
                  },
                  onCancel: () => {
                      
                  }
              });
          },
          localStorageItemAdd(key,data){
              localStorage.setItem(key,data);
          },
          localStorageItemRemove(key){
              localStorage.removeItem(key);
          },
          msRunAnnotate(){
            if(!this.selectedFileItem.row){
              this.$Message.error({content:'Choose one file at least', duration:1});
              return;
            }
            for(let i of this.msRunArray){
                if(i.fractionid.id == this.msRunTableRowID){
                    i.msrun.value = this.selectedFileItem.row.name;
                    i.msrun.accession = this.selectedFileItem.row.accession;
                    break;
                }
            }
            this.hideMsRunTable();
          },
          showMsRunTable(itemRow,index){
            this.drawerShowBool=true;
            this.msRunTableRowID = itemRow.fractionid.id;
          },
          hideMsRunTable(){
            this.drawerShowBool=false;
            this.msRunTableRowID = '';
            //this.selectedFileItem={};
          },
          showPTMsModal(col,row){
            this.ptmsResultsIndex = {
              col:col,
              row:row
            }
            this.tableLoading = true
            this.getPTMsList(col,row)
          },
          async getPTMsList(itemCol,itemRow){
              let searchValue = itemRow[itemCol.key].value;
              console.log('searchValue',searchValue)
              this.ptms.search = searchValue
              this.ptms.NT = ''
              this.ptms.MT = ''
              this.ptms.TA = []
              this.ptms.AC = ''
              this.ptms.result = ''
              if(!searchValue)
                return
              else{
                let arr = searchValue.split(';')
                for(let i in arr){
                  if(arr[i].match('NT=')){
                    this.ptms.NT = arr[i].slice(3)
                  }
                  if(arr[i].match('MT=')){
                    this.ptms.MT = arr[i].slice(3)
                  }
                  if(arr[i].match('AC=')){
                    this.ptms.AC = arr[i].slice(3)
                  }
                  if(arr[i].match('TA=')){
                    this.ptms.TA = arr[i].slice(3).split(',')
                  }
                }
              }

              let query={
                accession: itemCol.ontologyTerm.iri_id,
                ontology: itemCol.ontologyTerm.ontology,
                filter: this.ptms.NT || this.ptms.search //if NT is not found, just send all the content to backend
              }
              clearTimeout(this.timeoutId);
              this.timeoutId = 0;
              this.timeoutId = setTimeout( async()=> {
                    try{
                        let res = await this.$Api.getPTMsAttributes(query) 
                        if(this.timeoutId == 0)
                          return;
                        if(!itemRow[itemCol.key].active)
                          return;

                        this.ptmsModalBool=true
                        this.tableLoading=false

                        if(res){
                            this.ntOptionsArray = res
                            //init taOptionsArray
                            console.log('before initPtmsResults', this.ptms.NT)
                            this.initPtmsResults(this.ptms.NT)
                            console.log('this.taOptionsArray',this.ntOptionsArray)
                        }
                        else{
                            this.$Message.error({content:'Invalid NT Valid', duration:2});
                        }
                    }
                    catch(e){
                        this.tableLoading=false
                        this.$Message.error({content:'PTMs Comeplete Error', duration:2});
                        console.log(e)
                    }
              }, 500);
          },
          ntChange(item){
            this.ptms.TA=[]
            this.ptms.AC = ''
            console.log('ntChange')
            this.initPtmsResults(item)
          },
          initPtmsResults(item){
            this.taOptionsArray = []
            let found = false
            for(let i in this.ntOptionsArray){
              if(this.ntOptionsArray[i].label == item){
                found = true
                console.log('found',this.ntOptionsArray[i])
                for(let j in this.ntOptionsArray[i].taOptionsArray){
                    let item = {
                      key:this.ntOptionsArray[i].taOptionsArray[j].site,
                      label:this.ntOptionsArray[i].taOptionsArray[j].site,
                    }
                    this.taOptionsArray.push(item)
                }
                this.ptms.AC = this.ntOptionsArray[i].key
                break
              }
            }
            if(!found){
              //console.log(item)
              //this.$Message.error({content:'Invalid NT', duration:2});
            }
          },
          ptmsApply(){
              if(this.ptmsResultsIndex){
                this.ptmsResultsIndex.row[this.ptmsResultsIndex.col.key].value = this.ptmsResults
              }
              else{
                this.$Message.error({content:'Apply Error', duration:2});
              }
              this.ptmsResultsIndex = null
              this.ptms.search = ''
              this.ptms.NT = ''
              this.ptms.MT = ''
              this.ptms.TA = []
              this.ptms.AC = ''
              this.ptms.result = ''
          },
          ptmsCancel(){
            this.ptmsModalBool = false
            this.ptmsResultsIndex = null
            this.ptms.search = ''
            this.ptms.NT = ''
            this.ptms.MT = ''
            this.ptms.TA = []
            this.ptms.AC = ''
            this.ptms.result = ''
          },
          removeAnnotationFile(){

          },
          ptmsModalVisibleChange(){

          },
          wheel(e){
            //console.log(e)
          },
          // pageChange(data){
          //   this.rowStart = (data.page-1)*data.pageSize;
          //   this.rowEnd = data.page*data.pageSize;

          //   console.log(this.rowStart,this.rowEnd);
          // }
          scroll(e){
            // console.log('e',e)
            let scrollTop = e.target.scrollTop
            let scrollHeight = e.target.scrollHeight
            let clientHeight = e.target.clientHeight
            // console.log('e',e)
            // console.log('scrollTop',scrollTop)
            // console.log('scrollHeight',scrollHeight)
            // console.log('clientHeight',clientHeight)
            let offset = (scrollTop + clientHeight) / scrollHeight
            let start = Math.max(Math.ceil(offset * this.sampleData.length) - 50, 0)
            this.rowStart = Math.min(start, this.sampleData.length - 75)
            this.rowEnd = this.rowStart + 75
            // console.log(this.rowStart,this.rowEnd)
          },
          sdrfPageChange(page){
              // this.tableLoading = true
              // // console.log(123)
              // this.pageSdrf = page;
              // // this.sdrfTableData = this.sampleData.slice((this.pageSdrf-1)*this.pageSizeSdrf, (this.pageSdrf-1)*this.pageSizeSdrf + this.pageSizeSdrf)
              // setTimeout(()=>{
              //   this.tableLoading = false
              // },500)
          },  
          sdrfPageSizeChange(size){
              // this.tableLoading = true
              // this.pageSizeSdrf = size;
              // // this.sdrfTableData = this.sampleData.slice((this.pageSdrf-1)*this.pageSizeSdrf, (this.pageSdrf-1)*this.pageSizeSdrf + this.pageSizeSdrf)
              // setTimeout(()=>{
              //   this.tableLoading = false
              // },500)
          }
    },
    watch: {
        // sampleData:{
        //   handler(){
            
        //   },
        //   deep:true
        // },
        // sampleCol:{
        //   handler(){
        //     //console.log('sampleCol',this.sampleCol)
        //   },
        //   deep:true
        // },
        data(newValue,oldValue){
            this.sampleData = cloneDeep(newValue)
            console.log('this.sampleData',this.sampleData)
        },
        columns(newValue, oldValue){
            this.sampleCol = cloneDeep(newValue)
            console.log('this.sampleCol',this.sampleCol)
        },
        addedCol(newValue,oldValue){
            //TODO:check if it is the oldValue
            for(let i in oldValue){
              let item = {
                name:oldValue[i].name,
                key:oldValue[i].name.replace(/\s+/g,"") + Math.floor(100000 + Math.random() * 900000),
                required:false,
                searchable:oldValue[i].searchable,
              }
              this.addedColData.push(item)
            }
            // console.log(oldValue)
            // console.log(this.addedColData)
        }
    },
    computed:{
      tableLoadingTemp: function(){
        return (this.loading || this.tableLoading)
      },
      ptmsResults: function(){
        let NT = this.ptms.NT ? 'NT=' + this.ptms.NT + ';' : ''
        let MT = this.ptms.MT ? 'MT=' + this.ptms.MT + ';' : ''
        let TA = this.ptms.TA.length>0 ? 'TA=' + this.ptms.TA.toString() + ';' : ''
        let AC = this.ptms.AC ? 'AC=' +  this.ptms.AC + ';' : ''
        return (NT + MT + TA + AC).replace(/;$/gi,'')
      },
      list:function(){
        // console.log('sample Data change',this.sampleData.slice(this.rowStart,this.rowEnd))
        //console.log(this.rowStart,this.rowEnd)
        //return this.sampleData.slice(this.rowStart,this.rowEnd)
        return this.sampleData.slice((this.pageSdrf-1)*this.pageSizeSdrf, (this.pageSdrf-1)*this.pageSizeSdrf + this.pageSizeSdrf)
      }
    },
    mounted: function(){
      
      // console.log(this.data)
      // console.log(this.sampleData)
    },
    created(){
      this.$bus.$on('annotation-confirm', this.confirm);
      this.$bus.$on('annotation-save', this.save);
      //this.$bus.$on('annotation-page', this.pageChange);
    },
    beforeCreate:function(){
      this.$bus.$off('annotation-confirm');
      this.$bus.$off('annotation-save');
      //this.$bus.$off('annotation-page');
    },
    beforeRouteEnter(to,from,next){
     
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>  
  .draggable-class{
    display: flex;
  }
  .table-col:first-child{
      /*border-left: 1px solid #e9eaec;*/
  }
  .table-col:first-child .table-row.first{
      padding: 10px;
  }
  .table-col:first-child .table-row.first:hover i{
    display: none
  }
  .table-col{
      flex:1;
      /*min-width: 200px;*/
      width: auto;
      max-width: 300px;
  }
   .table-col:last-child{
      min-width: 350px;
  }
  .table-row:first-child{
      min-width: 50px;
      border-top: 1px solid #e9eaec;
      background-color: #f8f8f9;
      align-items: center;
      height:45px; 
      display: flex;
      white-space: nowrap;
      overflow: hidden;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
  }
  .table-row:first-child.msrun{
      background-color: #2d8cf0ba;
  }
  .table-row{
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid #e9eaec;
      padding: 10px 20px 10px 5px;
      /*padding: 10px 5px;*/
      position: relative;
      height:45px;
      border-right: 1px solid #e9eaec;
  }
  .table-row.first{
    /*cursor: all-scroll;*/
    padding:10px 30px;
  }
  .table-row.first i{
    display: none
  }
  .table-row.first:hover i{
    display: inline-block
  }
  .table-row.first i:hover{
    opacity: 0.6
  }
  .table-row .copy-icon{
    position: absolute;
    right: 5px;
    top: 12px;
    display: none;
    cursor: pointer;
  }
  .table-row:hover .copy-icon{
    display: block;
  }
  .table-row .copy-icon:hover{
    opacity: 0.6
  }
  .icon-in-th-right{
    position: absolute;
    right: 10px;
    cursor: pointer;
  }
  .icon-in-th-left{
    position: absolute;
    left: 10px;
    cursor: pointer;
  }
  .icon-in-row{
    /*position: absolute;
    left: 10px;*/
    cursor: default;
    /*margin-right: 5px;*/
  }
  .index-col{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 15px;
  }
  .table-row.index{
    padding: 10px 5px;
    border-left: 1px solid #e9eaec;
  }
  .table-row.index i{
    cursor: pointer;
    display: none;
    position: absolute;
    left: 5px;
  }
  .table-row.index:hover i{
    display: inline-block;
  }
  .table-row.index i:hover{
    opacity: 0.6
  }
  .card{
    margin-bottom: 20px;
  }
  .search-button{
      padding: 5px;
      font-size: 12px;
      width: 95%;
      margin-left: 11px;
      margin-bottom: 0;
      /*padding: 20px 85px;
      font-size: 24px;*/
      font-weight: 700;
      background-color: #5bc0be;
      border-radius: 3px;
  }
  .search-button.finish{
      background-color: #73d66d;
  }
  .annotate-drawer-container{
    display:flex;
  }
  .annotate-drawer-container .mask{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(55,55,55,.6);
    height: 100%;
    z-index: 1000;
  }
  .annotate-drawer-container .annotate-drawer-wrapper{
    position: fixed;
    overflow: auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(55,55,55,.6);
    z-index: 1000;
    -webkit-overflow-scrolling: touch;
    outline: 0;
  }
  .annotate-drawer-container .annotate-drawer-wrapper .annotate-drawer{
    display:flex;
    flex-direction:column;
    height: 100%;
    position: fixed;
    top: 0;
    left:100%;
    bottom: 0;
    width:500px;
    background-color: #fff;
  }
  .annotate-drawer-container .annotate-drawer-wrapper .annotate-drawer.active{
    transform: translateX(-100%);
    transition: 0.5s transform;
  }
  .annotate-drawer-container .annotate-drawer-wrapper .annotate-drawer .header{
    display:flex;
    justify-content:space-between;
    padding: 10px;
    border-bottom: 1px solid #00000026;
  }
  .annotate-drawer-container .annotate-drawer-wrapper .annotate-drawer .content{
    flex:1;
    padding: 30px 10px 30px 10px;
  } 
  .annotate-drawer-container .annotate-drawer-wrapper .annotate-drawer .footer{
    display:flex;
    justify-content: flex-end;
    padding: 10px;
    border-top: 1px solid #00000026;
  }
  .annotate-drawer-container .annotate-drawer-wrapper .annotate-drawer .footer a{
    padding: 8px 10px;
    margin-left: 10px;
    width:70px;
  }
  .annotate-drawer-container .annotate-drawer-wrapper .annotate-drawer span{
    font-size: 14px;
    font-weight: bold;
  }
  .annotate-drawer-container .annotate-drawer-wrapper .annotate-drawer .header a{
    border-bottom-style: none;
  } 
  .sample-table-extra{
      display: flex;
      align-items: center;
  }
  .sample-table-extra a{
    color: #999;
    display: flex;
    align-items: center;
  }
  .sample-table-extra a:first-child{
    margin-right: 5px;
  }
  .sample-table-extra a:hover{
    color:#2d8cf0;
  }
  .sample-table-extra span{
      font-size: 12px;
  }
  .tooltip-content{
      white-space: normal
  }
  .msRun-button-wrapper{
      display: flex;
      align-items: center;
  }
  .msRun-button-wrapper i:hover{
    cursor: pointer;
    opacity:0.6;
  }
  .hideRow{
    display: none;
  }
  .table-spin{
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    /* text-align: center; */
    justify-content: center;
    align-items: center;
    background-color: #f7f7f78f;
  }
  .no-data-table-wrapper{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .page-container{
    text-align: center;
    margin-top: 20px;
  }
</style>

<style>
    .add-col-table .new-col-table{
        /*display: none;*/
        border-right: none;
    }
    .add-col-table table{
        margin-bottom:0 !important;
        max-height: 400px;
        overflow-y: scroll;
    }
    /*.add-col-table tbody th, table tbody td, table thead th, table thead td, table tfoot th, table tfoot td{
        padding: 0 !important;
    }*/
    .dropdown-remote{
      position: absolute;
    }
    .dropdown-remote .ivu-select-dropdown{
        top: 30px !important;
        left: 0 !important;
        width: 300px;    
        max-height: 400px;
        overflow: scroll;
    }
    .dropdown-remote .ivu-select-dropdown .ivu-dropdown-item{
        position: relative;
    }
    .apply-all-button{
        position: absolute;
        left: 0;
        top: 0;
        padding: 7px 3px;
        display: none;
        z-index: 2000;
    }
    .dropdown-remote .ivu-select-dropdown .ivu-dropdown-item:hover > .apply-all-button{
        display: inline-block;
    }
    .inputError .ivu-input{
        border: 1px solid red !important;
    }
    .table-row{
      position: relative;
    }
    .table-row input{
        background-color:white;
        border:none;
        box-shadow:none;
    }
    .table-row input:focus{
      border: 1px solid #007cff;
      outline: 0;
      box-shadow: 0 0 0 2px rgba(45,140,240,.2);
    }
    .table-row:hover input{
        /*border: 1px solid #5bc0be;*/
    }
    .table-row .ivu-input-wrapper .ivu-icon-close-circled{
      display: none;
    }
    .table-row:hover .ivu-input-wrapper .ivu-icon-close-circled{
      display: inline-block;
    }
    .msrun-modal-table{
      height:30%;
    }
    .msrun-modal-table .ivu-table-cell{
        padding-left: 0; 
        padding-right: 0; 
    }
    .msrun-modal-table .ivu-table-cell .ivu-checkbox-wrapper{
      margin-right:0;
    }
    .msrun-modal-table .ivu-table-header table{
      margin-bottom:0 !important;
    }
    .msrun-modal-table .ivu-table-body table{
      margin-bottom:0 !important;
    }
    .msrun-modal-table .msrun-modal-table-accession{
      display: none;
    }
    .show-button-tooltip{
      width:100%;
    }
    .show-button-tooltip .ivu-tooltip-rel{
      width:100%;
      display: flex;
      align-items: center;
    }
    .show-button-tooltip .ivu-tooltip-inner{
      max-width:600px;
    }
    .card.annotation .card-content{
      overflow: auto;
      display: flex;
    }
    /*.add-col-table .ivu-table-body{
      max-height: 400px;
      overflow-y: scroll;
    }*/
    .addColModal .ivu-modal-body{
      max-height: 400px;
      overflow-y: scroll;
    }
    .ptmsResults-input input{
        color: #2d8cf0 !important
    }
</style>
