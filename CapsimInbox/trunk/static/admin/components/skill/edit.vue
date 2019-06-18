<template>
    <div id="skill-edit">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>
                    <back-button></back-button>
                    {{ skill.name }}
                </h2>
            </div>
            <div class="panel-body">
                <form>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input id="name" class="form-control" type="text" v-model="skill.name">
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea rows="4" id="description" class="form-control" type="text" v-model="skill.description">
                        </textarea>
                    </div>

                    <div class="form-group">
                        <label for="developmental-tactic">Developmental Tactic</label>
                        <wysiwyg ref="wys" id="developmental-tactic" v-model="skill.developmentalTactic"></wysiwyg>
                    </div>

                    <button @click.prevent="update" class="btn mat btn-primary">Update</button>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "edit-skill",

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

        update() {

            const payload = {
                name: this.skill.name,
                description: this.skill.description,
                developmentalTactic: this.skill.developmentalTactic
            }

            this.$store.dispatch('skill/SAVE_RESOURCE', { payload, resourceKey: this.resourceKey })
        }
    },

    created() {
        this.$store.dispatch('skill/GET_RESOURCE', this.resourceKey)
        .then( skill => this.skill = skill )
        .catch( err => this.showError() )
    }
}
</script>
