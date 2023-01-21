<template>
    <div id="authors-list">
        <table v-if="authors.length" class="table">
            <thead>
                <th>Name</th>
                <th>Title</th>
                <th colspan="2">Actions</th>
            </thead>
            <tbody>
                <tr v-for="author in authors">
                    <td>{{ author.nameTagKey }}</td>
                    <td>{{ author.title }}</td>
                    <td>
                        <router-link :to="{ name: 'show-author', params: { resourceKey: author.authorKey } }" class="btn mat btn-primary">
                            Show
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <router-link :to="{ name: 'edit-author', params: { resourceKey: author.authorKey } }" class="btn mat btn-success">
                            Edit
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <button class="btn mat btn-danger" @click="removeAuthor(author)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else>
            No Authors in this version
        </div>
    </div>
</template>

<script>
export default {

    name: "authors-list",

    props: {
        authors: {
            type: Array,
            default: function() {
                return []
            }
        },

        versionActive: {
            type: Number,
            required: true
        }
    },

    methods: {
        removeAuthor( author ) {
            const hasQuestions = author.questions.length
            if( hasQuestions ) {
                const alert = {
                    resource: 'Author',
                    message: 'This Author is assigned to a question/questions. Please unassign the author first'
                }
                return this.$emit('alert', alert)
            }

            this.$store.dispatch('author/DELETE_RESOURCE', author.authorKey)
            .then( () => this.$emit('removeAuthor', author.authorKey) )
            .catch( err => console.log(err) )
        },
    }
}
</script>
