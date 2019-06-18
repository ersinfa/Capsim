<template>
    <div id="chat-conversation" v-if="isActive" class="right-chat-bar" :class="{ 'right-chat-toggle': isActive }" :style="{width: $store.getters.constants['chat-width']+'px'}">
        <div ref="header" class="conversation-header">
            <span data-toggle="tooltip" data-placement="left" title="Close conversation" @click="toggleConversation" class="glyphicon glyphicon-chevron-right"></span>
            <span><authorInitial v-if="currentAuthor" :author-name="currentAuthor"></authorInitial></span>
            <span class="chat-info">
                {{ currentAuthor }}
                <br>
                <small>{{ currentConversation[currentConversation.length - 1].timestamp.format('h:mma') }}</small>
            </span>
        </div>

        <ul ref="messages" class="conversation-container">
            <template v-for="message in sortedMessages">
                <li class="message m-15 p-10" v-html="message.descriptionTagKey"></li>
                <li class="me message m-15 p-10" v-if="message.answer">{{ message.answer.nameTagKey }}</li>
                <div class="clearfix"></div>
            </template>
        </ul>

        <div ref="response" v-if="needsAnswer" class="response-area p-10">
            <h5>Response Options</h5>
            <div class="well">
                <radioButton v-for="answer in needsAnswer.answers"
                :inputValue="answer.answerKey"
                :radioId="`f-option-${answer.answerKey}`"
                v-model.number="picked" :label="answer.nameTagKey" :name="`answer`">
            </radioButton>
        </div>
        <button @click="submitAnswer" class="btn btn-default mat pull-right">Reply</button>
    </div>
</div>
</template>
<script>
export default {

    name: "chat-conversation",

    components: {
        authorInitial: require('../AuthorInitial.vue'),
        radioButton: require('../inputs/radio.vue'),
    },

    data: () => ({
        picked: 0,
        needsAnswer: {}
    }),

    props: {
        isActive: {
            type: Boolean,
            default: false,
            required: true
        },

        currentAuthor: {
            type: String,
            required: true
        },

        currentConversation: {
            type: Array,
            required: true
        }
    },

    computed: {

        marginBottom() {
            return (this.detectIE()) ? 50 : 0
        },

        answered() {
            return this.currentConversation.find( message => message.answers.length > 0 && message.answer !== undefined )
        },

        sortedMessages() {
            return this.currentConversation.sort( (a,b) => (a.timer > b.timer) ? a : (a.timer < b.timer) ? b : 0 )
        }
    },

    watch: {
        currentConversation: {
            handler: function() {
                this.needsAnswer = this.currentConversation.find( message => message.answers.length > 0 && message.answer === undefined )
            }, deep: true
        },

        isActive() {
            this.$nextTick( () => this.resize() )
        }
    },

    methods: {

        resize() {
            if( this.isActive ) {
                let elHeight = ( this.$el.offsetHeight ) ? this.$el.offsetHeight : 0
                let headHeight = ( this.$refs.header ) ? this.$refs.header.offsetHeight : 0
                let resHeight = ( this.$refs.response ) ? this.$refs.response.offsetHeight : 0
                this.$refs.messages.style.height = `${( elHeight - ( headHeight + resHeight ) - this.marginBottom )}px`
            }
        },

        submitAnswer() {
            this.$store.dispatch('chat/ANSWER_MESSAGE', {
                questionkey: this.needsAnswer.questionKey,
                answerkey: this.picked
            })
            .then( () => setTimeout( () => this.resize(), 500 ) )
        },

        toggleConversation() {
            this.$emit('update:isActive', false)
        },

        detectIE() {
            let ua = window.navigator.userAgent;

            let msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            let trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            let edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        }

    },

    updated() {
        this.resize()
    },

    created() {
        window.addEventListener('resize', () => this.resize() )
    }

}
</script>
<style lang="scss" scoped>

.right-chat-bar {
    // width: 280px;
    background-color: #1b222c;
    position: fixed;
    z-index: 50;
    height: 100%;
    right: 0px;
    visibility: hidden;
    -webkit-transform: translate(320px, 0);
    -moz-transform: translate(320px, 0);
    -o-transform: translate(320px, 0);
    -ms-transform: translate(320px, 0);
    transform: translate(320px, 0);
    -webkit-transition: all 350ms cubic-bezier(0.19, 1, 0.22, 1);
    transition: all 350ms cubic-bezier(0.19, 1, 0.22, 1);
    &.right-chat-toggle {
        -webkit-transform: translate(0, 0);
        -moz-transform: translate(0, 0);
        -o-transform: translate(0, 0);
        -ms-transform: translate(0, 0);
        transform: translate(0, 0);
        visibility: visible;
    }

    .response-area {
        position: fixed;
        bottom: 0;
        background-color: #b5b9bf;
        min-height: 200px;
        width: 280px;
        button {
            background-color: #65757d;
            color: white;
        }
    }

    .conversation-header {
        background-color: #171d25;
        padding: 10px;
        .glyphicon {
            margin-right: 5px;
            color: white;
            cursor: pointer;
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

    .conversation-container {
        overflow-y: auto;
        padding: 15px 0px;
        -ms-overflow-style: scrollbar;
        .message {
            background-color: #fdfad9;
            // background-color: #fed986;
            border-radius: 4px;
            width: 60%;
            position: relative;
            list-style-type: none;

            &.me {
                float: right;
                background-color: #90d1bc;
                // background-color: #17af36;
                color: #000;
                &:after {
                    right: -6px;
                    border-right-color: #90d1bc;
                    // border-right-color: #17af36;
                }
            }
            &:not(.me) {
                &:after{
                    left: -6px;
                }
            }
            &:after {
                right: 100%;
                top: 10px;
                border: solid transparent;
                content: "";
                height: 0;
                width: 0;
                -ms-transform: rotate(-90deg);
                -webkit-transform: rotate(-90deg);
                transform: rotate(-90deg);
                position: absolute;
                z-index: 50;
                pointer-events: none;
                border-color: rgba(238, 238, 238, 0);
                border-right-color: #fdfad9;
                // border-right-color: #fed986;
                border-width: 10px;
                margin-top: -10px;
            }
        }
    }
}

</style>
