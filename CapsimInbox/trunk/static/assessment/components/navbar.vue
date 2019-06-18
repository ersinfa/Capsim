<template lang="html">
    <nav class="navbar navbar-default navbar-static-top" >
        <div class="container-fluid">
            <template v-if="isExam">
                <div class="text-center">
                    <br/>
                    <div v-if="!hideTimer" class="timer pull-left ml-15">
                        <span :class="[{ 'hide-time': !showTimer}, clockColor,$store.state.time.timerClass]" class="time mr-10">
                            {{ timer.minutes }}:{{ timer.seconds }}
                        </span>
                        <time-switch :selected="showTimer" v-model="showTimer" theme="default" color="blue" label="<span class='sr-only'>showHide</span>"></time-switch>
                        <span class="ml-10">Show/Hide</span>
                    </div>
                    <img class="logo" :src="`${$store.state.assetsPath}/capsiminbox/images/CapsimInbox_Logo_assessment_${$store.state.versionKey}.png`" alt="CapsimInbox">
                    <span style="color: #fff;margin-left: 10%;">
                        Name: {{userData.lastname}} {{userData.firstname}}
                    </span>
                    <a @click="completeAssessment" class="mr-15 ml-15 btn mat exit-inbox navbar-btn btn-modx-exit btn-primary-outline" href="#" style="float: right;">
                        <template v-if="$store.state.assessmentTypeKey == 3">
                            Exit Inbox    
                        </template>
                        <template v-else>
                            {{info.exit}}
                        </template>
                    </a>
                </div>
                <div class="clearfix"></div>
                <br/>
            </template>
            <template v-else>
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand p-5" href="#">
                        <img class="logo" :src="`${$store.state.assetsPath}/capsiminbox/images/CapsimInbox_Logo_assessment_${$store.state.versionKey}.png`" alt="CapsimInbox">
                    </a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                    <div v-if="!hideTimer" class="navbar-nav timer">
                        <template v-if="!showTimerAsClock">
                        <span class="mr-10">Time Remaining</span>
                            <span :class="[{ 'hide-time': !showTimer}, clockColor,$store.state.time.timerClass]" class="time mr-10">
                                {{ timer.minutes }}:{{ timer.seconds }}
                            </span>
                            <time-switch :selected="showTimer" v-model="showTimer" theme="default" color="blue" label="<span class='sr-only'>showHide</span>"></time-switch>
                            <span class="ml-10">Show/Hide</span>
                        </template>
                        <template v-else>
                            <span :class="[{ 'hide-time': !showTimer}, clockColor,$store.state.time.timerClass]" class="time mr-10">
                                {{ timer.hour }}:{{ timer.minutes }} AM
                            </span>
                        </template>   
                        
                    </div>
                 
                        <ul class="nav navbar-nav navbar-right">
                            <li><a @click="completeAssessment" class="mr-15 ml-15 btn exit-inbox navbar-btn btn-danger-outline" href="#">
                                <template v-if="$store.state.assessmentTypeKey == 1">
                                    {{info.exit}}
                                </template>
                                <template v-else>
                                    Exit Inbox    
                                </template>
                            </a></li>
                        </ul>   
                </div><!--/.nav-collapse -->
            </template>
        </div>
    </nav>
</template>

<script>
var timeSwitch = require('./inputs/switch.vue')
import { mapGetters } from 'vuex'

export default {

    data() {
        return {
            showTimer: true,
            clockColor: '',
            initial: true
        }
    },

    components: {
        timeSwitch
    },

    watch: {
        'timer'( val ) {
            if( val <= 300000 && val > 60000 ) this.clockColor = 'five-minutes'
            else if( val < 60000 ) this.clockColor = 'one-minute'
        }
    },

    methods: {
        completeAssessment() {
            EventBus.$emit('completeAssessment')
        }
    },

    watch: {
      unreadMessages( value, oldValue ) {
        let messagesLen = this.$store.getters['chat/activeMessages'].length
        if( value === messagesLen && this.initial ) return
        if( oldValue < value ) {
          this.initial = false
        }
      }
    },

    computed: {
        unreadMessages() {
            if( this.unansweredEmails.length === 0 )
                return this.activeMessages.filter( message => !message.isRead ).length
            else
                return this.activeMessages.filter( message => message.timer <= this.elapsed && !message.isRead ).length
        },
        ...mapGetters('email', [
            'unansweredEmails'
        ]),
        ...mapGetters('chat', [
            'activeMessages'
        ]),
        timer() {
            return this.$store.state.time
        },
        colorTheme(){
            return `nav-theme-${this.isExam}`
        },
        versionKey(){
            if(this.$store.state){
                return this.$store.state.versionKey; 
            }
        },
        isExam(){
            if(this.$store.state){
                return this.$store.state.isExam; 
            }
        },
        userData(){
            if(this.$store.state){
                return this.$store.state.userData; 
            }
        },
        info(){
            if(this.$store.state){
                return this.$store.state.info
            }
        },
        elapsed() {
            return this.$store.getters['time/elapsed']
        },
        //this is mapped from version settings and hides the entire timer Div, including the showTimer toggle
        hideTimer(){
            return this.$store.state.userData.hideTimer
        },

        showTimerAsClock(){
            return this.$store.state.userData.showTimerAsClock
        },

    },
}
</script>

<style lang="scss" scoped>

.nav-theme-1{
    background-color: #1572d5  !important
}
nav {
    background-color: #65757d;
    margin-bottom: 0;
    border: none;

    .logo {
        height: 40px;
    }

    .navbar-right {
      .exit-inbox {
        background-color:#ffffff !important;
        color: black !important;
        line-height: 5px;
        border-color: #c20611 ;
        border-width: 1px;

        &:hover, &:focus {
          background-color: #c20611 !important;
          color: white !important;
        }
      }
      
    }

    .navbar-collapse {
        text-align: center;
    }

    ul {
        li {
            a {
                color: white !important;
                font-size: 18px;
                &:hover {
                    -webkit-transition: all 350ms cubic-bezier(0.19, 1, 0.22, 1);
                    transition: all 350ms cubic-bezier(0.19, 1, 0.22, 1);
                    background-color: rgba(255,255,255,0.15) !important;
                }

            }
        }
    }

    .unread-messages {
        position: absolute;
        bottom: 15px;
        right: 0px;
        background-color: #DF0816 ;
        border-radius: 15px;
        width: 20px;
        height: 15px;
        line-height: 15px;
        font-size: 10px;
    }

    // .btn-modx-exit{
    //     background-color: #CFCFCF;
    //     border-color: #474747;
    //     color: #000000;
    // }
    // .btn-modx-exit:hover{
    //     background-color: #AFAFAF;
    //     border-color: #272727;
    // }

    .timer {
        line-height: 50px;
        color: white;
        display: inline-block;
        float: none;

        .time {
            box-shadow: 0 2px 2px 0 rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.08);
            background-color: white;
            border-radius: 2px;
            padding: 8px;
            width: 30px;
            color: black;
            &.hide-time {
                color: white;
            }
            &.five-minutes {
                background-color: yellow;
            }
            &.one-minute {
                background-color: #DF0816;
                color: white;
            }
            &.timeImpactEffect{
            	-webkit-animation: timeImpactFlash linear 1s;
            	animation: timeImpactFlash linear 1s;
            }
            @-webkit-keyframes timeImpactFlash {
                0% { background-color: #23bd40; }
                100% { background-color: #fff; }
            }

            @keyframes timeImpactFlash {
                0% { background-color: #23bd40; }
                100% { background-color: #fff; }
            }
        }
    }

}

</style>
