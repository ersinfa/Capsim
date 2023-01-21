<template>
    <!-- class="chat" :style="{width: $store.getters.constants['chat-width']+'px'}" -->
    <!-- Users list -->
    <div class='chat'>
        <div class="users-list-container chat">
            <ul class="users-list">
                <li @click="openChat(name)" v-for="(chat, name, idx) in chats">
                    <div>
                        <authorInitial :author-name="name"></authorInitial>
                        <span class="chat-info">
                            {{ name }}
                            <br>
                            <small>{{ chat.timestamp.format('h:mma') }}</small>
                        </span>
                    </div>
                </li>
            </ul>
        </div>
        <chat-box @close="closeChat" :idx="idx" :messages="chat.messages" :author="name" v-for="(chat, name, idx) in chatBoxes"></chat-box>
    </div>
</template>
<script>
import { omitBy } from 'lodash'

export default {

    data() {
        return {
            conversationOpen: false,
            initial: true,
            conversations: {}
        }
    },

    components: {
        authorInitial: require('../AuthorInitial.vue'),
        chatBox: require('./ChatBox.vue')
    },

    computed: {

        chats() {
            let authors = this.deliveredMessages.reduce( (retVal, message) => {

                let nameTagKey = message.authorNameTagKey
                retVal[nameTagKey] = retVal[nameTagKey] || { timestamp: '', messages: [] }
                let authorMessages = retVal[nameTagKey].messages

                if( authorMessages.length && message.timestamp.isAfter(authorMessages[authorMessages.length - 1]) ) {
                    retVal[nameTagKey].messages.push(message)
                    retVal[nameTagKey].timestamp = message.timestamp
                }
                else {
                    retVal[nameTagKey].timestamp = message.timestamp
                    retVal[nameTagKey].messages.push(message)
                }

                return retVal

            }, {})
    
            return authors
        },

        chatBoxes() {

          const chatsOpened = Object.keys(this.chats).reduce( (retVal, name) => {
            if( this.conversations[name] ) retVal[name] = this.chats[name]
            return retVal
          }, {})

          return chatsOpened
        },

        elapsed() {
            return this.$store.getters['time/elapsed']
        },

        messagesFromThread(){
            return this.$store.getters['chat/messagesFromThread']
        },

        messages() {
            return this.$store.getters['chat/activeMessages']
        },

        deliveredMessages() {
            return this.activeMessages.sort( (a, b) => (a.timer > b.timer) ? 1 : -1 )
        },

        activeMessages() {
            let messages
            if( this.$store.getters['email/emailsCompleted'] ) {
                 messages = this.messages
                            .map( message => (message.timestamp) ? message : Object.assign(message, {timestamp: this.$moment()} ) )
            } else {
                messages = this.messages
                            .filter( message => ( !this.initial && (message.timer <= this.elapsed) ) )
                            .map( message => (message.timestamp) ? message : Object.assign(message, {timestamp: this.$moment()} ) )
            }
            return messages
        }
    },

    watch: {
        deliveredMessages(val, oldVal) {
            if( val.length > oldVal.length ) {
                val.forEach(chat=>{
                    this.openChat(val[val.length-1].authorNameTagKey)
                })
            }    
        }
    },

    methods: {

        setAuthors() {
            this.$store.getters['chat/messages'].forEach( m => this.$set(this.conversations, m.authorNameTagKey, true) )
        },

        // resize() {
        //     this.$el.style.height = `${window.innerHeight - 525}px`
        // },

        closeChat( name ) {
            this.conversations[name] = false
        },

        openChat( name ) {
            this.conversations[name] = true
        },

        submitAnswer() {
            this.$store.dispatch('ANSWER_QUESTION', {
                questionType: 'messages',
                questionkey: this.needsAnswer.questionKey,
                answerkey: this.picked
            })
        }
    },

    created() {
        this.setAuthors()
    },

    mounted() {
        //window.addEventListener('resize', () => this.resize() )
        setTimeout( () => this.initial = false, 2000 )
    },

    // updated() {
    //     this.resize();
    // },

}
</script>
<style lang="scss" scoped>
.chat {
    // width: 240px;
    // height: 100%;
    background: #1d2430;
    z-index: 1000;
    border-left: 1px solid rgba(0,0,0,.2);
    .users-list-container {
        overflow-y: auto;
        z-index: 1001;
        ul {
            margin: 0;
            padding: 0;
            list-style: none;
            li {
                padding: 10px 20px;
                &:hover {
                    background-color: #171d25;
                }
                span {
                    display: inline-block;
                    vertical-align: middle;
                    &.chat-info {
                        color: #999;
                        padding-left: 5px;
                        small {
                            color: #ccc;
                        }
                    }
                }
            }
        }
    }

}
</style>
