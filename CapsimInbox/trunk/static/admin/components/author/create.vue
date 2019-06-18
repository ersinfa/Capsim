<template>
  <div id="show-question">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Create new author
        </h2>
      </div>
      <div class="panel-body">
        <form>
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" class="form-control" type="text" v-model="author.nameTagKey">
          </div>
          <div class="form-group">
            <label for="title">Title</label>
            <input id="title" class="form-control" type="text" v-model="author.title">
          </div>
          <button class="btn mat btn-success" @click.prevent="createAuthor">Create</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>

export default {

  name: "create-author",

  data() {
    return {
      author: {
        nameTagKey: '',
        FK_versionKey: this.$route.query.versionKey,
        title: ''
      }
    }
  },

  methods: {

    createAuthor() {

      this.$store.dispatch('author/CREATE_RESOURCE', { ...this.author })
      .then( () => this.$router.push({ name: 'edit-version', params: { resourceKey: this.author.FK_versionKey }, hash: '#authors' }) )
    }
  }

}
</script>
