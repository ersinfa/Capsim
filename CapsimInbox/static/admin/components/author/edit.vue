<template>
    <div id="edit-author">
        <div  v-if="author != null" class="panel panel-default">
            <div class="panel-heading">
                <h2>
                  <back-button></back-button>
                  Author: {{ author.nameTagKey }} - {{ author.title }}
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
                    <button class="btn mat btn-success" @click.prevent="update">Update</button>
                </form>
            </div>
        </div>
    </div>
</template>
<script>

export default {

    name: "edit-author",

    props: {
        resourceKey: {
            required: true
        }
    },

    data: () => ({
        author: null,
    }),

    mounted() {

        this.$store.dispatch('author/GET_RESOURCE', this.resourceKey)
        .then( author => this.$set(this, 'author', author ) )
    },

    methods: {

        update() {

            const payload = {
                nameTagKey: this.author.nameTagKey,
                title: this.author.title
            }

            this.$store.dispatch('author/SAVE_RESOURCE', { payload, resourceKey: this.resourceKey })
            .then( author => this.author = author )
        }
    }

}
</script>
