<template>
    <div @click="handleClick(false)" :id="`popup-box-${idx}`" :class="['panel-primary panel-chat', { 'opened': isOpen }]" :style="rightPos">
        <div :class="['panel-heading', { flashit: hasNew }]">
            <span class="chat-minimize"> <span class="glyphicon glyphicon-comment mr-5"></span> {{ author }}</span>
            <span @click="$emit('close', author)" class="chat-close"><i class="glyphicon glyphicon-remove"></i></span>
            <span @click="isOpen = !isOpen" class="chat-close mr-10"><i :class="['glyphicon', isOpen ? 'glyphicon-minus' : 'glyphicon-chevron-up' ]"></i></span>
        </div>
        <div class="panel-body" :id="`chat-${idx}`" >
            <div v-for="message in messages" class="clearfix" v-if="displayMessage[message.questionKey]">
                <blockquote class="message m-15 p-10" v-html="message.descriptionTagKey"></blockquote>
                <blockquote class="me message m-15 p-10" v-if="message.answer">
                  <template v-for="answer in message.answer"> {{answer.nameTagKey}}<br/> </template>
                  <!-- {{ message.answer.nameTagKey }} -->
                </blockquote>
            </div>
        </div>
        <div v-if="needsAnswer" class="panel-footer">
          <!-- Multi answer question -->
          <template v-if="needsAnswer.FK_questionTypeKey == 2">
            <template v-for="answer in needsAnswer.answers">
              <div class="radio">
                <label :for="`f-option-${answer.answerKey}`">
                  <input name="answer" :id="`f-option-${answer.answerKey}`" type="checkbox" :value="answer.answerKey" v-model="picked">
                  {{ answer.nameTagKey }}
                </label>
              </div>
            </template>
          </template>
          <!-- Single answer question -->
          <template v-else>
            <radioButton v-for="answer in needsAnswer.answers"
              :inputValue="answer.answerKey"
              :radioId="`f-option-${answer.answerKey}`"
              v-model.number="picked" :label="answer.nameTagKey" :name="`answer`">
            </radioButton>
          </template>
          <button @click="submitAnswer" class="btn btn-default mat btn-block">Reply</button>
        </div>
    </div>
</template>
<script>
import delay from 'lodash.delay'
export default {

    name: "chat-box",

    props: {
        idx: {
            type: Number,
            required: true
        },

        messages: {
            type: Array,
            required: true
        },

        author: {
            type: String,
            required: true
        }
    },

    data: () => ({
        isOpen: true,
        hasNew: false,
        picked:[]
    }),

    components: {
      radioButton: require('../inputs/radio.vue')
    },

    computed: {

        needsAnswer() {
            return this.messages.find( message => message.answers.length > 0 && message.answer === undefined )
        },

        displayMessage(){
            let isPreviousMessageAnswered = true
            let retVal = {}
            this.messages.forEach(message => {
                retVal[message.questionKey] = isPreviousMessageAnswered
                isPreviousMessageAnswered =  (message.hasOwnProperty('answer') || message.answers.length == 0)
            })
             this.scroll(this.idx)
            return retVal
        },

        rightPos() {
            return `right: ${((this.$store.getters.constants['chat-width'] + 10 ) * (this.idx + 1)) - 260}px`
        }
    },

    watch: {
        messages(val, oldVal) {
            if( val.length > oldVal.length ) {
                this.hasNew = true
                this.isOpen = true
            }    
        }
    },

    methods: {

        handleClick(hasNew) {
            this.hasNew = hasNew
            this.$store.commit('chat/SET_IS_READ', this.messages.map( m => m.questionKey ))
        },

        //scroll to bottom of chat box when new messages are delivered
        scroll(i){              
            delay(function(){
                    $(`#chat-${i}`).scrollTop($(`#chat-${i}`)[0].scrollHeight)
                }, 500
            )
        },

        submitAnswer() {
            const tempQuestionKey = this.needsAnswer.questionKey
            this.$store.dispatch('chat/ANSWER_MESSAGE', {
                questionkey: this.needsAnswer.questionKey,
                answerkey: this.picked,
                isMessage: true
            })
             .then(()=> {
                    const question = this.$store.state.messages.find( question => question.questionKey === tempQuestionKey )
                    let answers = (typeof this.picked == 'object')? this.picked : [this.picked]
                    let questionAnswers = question.answers.filter( answer => answers.includes(answer.answerKey) )
                    let timeImpact = 0
                    questionAnswers.forEach((answer) => {
                        timeImpact+= answer.timeImpact
                    });
                    if(timeImpact != 0) this.$store.commit('time/UPDATE_DEADLINE', timeImpact)
                    this.scroll(this.idx)
                })
        },
    }
}
</script>
<style lang="scss" scoped>

.panel-chat {

    position: fixed;
    bottom: 0;
    right: 0;
    max-width: 250px;
    min-width: 250px;
    box-shadow: none;
    -webkit-box-shadow: none;
    margin-bottom: 0px;
    z-index: 51;

    &.opened {
        .panel-body {
            height: 330px;
        }
        .panel-footer {
            display: block;
        }
    }

    .panel-heading {
        background-color: #1b222c;
        border-color: #1b222c;

        &.flashit{
        	-webkit-animation: flash linear 1.2s infinite;
        	animation: flash linear 1.2s infinite;
        }

        @-webkit-keyframes flash {
        	0% { background-color: #1b222c; }
        	50% { background-color: #23bd40; }
        	100% { background-color: #1b222c; }
        }

        @keyframes flash {
        	0% { background-color: #1b222c; }
        	50% { background-color: #23bd40; }
        	100% { background-color: #1b222c; }
        }
    }

    .panel-body {
        display: block;
        padding: 0;
        margin: 0;
        max-height: 330px;
        height: 0;
        border-left: 1px solid #b2b2b2;
        border-right: 1px solid #b2b2b2;
        background: #EDEFF4;
        overflow: auto;
        -webkit-transition: height 0.6s;
        -moz-transition: height 0.6s;
        -ms-transition: height 0.6s;
        -o-transition: height 0.6s;
        transition: height 0.6s;

        .message {
            background-color: #fed986;
            border-radius: 4px;
            width: 60%;
            position: relative; 
            font-size: 1.2rem;
            border-left: none;
            color: #333;
            font-size: 12px;

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
                border-right-color: #fed986;
                border-width: 10px;
                margin-top: -10px;
            }
        }
    }

    .panel-footer {
        border-left: 1px solid #b2b2b2;
        border-right: 1px solid #b2b2b2;
        display: none;
        color: #333;
        -webkit-transition: display 0.6s;
        -moz-transition: display 0.6s;
        -ms-transition: display 0.6s;
        -o-transition: display 0.6s;
        transition: display 0.6s;

        .radio {
            font-size: 1.2rem;
        }
    }

    .chat-minimize {
        cursor: default;
        width: 290px;
        color: #FFF;
        font-weight: bold;
    }

    .chat-close {
        cursor: pointer;
        max-width: 11px;
        width: 11px;
        color: #FFF;
        float: right;
    }
}



</style>
