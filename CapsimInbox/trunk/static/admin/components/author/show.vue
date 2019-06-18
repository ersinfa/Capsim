<template>
    <div id="show-author">
        <div  v-if="author != null" class="panel panel-default">
            <div class="panel-heading">
                <h2>
                  <back-button></back-button>
                  Author: {{ author.nameTagKey }} - {{ author.title }}
                </h2>
            </div>
            <div class="panel-body">
                <p>
                    <b>Name: </b> {{ author.nameTagKey }}
                </p>
                <br>
                <p>
                    <b>Title: </b> {{ author.title }}
                </p>
            </div>
        </div>
    </div>
</template>
<script>

export default {

    name: "show-author",

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
        .catch( err => console.log(err) )
    }

}
</script>
