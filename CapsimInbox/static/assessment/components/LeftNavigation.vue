<template>
    <div class="left-nav no-gutters" :class="[ { 'text-center': !isOpen }, colClass]">

        <span ref="openButton" v-show="!isOpen" @click="open" class="handle glyphicon glyphicon-menu-right"></span>

        <template v-if="!(isExam == 1)">
            <span v-show="isOpen" @click="close" class="handle glyphicon glyphicon-menu-left pull-right mr-10"></span>
        </template>

        <div v-show="isOpen" class="panels-container" :class="classObject" :style="(isExam == 1? 'margin-left:16px' : '')">

            <!-- Exam Side Nav  -->
            <template v-if="isExam == 1">
                <CapsimContainer :header="remainingQuestions">
                    <hr slot="bottom" v-if="windowHeight>650">
                    <!-- <CapsimList className="rand" :isHtml="true" :collection="remainingMessages" /> -->
                </CapsimContainer>

                <CapsimQuestionList prefix="Question" :onClick="selectEmail" :collection="groupedMessages" />
 
                <CapsimContainer  header="Files" >
                    <hr slot="top">
                    <template v-if="assessmentTypeKey == constants.ASSESSMENT_TYPE_KEY.WEBAPP">
                        <a href="/capsiminbox/webapp/reports/annual-report" target="_blank">Annual Report (Jasper)</a><br/>
                        <a href="/capsiminbox/webapp/reports/images/boxplot.png" target="_blank">Box Plot</a><br/>
                        <a href="/capsiminbox/webapp/reports/production-information-report" target="_blank">Industry Production Report</a><br/>
                        <a href="/capsiminbox/webapp/reports/images/scatterplot.png" target="_blank">Scatter Plot</a><br/>
                        <a href="/capsiminbox/webapp/reports/stock-bond-report" target="_blank">Stock & Bond Summary</a><br/>
                        <a href="/capsiminbox/webapp/reports/images/supplydemand.jpg" target="_blank">Supply/Demand Diagram</a><br/>
                    </template>
                    <template v-else-if="assessmentTypeKey == constants.ASSESSMENT_TYPE_KEY.REHEARSAL">
                        <a href="/capsiminbox/rehearsal/annual-report" target="_blank">Annual Report (Jasper) </a><br/>
                        <a href="/capsiminbox/rehearsal/production-information-report" target="_blank">Industry Production Report</a><br/>
                        <a href="/capsiminbox/rehearsal/stock-bond-report" target="_blank">Stock & Bond Summary</a><br/>
                    </template>
                </CapsimContainer>
            </template>

            <!-- Inbox Side Nav  -->
            <template v-else>
                <!-- Email folders -->
                <h5 class="panel-title m-10 pl-25">Folders</h5>

                <!-- Email folders -->
                <CapsimList 
                    className="list-group-item ml-20 mr-20 mt-10"
                    :onClick="selectFolder"
                    :collection="emailFolders"
                    :badges="emailBadges" />
                <!-- /Email folders -->

                <hr class="m-20">

                <!-- Drive -->
                <div class="pt-20 pb-20 drive-section">
                    <h5 class="panel-title mt-20 m-10 pl-25">Drive</h5>
                    <ul class="pl-30 m-5 my-drive">
                        <li class="folder-title pb-15 pt-10" v-for="folder in folders">
                            <span @click="folder.isOpen = !folder.isOpen" :class="[ folder.isOpen ? 'glyphicon glyphicon-folder-open' : 'glyphicon glyphicon-folder-close' ]" class="ml-5 mr-5"></span>
                            <span @click="folder.isOpen = !folder.isOpen">{{ folder.name }}</span>
                            <ul class="pl-30">
                                <li v-show="folder.isOpen && isFileAvailable(file)" @click="openFile(file)" v-for="file in getFiles(folder.fileFolderKey)" data-toggle="modal" data-target="#myModal" class="file pt-10 mt-5">
                                    <span :class="['glyphicon', 'p-5', getFileIcon(file)]"></span>
                                    <span>{{ file.displayName }}</span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <!-- Chat -->
                <div>
                    <hr class="m-20">
                    <h5 class="panel-title m-10 pl-25">Instant Messages</h5>
                    <newChat v-if="$store.getters['time/elapsed'] > 1000"></newChat>
                </div>    
            </template>
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { groupBy, orderBy, cloneDeep  } from 'lodash'
import Modal from '../../shared_components/Modal.vue'
import CapsimList from '../../shared_components/CapsimList.vue'
import CapsimQuestionList from '../../shared_components/CapsimQuestionList.vue'
import CapsimContainer from './CapsimContainer.vue'
import InboxItem from './InboxItem.vue'
import NewChat from '../../shared_components/newChat/index.vue'
import { setTimeout } from 'timers';

