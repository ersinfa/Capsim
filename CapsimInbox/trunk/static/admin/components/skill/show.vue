<template>
    <div id="skill-index">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>
                    <back-button></back-button>
                    {{ skill.name }}
                </h2>
            </div>
            <div class="panel-body">

                <h4>Description: </h4>
                <p>{{ skill.description }}</p>

                <hr>

                <h4>Developmental Tactic</h4>
                <p v-html="skill.developmentalTactic"></p>

            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "show-skill",

    props: {
        resourceKey: {
            required: true,
        }
    },

    data() {
        return {
            skill: {
                developmentalTactic: '',
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
        this.$store.dispatch('skill/GET_RESOURCE', this.resourceKey)
        .then( skill => this.skill = skill )
        .catch( err => this.showError() )
    }
}
</script>
