<template>
    <div id="competencies-list">
        <table v-if="competencies.length" class="table">
            <thead>
                <th>Name</th>
                <th :colspan="[ !versionActive ? '3' : '1' ]">Actions</th>
            </thead>
            <tbody>
                <tr v-for="competency in competencies">
                    <td>{{ competency.name }}</td>
                    <td>
                        <router-link class="btn mat btn-primary" :to="{ name: 'show-competency', params: { resourceKey: competency.competencyKey} }">
                            Show
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <router-link class="btn mat btn-success" :to="{ name: 'edit-competency', params: { resourceKey: competency.competencyKey} }">
                            Edit
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <button class="btn mat btn-danger" @click="removeCompetency(competency)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else>
            No Competencies in this version
        </div>
    </div>
</template>
<script>
export default {

    name: "competencies-list",

    props: {

        competencies: {
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

        //Check if there is any answer assign to this competency
        removeCompetency(competencyToRemove) {

            const competency = this.competencies.find( competency => competency.competencyKey == competencyToRemove.competencyKey )
            const hasAnswers = competency.answers.length > 0

            if( hasAnswers ) {
                const alert = {
                    resource: 'Competency',
                    message: 'This competency is assigned to an answer/answers. Please unassign the competency first'
                }
                return this.$emit('alert', alert)
            }

            this.$store.dispatch('competency/DELETE_RESOURCE', competency.competencyKey)
            .then( () => this.$emit('update:competencies') )
        }
    }

}
</script>
