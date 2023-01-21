<template>
    <div id="competency-edit">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>
                    <back-button></back-button>
                    {{ competency.name }}
                </h2>
            </div>
            <div class="panel-body">
                <form>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input id="name" class="form-control" type="text" v-model="competency.name">
                    </div>

                    <div class="form-group">
						<label>Map Competency to Time Management Index&nbsp</label>
						<switcher :selected="isTimeManagementIndex" v-model="isTimeManagementIndex"></switcher>
					</div>

                    <div class="form-group">
                        <label for="developmental-tactic">Developmental Tactic</label>
                        <wysiwyg ref="wys" id="developmental-tactic" v-model="competency.developmentalTactic"></wysiwyg>
                    </div>

                    <button @click.prevent="update" class="btn mat btn-primary">Update</button>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "edit-competency",

    props: {
        resourceKey: {
            required: true,
        }
    },

    data() {
        return {
            competency: {
                name: '',
                developmentalTactic: '',
            },
            isTimeManagementIndex: false
        }
    },

    methods: {

        update() {
            const payload = {
                name: this.competency.name,
                developmentalTactic: this.competency.developmentalTactic,
                isTimeManagementIndex: this.isTimeManagementIndex
            }

            this.$store.dispatch('competency/SAVE_RESOURCE', { payload, resourceKey: this.resourceKey })
        }
    },

    created() {
        this.$store.dispatch('competency/GET_RESOURCE', this.resourceKey)
        .then( competency => this.competency = competency )
    }
}
</script>
