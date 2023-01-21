<template>
    <aside class="chat" :class="{ 'right-aside-toggle': isOpen }" :style="{width: $store.getters.constants['chat-width']+'px'}">

        <!-- Single chat -->
        <conversation :is-active.sync="conversationOpen" :current-conversation="currentConversation" :current-author="currentAuthor"></conversation>

        <!-- Users list -->
        <div class="users-list-container">
            <ul class="users-list">

                <li @click="toggleConversation(authorName)" v-for="(timestamp, authorName) in myAuthors">
                    <div>
                        <authorInitial :author-name="authorName"></authorInitial>
                        <span class="chat-info">
                            {{ authorName }}
                            <br>
                            <small>{{ timestamp.format('h:mma') }}</small>
                        </span>
                    </div>
                </li>

            </ul>
        </div>

    </aside>
</template>
<script>

export default {

    data() {
        return {
            isOpen: false,
            conversationOpen: false,
            currentAuthor: '',
            initial: true,
            authors: []
        }
    },

    components: {
        conversation: require('./conversation.vue'),
        authorInitial: require('../AuthorInitial.vue')
    },

    computed: {

        elapsed() {

            return this.$store.getters['time/elapsed']
        },

        messages() {

            return this.$store.getters['chat/activeMessages']
        },

        currentConversation() {

            return ( this.currentAuthor ) ? this.deliveredMessages.filter( message => this.isAuthorMessage(message) ) : []
        },

        deliveredMessages() {

            return this.activeMessages.sort( (a, b) => (a.timer > b.timer) ? 1 : -1 )
        },

        activeMessages() {
            let messages
            if( this.$store.getters['email/emailsCompleted'] ) {
                 messages = this.messages.map( message => (message.timestamp) ? message : Object.assign(message, {timestamp: this.$moment()} ) )
            } else {
                messages = this.messages.filter( message => ( !this.initial && (message.timer <= this.elapsed) ) )
                            .map( message => (message.timestamp) ? message : Object.assign(message, {timestamp: this.$moment()} ) )
            }
            return messages
        },

        myAuthors() {
            let authors = this.deliveredMessages.reduce( (retVal, message) => {

                let authorRef = retVal[message.authorNameTagKey]

                if( retVal[message.authorNameTagKey] && message.timestamp.isAfter(retVal[message.authorNameTagKey]) ) retVal[message.authorNameTagKey] = message.timestamp
                else retVal[message.authorNameTagKey] = message.timestamp

                return retVal
            }, {})
            return authors
        }
    },

    mounted() {
        window.addEventListener('resize', () => this.resize() )
        EventBus.$on('toggleChat', () => this.toggleChat() )
        setTimeout( () => this.initial = false, 2000 )
    },

    updated() {
        this.resize();
    },

    methods: {

        isAuthorMessage(message) {
            return this.currentAuthor === message.authorNameTagKey
        },

        resize() {
            this.$el.style.height = `${window.innerHeight - 52}px`
            if( this.conversationOpen && this.$refs.response !== undefined ) this.$refs.messages.style.height = `${this.$el.clientHeight - ( this.$refs.header.clientHeight + this.$refs.response.clientHeight )}px`
        },

        toggleChat() {
            this.isOpen = !this.isOpen
        },

        toggleConversation( author = undefined ) {
            this.currentAuthor = author
            this.conversationOpen = !this.conversationOpen
            if( this.conversationOpen ) this.currentConversation.forEach( message => message.isRead = true )
        },

        submitAnswer() {
            this.$store.dispatch('ANSWER_QUESTION', {
                questionType: 'messages',
                questionkey: this.needsAnswer.questionKey,
                answerkey: this.picked
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.chat {
    // width: 240px;
    background: #1b222c;
    position: fixed;
    z-index: 1000;
    top: 52px;
    height: 100%;
    right: 0px;
    border-left: 1px solid rgba(0,0,0,.2);
    -webkit-transform: translate(280px, 0);
    -moz-transform: translate(280px, 0);
    -o-transform: translate(280px, 0);
    -ms-transform: translate(280px, 0);
    transform: translate(280px, 0);
    -webkit-transition: all 350ms cubic-bezier(0.19, 1, 0.22, 1);
    transition: all 350ms cubic-bezier(0.19, 1, 0.22, 1);
    &.right-aside-toggle {
        -webkit-transform: translate(0, 0);
        -moz-transform: translate(0, 0);
        -o-transform: translate(0, 0);
        -ms-transform: translate(0, 0);
        transform: translate(0, 0);
    }
    .users-list-container {
        overflow-y: auto;
        height: 100%;
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