export default {

    data() {
        return {
            emailFolders:{
                cleanEmails: 'Inbox',
                answeredEmails: 'Sent Items'
            },
            emailfolder: 0,
            size: 2,
            min: 0.5,
            max: 2,
            selectedEmail: undefined,
            currentFilter: 'all',
            activeFolder: 'cleanEmails',
            windowHeight: 0,
        }
    },

    watch: {
        // wait for firstEmail to be loaded, its not loaded by nextTick
        firstEmail(value, next) {
            if(this.isExam === 1 && value && next === undefined){
                this.selectEmail(this.firstEmail)
            }
        },
    },


    computed: {

        ...mapGetters('email', [
            'cleanEmails',
            'unansweredEmails',
            'answeredEmails',
            'sortedEmails'
        ]),

        constants(){
            return this.$store.getters.constants;
        },
        
        assessmentTypeKey(){
            return  this.$store.state.assessmentTypeKey
        },

        classObject(){
            if(this.isExam == 1 && this.windowHeight < 650){
                return 'mt-5'
            }else{
                return 'mt-30'
            }
        },

        computedStateCompleted(){
            return this.$store.emails
            .filter( email => email.dependsOn == null )
            .filter( email => (email.isSent) )
            .filter( e => e.answers.length > 0 )
            .every( e => e.answer !== undefined )
        }, 
        
        elapsed() {
            return this.$store.getters['time/elapsed']
        },

        //this ensures the counter badge matches the logic in the inbox component that delivers the time-delay emails,
        //even when the remaining emails get delivered ahead of the time delay since they are the last once remaining.
        inboxCount(){
            let remainingEmails = this.cleanEmails.length
            let totalEmailsToAnswer = this.sortedEmails.filter(e => e.answers.length > 0).length
            let undeliveredEmailsCount = this.cleanEmails.filter( e =>  e.timer >= this.elapsed ).length
            let answeredEmailsCount = this.answeredEmails.length
            if(undeliveredEmailsCount + answeredEmailsCount >= totalEmailsToAnswer){
                return remainingEmails 
            } else {
                return remainingEmails - undeliveredEmailsCount
            }
        },
        
        emailBadges() {
          return [
            this.inboxCount,
            this.answeredEmails.length
          ]
        },

        colSize() {
            var arr = this.size.toString().split('.')
            return (arr.length > 1) ? `${arr[0]}${arr[1]}` : `${arr[0]}`
        },

        colClass() {
            if(this.isExam == 1){
                return `col-lg-3 col-md-4 `;
            }
            return `col-md-${this.colSize}`;
        },

        isOpen() {
            return (this.size == this.max) ? true : false
        },

        isExam(){
            if(this.$store.state){
                return this.$store.state.isExam; 
            }
        },

        remainingQuestions(){
            return `<div class="text-center">Questions Remaining <br/>${this.unansweredEmails.length} of ${this.cleanedEmails.length}</div>`
        }, 

        groupedMessages(){
            return groupBy(this.$store.state.emails, 'competencyName')
        }, 

        remainingMessages(){
            const groupedList = groupBy(this.unansweredEmails, 'competencyName')
            const newList = Object.keys(groupedList).map( (item, index) => {
                return `<span>${item}:</span>  <span class="pull-mid"> ${groupedList[item].length} </span>`
            })
            return newList
        },

        filteredMessages() {
            let activeFolder = this[this.activeFolder]
            if( this.currentFilter === 'all' ) return activeFolder
            else if( this.currentFilter === 'flaggedEmails' ) return activeFolder.filter( email => email.isFlagged )
            else if( this.currentFilter === 'unansweredEmails' ) return this.unansweredEmails.filter( email => !email.isSent )
        },

        cleanedEmails(){
             return this.$store.state.emails; 
        },

        ...mapGetters('email', [
            'cleanEmails',
            'flaggedEmails',
            'unansweredEmails',
            'answeredEmails',
            'firstEmail'
        ]),
        ...mapGetters([
            'files',
            'folders'
        ]),
    },

    methods: {

        close() {
            this.size = this.min
            EventBus.$emit('close')
        },

        isActive( email ) {
            return ( this.selectedEmail && this.selectedEmail == email ) ? true : false
        },

        selectEmail( email ) {
            this.selectedEmail = email
            this.$emit('selectEmail', email )
        },

        emailSelected( email ) { this.currentEmail = email },

        openReportJson(event) { 
            const url = event.target.id 
            window.open(`/capsiminbox/webapp/reports/${url}`)
         }, 

        saveExam(){
            EventBus.$emit('completeAssessment')
        }, 

        isFileAvailable( file ) {
          return ( this.$store.getters['email/emailsCompleted'] )
            ? true
            : (file.timer < this.elapsed)
              ? true
              : false
        },

        getFiles(folderKey) {
            return this.files.filter( file => file.FK_fileFolderKey === folderKey )
                    .sort( (a, b) => (a.sequence > b.sequence) ? (1) : (a.sequence < b.sequence) ? (-1) : (0) )
        },

        openFile(file) {
            this.$emit('openFile', file)
        },

        selectFolder(idx, key) {
            this.emailfolder = idx
            EventBus.$emit('showFolder', key)
        },

        resize() {
            this.$refs.openButton.style.marginTop = `${(this.$el.offsetHeight - this.$refs.openButton.offsetHeight) / 2}px`
        },

        setSize(newSize){
            this.size = newSize; 
        },

        open() {
            this.size = this.max
            EventBus.$emit('open')
        },
        

        getFileIcon(file) {
          let docType = file.FK_fileTypeKey
          switch (docType) {
            case 1: return 'glyphicon-picture'
            case 2: return 'glyphicon-play-circle'
            default: return 'glyphicon-file'

          }
        }
    },
    components:{
        Modal,
        InboxItem,
        CapsimList,
        CapsimContainer,
        CapsimQuestionList,
        NewChat
    }, 

    mounted() {
        this.$nextTick(() => this.resize())
        window.addEventListener('resize', this.resize())

        this.windowHeight = window.innerHeight
        this.$nextTick(() => {
            window.addEventListener('resize', () => {
                this.windowHeight = window.innerHeight
            });
        })
    },

}
</script>
<style lang="scss">
.left-nav {
    height: 100%;
    background-color: #474747;
    // background-color: #1b222c;
    color: #ffffff !important;
    overflow-y: auto;

    h5 {
        letter-spacing: 0.1rem;
    }

    .handle {
        margin-top: 5px;
        margin-right: 5px;
        cursor: pointer;
        padding: 4px;
        background: rgba(255,255,255,0.20);
        border-radius: 10%;
    }

    .panel-title {
        .glyphicon {
            margin-right: 5px;
            font-size: 14px;
        }
    }

    .panels-container {

        hr {
            border-color: #313d4f;
        }

        .list-group-item {
            border: none !important;
            box-shadow: none !important;
            background: none;
            cursor: pointer;
            border-radius: 4px;
            &.active {
                // background: rgba(144, 170, 183, 0.45);
                background: rgba(207, 207, 207, 1);
                color: #000 !important;
                
            }
            .badge{
                color: #000 ;
                background-color: #fff;
            }
        }

        .drive-section{
          background-color: lightgrey; 
          color:#000;
        }

        ul.my-drive{
            margin: 0px 0px 0px 20px;
            list-style: none; line-height: 2em; font-family: Arial;
            li{
                font-size: 16px;
                position: relative;
                &:before{
                    position: absolute;
                    left: -15px;
                    top: 0px;
                    content: '';
                    display: block;
                    border-left: 2px solid #50606a;
                    height: 1.5em;
                    border-bottom: 2px solid #50606a;
                    width: 10px;
                }

                &:after{
                    position: absolute;
                    left: -15px;
                    bottom: -7px;
                    content: '';
                    display: block;
                    border-left: 2px solid #50606a;
                    height: 100%;
                }

                &.root{
                    margin: 0px 0px 0px -20px;
                    &:before{
                        display: none;
                    }

                    &:after{
                        display: none;
                    }


                }


                &:last-child{
                    &:after{ display: none }
                }
            }
        }

        .folder-title {
            cursor: pointer;
            font-size: 1.2rem;
        }

        .file {
            cursor: pointer;
            font-size: 14px !important;
            color: #000;
            border-radius: 2px;
            list-style-type: none;
            span:nth-of-type(1) {
                border-top-left-radius: 2px;
                border-bottom-left-radius: 2px;
                top: 0px;
            }
        }

    }
}
</style>
