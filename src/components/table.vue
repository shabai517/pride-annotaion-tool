<template>
  <div class="archive-container">
      <Card id="sample-card" class="card annotation">
          <p slot="title" class="resource-list-title-container">
            <span>{{name}}</span>
          </p>
          <p v-if="sampleData.length>0 && sampleCol.length>0" slot="extra" class="sample-table-extra">
            <a @click="showAddColModal"><span>Add Col</span><Icon type="ios-add" size="20"></Icon></a>
            <a @click="addRow"><span>Add Row</span><Icon class="add-row-icon" type="ios-add" size="20"></Icon></a>
          </p>
          <div class="card-content" @scroll="scroll" :style="{height:height + 'px'}">
              <div v-if="sampleData.length == 0" class="no-data-table-wrapper">
                  <span>No data</span>
              </div>
              <div v-else>
                  <div :style="{'padding-top': rowStart*45+'px'}"></div>
                  <div class="table-col" v-for="(itemCol,i) in sampleCol" :key="itemCol.key">
                      <div class="table-row first handle"><Icon v-if="itemCol.key!='accession'" class="icon-in-th-left" type="ios-remove-circle-outline" @click="removeAll(itemCol.key,'sampledata')" size="14"></Icon>{{itemCol.name}}<Icon class="icon-in-th-right" type="ios-remove-circle-outline" v-if="!itemCol.required" @click="deleteCol(itemCol,i)" size="14"></Icon></div>
                      <div class="table-row" v-for="(itemRow,j) in sampleData.slice(rowStart,rowEnd)">
                            <div v-if="itemCol.key!='accession'">
                                  <Input :class="{inputError:!itemRow[itemCol.key].checked}" size="small" type="text" v-model="itemRow[itemCol.key].value" :icon="itemRow[itemCol.key].value ? 'close-circled':''" @on-click ="removeInputContent(itemRow[itemCol.key])" @on-change="getAutoCompleteList(itemCol,itemRow)" @on-focus="focus($event,itemCol,itemRow,'sampledata',j)" @on-blur="inputBlur(itemRow[itemCol.key])">
                                  </Input>
                            </div>
                            <div v-else>
                                <div class="accession-col">
                                    <Icon v-if="sampleData.length>1 && j == sampleData.length-1" class="icon-in-row" type="ios-remove-circle-outline" @click="deleteRow(itemRow,j)" size="14"></Icon>
                                    <Input :class="{inputError:!itemRow[itemCol.key].checked}" size="small" type="text" v-model="itemRow[itemCol.key].value" :icon="itemRow[itemCol.key].value ? 'close-circled':''" @on-click ="removeInputContent(itemRow[itemCol.key])" @on-change="getAutoCompleteList(itemCol,itemRow)" @on-blur="inputBlur(itemRow[itemCol.key])">
                                    </Input>
                                    <!-- <span>{{itemRow.accession}}</span> -->
                                </div>
                            </div>
                            <div class="copy-icon"><Icon @click="showCopyModal(itemRow[itemCol.key],itemCol.key,j)" type="ios-copy-outline" size="16"></Icon></div>
                      </div>
                  </div>
                  <div :style="{'padding-top': (sampleData.length-rowEnd)*45+'px'}"></div>
                  <div class="sample-table-extra add-row-icon">
                    <!--  <Icon class="add-row-icon" type="plus-round" @click="addRow" size="20"></Icon><span>Add Sample</span> -->
                  </div>
                  <div :style="{'padding-top': rowStart*30+'px'}"></div>
              </div>
          </div>
          <Dropdown class="dropdown-remote" :style="{left:dropdown.left + 'px', top:dropdown.top + 'px'}" trigger="custom" :visible="dropdown.visible" placement="bottom-end" @on-click="dropdownClick($event,dropdown.row[dropdown.col.key])">
              <DropdownMenu slot="list">
                  <DropdownItem v-if="dropdownOptions.length == 0" name="nodata">No data
                      <Icon class="apply-all-button" type="arrow-down-a" size="15" @click.stop="applyAll('no data',dropdown.col,dropdown.row,dropdown.type,dropdown.index)"></Icon>
                  </DropdownItem>
                  <DropdownItem v-for="item in dropdownOptions" :name="item.name" :key="item.name">{{item.name}}
                      <Icon class="apply-all-button" type="arrow-down-a" size="15" @click.stop="applyAll(item.name,dropdown.col,dropdown.row,dropdown.type,dropdown.index)"></Icon>
                  </DropdownItem>
              </DropdownMenu>
          </Dropdown>
          <Spin class="table-spin" v-if="tableLoading"></Spin>  
      </Card>
      <Modal
          title="Add Column"
          v-model="addColumnBool"
          :closable="false"
          @on-ok="addCol"
          @on-visible-change="modalVisibleChange">
          <Table border ref="addPropertyTable" class="add-col-table" :columns="newCol" :data="sampleCol" @on-selection-change="newColSelectChange"></Table>
      </Modal>
      <Modal
          title="Copy"
          v-model="copyModalBool"
          :closable="false"
          @on-ok="copy"
          @on-visible-change="copyModalVisibleChange">
          <Input id="text-to-copy" v-model="copyValue" type="textarea" placeholder="Enter something..." :rows="8"/>
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
    props: ['columns','data','loading','height','name'],
    data(){
      return {
          sampleData: cloneDeep(this.data),
          sampleCol: cloneDeep(this.columns),
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
                  key: 'cvLabel',
                  width:1,
                  render:(h,params)=>{
                    return h('div')
                  },
                  // width:0.1,
                  className:'new-col-table', 
              },
              {
                  title: '',
                  key: 'accession',
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
              {
                  title: '',
                  key: 'orignal_name',
                  width:1,
                  render:(h,params)=>{
                    return h('div')
                  },
                  // width:0.1,
                  className:'new-col-table' 
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
              }
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
          rowEnd:0,
          tableLoading:false,
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
              let searchValue = itemRow[itemCol.key].value;
              if(searchValue)
                  itemRow[itemCol.key].icon = 'close-circled'
              else{
                  itemRow[itemCol.key].icon= '';
                  this.dropdown.visible = false;
                  return;
              }
              this.dropdownOptions=[];
              let query={
                attributeAccession: itemCol.accession,
                ontologyAccession: itemCol.cvLabel,
                keyword:searchValue
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
                        if(res.body.length>0 || searchValue){
                          //itemRow[itemCol.key].dropdown=true;
                          this.dropdown.visible = true
                        }

                        this.dropdownOptions=res.body;
                        if(this.dropdownOptions.length == 0){
                            itemRow[itemCol.key].value==searchValue;
                        }
                    }
                    catch(e){
                        console.log(e.message)
                    }
              }, 500);
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
          focus(e,itemCol,itemRow,type,index){
              let left = e.target.parentNode.parentNode.parentNode.offsetLeft-document.querySelector('.card-content').scrollLeft;
              let top = e.target.parentNode.parentNode.parentNode.offsetTop;

              itemRow[itemCol.key].active=true;

              this.dropdown.focus = itemCol.key+index
              this.dropdown.visible = false
              this.dropdown.index = index
              this.dropdown.type = type
              this.dropdown.col = itemCol
              this.dropdown.row = itemRow
              this.dropdown.top = top
              this.dropdown.left =left

              console.log(this.dropdown);
              if(!itemRow[itemCol.key].value)
                return;
              this.getAutoCompleteList(itemCol,itemRow);
          },
          inputBlur(item){
            this.pasteIndex = null;
            this.blur(item)
          },
          blur(item){
              console.log('blurblur',item);
              item.active=false;
              //item.dropdown = false;
              if(item.col.required){
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
                this.dropdown.type = null
                this.dropdown.col = null
                this.dropdown.row = null
              },100);
          },
          removeInputContent(item){
              //item.dropdown = false;
              item.value="";
              item.icon="";
          },
          showAddColModal(){
            this.newColumnNameSelectedArray=[];
            this.addColumnBool=true;
          },
          addCol(){
              let keyArray = [];
              for(let i=0; i<this.newColumnNameSelectedArray.length; i++){
                  let item = {
                    experimentType:this.experimentType,
                    required: false,
                    cvLabel:this.newColumnNameSelectedArray[i].cvLabel,
                    accession:this.newColumnNameSelectedArray[i].accession,
                    name:this.newColumnNameSelectedArray[i].name,
                    orignal_name:this.newColumnNameSelectedArray[i].orignal_name,
                    key: this.newColumnNameSelectedArray[i].key + Date.now()
                  }
                  keyArray.push(item);
                  this.sampleCol.push(item);
              }
              //console.log('keyArray', keyArray);
              for(let i=0; i<this.sampleData.length; i++){
                  for(let j=0; j<keyArray.length; j++){
                      this.$set(this.sampleData[i], keyArray[j].key,{
                          value:'',
                          dropdown:false,
                          accession:'null',
                          cvLabel:'null',
                          col:keyArray[j],
                          icon:'',
                          checked:true,
                      })
                  }
              }
          },
          deleteCol(itemCol, index){
            console.log('delete',itemCol,index);
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
          },
          addRow(){
            let item={};
            for(let i=0;i<this.sampleCol.length;i++){
                item[this.sampleCol[i].key] = {
                    value:'',
                    dropdown:false,
                    accession:'null',
                    accessionKey:this.accessionKey,
                    cvLabel:'null',
                    col:this.sampleCol[i],
                    icon:'',
                    checked:true,
                } 
            }
            item.accession={
                value:"PXD_S"+(this.sampleData.length+1),
                dropdown:false,
                accession:'null',
                accessionKey:this.accessionKey++,
                cvLabel:'null',
                col:this.sampleCol[0],
                icon:'',
                checked:true,
            }
            //console.log('this.sampleCol.length+1',this.sampleData.length+1);
            this.sampleData.push(item);
          },    
          deleteRow(itemRow, index){
              this.sampleData.splice(index,1);
              // //update row index
              // for(let i=0; i<this.sampleData.length; i++){
              //   this.sampleData[i].accession.value = "PXD_S"+(i+1);
              // }
          },
          showCopyModal(item,col,row){
            this.pasteIndex = {item,row,col};
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
              setTimeout(()=>{
                this.tableLoading=true;
                let msrunBool = null;
                let tempArray = this.copyValue.split('\n');
                console.log(this.sampleNumber * this.fractionNumber)
                console.log(this.pasteIndex.row)
                console.log(tempArray.length)
                if((this.sampleNumber * this.fractionNumber - this.pasteIndex.row) < tempArray.length){
                  this.tableLoading=false;
                  this.$Message.error({content:'Not enough rows to paste, please check', duration:2});
                  return
                }
                for(let i in this.msRunArray[0]){
                    if(this.pasteIndex.col == i){
                      msrunBool = true;
                      break;
                    }
                }
                if(!msrunBool)
                  for(let i=0; i< tempArray.length; i++){
                      if(this.sampleData[parseInt(this.pasteIndex.row)+parseInt(i)]){
                        this.sampleData[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].value= tempArray[i];
                        this.sampleData[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].icon= 'close-circled';
                        this.sampleData[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].checked = true;
                      }
                  }
                else{
                  if(this.pasteIndex.col != 'msrun')
                      for(let i=0; i< tempArray.length; i++){
                          if(this.msRunArray[parseInt(this.pasteIndex.row)+parseInt(i)]){
                            this.msRunArray[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].value= tempArray[i];
                            this.msRunArray[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].icon= 'close-circled';
                            this.msRunArray[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].checked = true;
                          }
                      }
                  else{
                      for(let i=0; i< tempArray.length; i++){
                          if(this.msRunArray[parseInt(this.pasteIndex.row)+parseInt(i)]){
                            let found = false;
                            for(let j=0; j<this.msRunModalTableData.length; j++){
                                if(tempArray[i] == this.msRunModalTableData[j].name){
                                  found = true;
                                  break;
                                }
                            }
                            if(found){
                                this.msRunArray[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].value= tempArray[i];
                                this.msRunArray[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].icon= 'close-circled';
                                this.msRunArray[parseInt(this.pasteIndex.row)+parseInt(i)][this.pasteIndex.col].checked = true;
                            }
                          }
                      }
                  }
                }
                this.blur(this.pasteIndex.item);
              },80)
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
            item.dropdown=false;
            if(e == "nodata" && !item.value){
                item.icon="";
                return;
            }
            item.value=e;
            item.checked=true;
            
            for(let i=0; i<this.dropdownOptions.length;i++){
                if(this.dropdownOptions[i].name==e){
                    item.accession = this.dropdownOptions[i].accession;
                    item.cvLabel = this.dropdownOptions[i].cvLabel;
                    break;
                }
            }
            this.blur(item)
          },
          newColSelectChange(selection){
              this.newColumnNameSelectedArray=selection;
          },
          applyAll(name,itemCol,itemRow,type,index){
               this.tableLoading=true;
               let tempValue = itemRow[itemCol.key].value;
               this.dropdownClick(name,itemRow[itemCol.key]);
               this.$nextTick(()=>{ //make the value bind with the input first and then apply this value to all the other rows
                  if(type == 'sampledata')
                    for(let i=index;i<this.sampleData.length; i++){
                        let newItem =  JSON.parse(JSON.stringify(itemRow[itemCol.key]));
                        if(tempValue == this.sampleData[i][itemCol.key].value || !this.sampleData[i][itemCol.key].value)
                          this.sampleData[i][itemCol.key] = newItem;
                        
                    }
                  this.blur(itemRow[itemCol.key]);
              });
          },
          removeAll(key,type){
              //this.tableLoading=true;
              console.log('remove all',key,type);
              if(type == 'sampledata')
                for(let i=0;i<this.sampleData.length; i++){
                    this.sampleData[i][key].value = '';
                    if(this.sampleData[i][key].col.required)
                        this.sampleData[i][key].checked = false;
                }
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
          removeAnnotationFile(){

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
            console.log('e',e)
            let scrollTop = e.target.scrollTop
            let scrollHeight = e.target.scrollHeight
            let clientHeight = e.target.clientHeight
            console.log('e',e)
            console.log('scrollTop',scrollTop)
            console.log('scrollHeight',scrollHeight)
            console.log('clientHeight',clientHeight)
            let offset = (scrollTop + clientHeight) / scrollHeight
            let start = Math.max(Math.ceil(offset * this.sampleData.length) - 50, 0)
            this.rowStart = Math.min(start, this.sampleData.length - 75)
            this.rowEnd = this.rowStart + 75
            console.log(this.rowStart,this.rowEnd)
          }
    },
    watch: {
        sampleData:{
          handler(){
            if(this.sampleData.length>0 || this.msRunArray.length>0)
              setTimeout(()=>{
                this.$emit('update', this.sampleData)
              },50)
          },
          deep:true
        }
    },
    computed:{
      // listSample: function(){
      //   return this.sampleData.slice(this.start, this.end)
      // },
      // listMsRun: function(){
      //   return this.sampleData.slice(this.start, this.end)
      // },
    },
    mounted: function(){
      console.log(this.data)
      console.log(this.sampleData)
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
      border-left: 1px solid #e9eaec;
  }
  .table-col{
      flex:1;
      min-width: 200px;
      border-right: 1px solid #e9eaec;
  }
   .table-col:last-child{
      min-width: 350px;
  }
  .table-row:first-child{
      min-width: 100px;
      border-top: 1px solid #e9eaec;
      background-color: #f8f8f9;
      align-items: center;
      height:40px; 
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
      border-bottom: 1px solid #e9eaec;
      padding: 10px 20px 10px 5px;
      position: relative;
      height:45px;
  }
  .table-row.first{
    cursor: all-scroll;
    padding:10px 20px;
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
  .icon-in-th-right{
    position: absolute;
    right: 10px;
    cursor: pointer;
  }
  .icon-in-th-left{
    position: absolute;
    left: 3px;
    cursor: pointer;
  }
  .icon-in-row{
    /*position: absolute;
    left: 10px;*/
    cursor: default;
    margin-right: 5px;
  }
  .add-col-table{
    /*height: 500px;*/
  }
  .accession-col{
    text-align: center;
    position: relative;
    min-width: 80px;
    display: flex;
    align-items: center;
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
</style>

<style>
    .add-col-table .new-col-table{
        /*display: none;*/
        border-right: none;
    }
    .add-col-table table{
        margin-bottom:0 !important;
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
</style>
