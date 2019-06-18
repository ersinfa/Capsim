<template>
    <div id="learningGoals-list">
        <table v-if="learningGoals.length" class="table">
            <thead>
                <th>LearningGoal Name</th>
                <th :colspan="[ !versionActive ? '3' : '1' ]">Actions</th>
            </thead>
            <tbody>
                <tr v-for="learningGoal in learningGoals">
                    <td>{{ learningGoal.name }}</td>
                    <td>
                        <router-link class="btn mat btn-primary" :to="{ name: 'show-learningGoal', params: { resourceKey: learningGoal.learningGoalKey} }">
                            Show
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <router-link class="btn mat btn-success" :to="{ name: 'edit-learningGoal', params: { resourceKey: learningGoal.learningGoalKey} }">
                            Edit
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <button class="btn mat btn-danger" @click="removeLearningGoal(learningGoal)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else>
            No LearningGoals in this version
        </div>
    </div>
</template>
<script>
export default {

    name: "learningGoals-list",

    props: {

        learningGoals: {
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

        //Check if there is any answer assign to this learningGoal
        removeLearningGoal(learningGoalToRemove) {

            const learningGoal = this.learningGoals.find( learningGoal => learningGoal.learningGoalKey == learningGoalToRemove.learningGoalKey )
            const hasAnswers = learningGoal.answers.length > 0

            if( hasAnswers ) {
                const alert = {
                    resource: 'LearningGoal',
                    message: 'This LearningGoal is assigned to an answer/answers. Please unassign the learningGoal first'
                }
                return this.$emit('alert', alert)
            }

            this.$store.dispatch('learningGoal/DELETE_RESOURCE', learningGoal.learningGoalKey)
            .then( () => this.$emit('update:learningGoals', this.learningGoals.filter( el => el.learningGoalKey != learningGoal.learningGoalKey )) )

        }
    }

}
</script>
