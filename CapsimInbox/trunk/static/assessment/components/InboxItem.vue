<template>
  <div @click="emitSelected" class="media" :class="{ read: email.isRead }">
    <div class="media-left">
      <a href="#">
        <authorInitial :class="media-object" :author-name="email.authorNameTagKey"></authorInitial>
      </a>
    </div>
    <div class="media-body">
      <div class="media-heading">
        <span class="name">{{ email.authorNameTagKey }}</span> 
        <span class="pull-right mr-10 timestamp">{{ email.timestamp }}</span>
        <span v-if="email.files.length > 0" class="glyphicon glyphicon-paperclip pull-right mr-10"></span> 
      </div>
      <div class="text-rg mb-10">{{ email.authorTitle }}</div>
      <div class="mb-0 text-rg">{{ email.subjectTagKey }}</div>
    </div>
    <div class="media-right pl-0">
      <span v-if="email.isSent && !email.isWrittenResponse" :class="email.answer.answerType" class="glyphicon glyphicon-share-alt media-right pr-5"></span>
      <span @click="toggleFlagged" class="glyphicon glyphicon-flag media-right pl-0" :class="{ flagged: this.email.isFlagged }"></span>
    </div>

  </div>
</template>

<script>

module.exports = {

  name: "inboxItem",

  components: {
    authorInitial: require('./AuthorInitial.vue')
  },

  props: {
    email: {
      type: Object,
      required: true
    }
  },

  methods: {
    emitSelected() {
      this.$emit( 'selected', this.email )
      if(this.$store.state.assessmentTypeKey ==1 ){
        this.$store.dispatch('email/READ_EMAIL', {
          objectKey: this.email.questionKey,
          isRead: this.email.isRead
        })
      }
      
    },

    toggleFlagged() {
        this.$store.dispatch('email/TOGGLE_FLAG', {
          objectKey: this.email.questionKey,
          activityValue: Number(!this.email.isFlagged)
        })
    },

  },

  computed: {
    flagStatus(){
      return this.email.isFlagged
    }
  }

}

</script>

<style lang="scss" scoped>

.media {
  height: auto;
  padding: 12px;
  margin: auto -15px;
  border-bottom: 1px solid #dadadc;
  overflow: visible;

  .media-heading {
      margin-bottom: 0;
  }

  .media-left {
      vertical-align: middle;
  }

  .text-rg {
      font-size: 14px;
      color: #000;
  }

  .name {
      font-size: 18px;
      font-weight: bold;
  }

  .timestamp, .media-right {
      font-size: 14px;
      color: #000;
  }

  &:not(.read) {
    border-left: 4px inset #33CC99;
  }
  &.read {
    padding-left: 16px;
  }

  &.selected {
    background-color: #fafafa;
    .message-body:after {
      background: linear-gradient(to right,  rgba(255,255,255,0) 85%,rgba(250,250,250,1) 98%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ffffff', endColorstr='#fafafa',GradientType=1 ); /* IE6-9 */
    }
  }

  &:hover {
    background-color: #fafafa;
    .message-body:after {
      background: linear-gradient(to right,  rgba(255,255,255,0) 85%,rgba(250,250,250,1) 98%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ffffff', endColorstr='#fafafa',GradientType=1 ); /* IE6-9 */
    }
  }

  .message-body {
    margin: 0;
    font-size: 12px;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    max-height: 14px;
    line-height: 1.3em;
    position: relative;
    word-break: break-all;
    &:after {
      background: linear-gradient(to right,  rgba(255,255,255,0) 85%,rgba(255,255,255,1) 98%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ffffff', endColorstr='#ffffff',GradientType=1 ); /* IE6-9 */
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      height: 1.25em;
      content: '';
    }
  }

  .media-right {
    >span {
      cursor: pointer;
      &.glyphicon-share-alt {
        &.Reply {
            cursor: auto;
            transform: scaleX(-1);
            padding-left: 5px;
        }
        &.Forward {
            cursor: auto;
            transform: scaleY(1);
            padding-left: 5px;
        }
      }
    }

  }

  .glyphicon {
    &.flagged {
      color: #ff4d4d;
      text-shadow: 0 0 1px rgba(0, 0, 0, 0.52);
    }
  }
}

</style>
