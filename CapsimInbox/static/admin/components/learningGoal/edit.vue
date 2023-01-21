<template>
    <div id="learningGoal-edit">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>
                    <back-button></back-button>
                    {{ learningGoal.name }}
                </h2>
            </div>
            <div class="panel-body">
                <form>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input id="name" class="form-control" type="text" v-model="learningGoal.name">
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea rows="4" id="description" class="form-control" type="text" v-model="learningGoal.description">
                        </textarea>
                    </div>

                    <button @click.prevent="update" class="btn mat btn-primary">Update</button>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "edit-learningGoal",

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

        update() {

            const payload = {
                name: this.learningGoal.name,
                description: this.learningGoal.description
            }

            this.$store.dispatch('learningGoal/SAVE_RESOURCE', { payload, resourceKey: this.resourceKey })
        }
    },

    created() {
        this.$store.dispatch('learningGoal/GET_RESOURCE', this.resourceKey)
        .then( learningGoal => this.learningGoal = learningGoal )
        .catch( err => this.showError() )
    }
}
</script>
