<template>
    <div id="learningGoal-index">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>
                    <back-button></back-button>
                    {{ learningGoal.name }}
                </h2>
            </div>
            <div class="panel-body">

                <h4>Description: </h4>
                <p>{{ learningGoal.description }}</p>

                <hr>

            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "show-learningGoal",

    props: {
        resourceKey: {
            required: true,
        }
    },

    data() {
        return {
            learningGoal: {
                name: '',
                description: ''
            }
        }
    },

    methods: {

        showError() {
            alert('There was an error while processing your request')
        }
    },

    created() {
        this.$store.dispatch('learningGoal/GET_RESOURCE', this.resourceKey)
        .then( learningGoal => this.learningGoal = learningGoal )
        .catch( err => this.showError() )
    }
}
</script>
