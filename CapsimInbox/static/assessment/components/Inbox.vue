<template>
    <div class="inbox col-md-3">
        <div ref="heading" class="text-center col-md-12 inbox-toolbar">
            <b class="mr-10">Filter by: </b>
            <div class="btn-group text-center" role="group" aria-label="Filter Emails">
                <button @click="currentFilter = 'all'" class="btn btn-default" :class="{ active: currentFilter === 'all' }">All</button>
                <button v-show="activeFolder == 'cleanEmails'" @click="currentFilter = 'unansweredEmails'" class="btn btn-default" :class="{ active: currentFilter === 'unansweredEmails' }">Unanswered</button>
                <button @click="currentFilter = 'flaggedEmails'" class="btn btn-default" :class="{ active: currentFilter === 'flaggedEmails' }">Flagged</button>
            </div>
        </div>
        <div ref="mailWrapper" class="emails-wrapper">
            <template v-if="!filteredEmails.length && activeFolder === 'answeredEmails'">
                <h4 class="text-center mt-20">There are no emails in the Sent Mail folder.</h4>
                <div class="text-center mt-20">A fresh start!</div>
            </template>
            <template v-else>
              <transition-group name="list" mode="out-in">
                <template v-for="(email, idx) in activeFolder != 'answeredEmails' ? deliveredEmails : answeredEmails">
                    <inboxItem
                        v-on:selected="selectEmail"
                        v-if="idx == 0 && $store.state.assessmentTypeKey == 2"
                        data-container="body" data-toggle="popover" data-trigger="manual" data-placement="right" :data-content="popoverText"
                        :email="email"
                        :class="{ selected: isActive( email ) }"
                        :key="email.questionKey">
                    </inboxItem>
                    <inboxItem
                        v-else
                        v-on:selected="selectEmail"
                        :email="email"
                        :class="{ selected: isActive( email ) }"
                        :key="idx">
                    </inboxItem>
                </template>    
              </transition-group>
            </template>
        </div>
    </div>
</template>
<script>

import InboxItem from './InboxItem.vue'
import { mapGetters } from 'vuex'

export default {

    name: "inbox",

    data() {
        return {
            selectedEmail: undefined,
            currentFilter: 'all',
            activeFolder: 'cleanEmails',
            popoverText: 'Select the first email to learn more about the assessment interface.',
            recentlyDeliveredEmails: []
        }
    },

    components: {
        InboxItem
    },

    computed: {
        ...mapGetters('email', [
            'cleanEmails',
            'flaggedEmails',
            'unansweredEmails',
            'answeredEmails',
            'sortedEmails',
            'threadEmails'
        ]),

        elapsed() {
            return this.$store.getters['time/elapsed']
        },

        deliveredEmailsLog(){
            return this.$store.state.deliveredEmailsLog
        },

        showUndeliveredEmails(){
            let deliveredEmailsWithAnswers = this.filteredEmails.filter( email => ( !this.initial && (email.timer <= this.elapsed ) && email.answers.length > 0 ) )
            return deliveredEmailsWithAnswers.length == 0
        },

        deliveredEmails(){
            let emails = []
            let undeliveredEmails = []
            let hour = this.$store.state.time.hour
            let minutes = +this.$store.state.time.minutes
         
            emails = this.filteredEmails
                        .filter( email => ( !this.initial && (email.timer <= this.elapsed ) ) )
                        .map( email =>{
                            if(this.deliveredEmailsLog.indexOf(email.questionKey) == -1 && this.recentlyDeliveredEmails.indexOf(email.questionKey) == -1){
                                undeliveredEmails.push(email.questionKey)
                            } 
                            return (email.timestamp) 
                            ? email 
                            : !this.$store.state.userData.showTimerAsClock 
                                ? Object.assign(email, {timestamp: this.$moment()})
                                : Object.assign(email, {timestamp: this.$moment({day: 4, hour: hour, minute: minutes}).format('[Today], h:mm a') } )
                        })
            //if all the emails are delivered, deliver one more, but not all of them
            if ( this.$store.getters['email/emailsCompleted'] || this.showUndeliveredEmails) {
                if(this.filteredEmails){
                    let emailToDeliver = this.filteredEmails.find(e => e.timer > this.elapsed && e.answers.length > 0 )
                    if(emailToDeliver) {
                        emailToDeliver = Object.assign(emailToDeliver, {timestamp:  this.$moment({day: 4, hour: 8, minute: minutes}).format('[Today], h:mm a')}  ) 
                        this.$store.commit("email/AUTO_DELIVER_EMAIL", emailToDeliver)
                    }
                }
            }             
            
            undeliveredEmails.map( e => this.recentlyDeliveredEmails.push(e))
            if (undeliveredEmails.length > 0) this.logEmailsAsDelivered(undeliveredEmails)
            return emails
        },

        filteredEmails() {
            let activeFolder = this[this.activeFolder]
            if( this.currentFilter === 'all' ) return activeFolder
            else if( this.currentFilter === 'flaggedEmails' ) return activeFolder.filter( email => email.isFlagged )
            else if( this.currentFilter === 'unansweredEmails' ) return this.unansweredEmails.filter( email => !email.isSent )
        },

    },

    methods: {
        selectEmail( email ) {
            // Removes popover for rehearsal
            if(this.$store.state.assessmentTypeKey == 2){
                let firstEmail = this.filteredEmails.indexOf(email)
                if( !firstEmail ) $('[data-toggle="popover"]').popover('hide')
            }
            this.selectedEmail = email
            this.$emit('selectEmail', email )
        },

        isActive( email ) {
            return ( this.selectedEmail && this.selectedEmail == email ) ? true : false
        },

        resize() {
          this.$el.style.height = `${window.innerHeight - 50}px`
          if(this.$refs.mailWrapper) this.$refs.mailWrapper.style.height = `${(this.$el.offsetHeight - this.$refs.heading.offsetHeight - 5)}px`
        },
        
        logEmailsAsDelivered(undeliveredEmails){
            $.ajax({
                url: "/capsiminbox/webapp/set-multi-log",
                method: 'post',
                dataType: "json",
                data: {emailKeys: JSON.stringify(undeliveredEmails)}
            })
            .done(res => {
                if (typeof callback == "function") callback();
            })
            .fail(err => console.log(err));
        },
    },

    watch: {
      activeFolder() {
        this.currentFilter = 'all'
      }
    },

    mounted() {
        $(window).on('resize', () => this.resize() )
        EventBus.$on( 'showFolder', ( filter ) => this.activeFolder = filter )
        this.$nextTick( () => this.resize() )
    }

}
</script>
<style lang="scss">

.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(-200px);
}

.inbox {
    height: 100%;
    background-color: white;

    .emails-wrapper {
        overflow-y: auto;
        margin: auto -15px;
        padding: 0 15px;
        border-top: 1px solid #dadadc;
    }

    .inbox-toolbar {
        line-height: 60px;
        color: black;
        display: inline-block;

        .btn:focus {
            outline: none;
        }
    }
}
</style>
