<template>
  <div @click="emitSelected" class="media" :class="{ read: email.isRead }">
    <div class="media-left">
      <a href="#">
        <authorInitial :class="media-object" :author-name="email.authorNameTagKey"></authorInitial>
      </a>
    </div>
    <div class="media-body">
      <div class="media-heading"><span class="name">{{ email.authorNameTagKey }}</span> <span class="pull-right mr-10 timestamp">{{ email.timestamp }}</span></div>
      <div class="text-rg mb-10">{{ email.authorTitle }}</div>
      <div class="mb-0 text-rg">{{ email.subjectTagKey }}</div>
      <!-- <span class="message-body">{{ shortDescription }}</span> -->
    </div>
    <div class="media-right pl-0">
      <span v-if="email.isSent" :class="email.answer.answerType" class="glyphicon glyphicon-share-alt media-right pr-5"></span>
      <span @click="toggleFlagged" class="glyphicon glyphicon-flag media-right pl-0" :class="{ flagged: this.email.isFlagged }"></span>
    </div>

  </div>
</template>

<script>

module.exports = {

  name: "QuestionItem",

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
      this.$store.dispatch('email/READ_EMAIL', {
        objectKey: this.email.questionKey,
        isRead: this.email.isRead
      })
    },

    toggleFlagged() {
      this.$store.dispatch('email/TOGGLE_FLAG', {
          objectKey: this.email.questionKey,
          activityValue: Number(!this.email.isFlagged)
      })
    },

  }

}

</script>
<style lang="scss" scoped>

</style>
