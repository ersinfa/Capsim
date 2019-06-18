<template>
    <div id="version-role">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>
                  <back-button></back-button>
                  Company Information
                </h2>
            </div>
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-12">
                        <b>Role:</b>
                        <br>
                        <div v-html="company.role"></div>
                    </div>
                </div>
                <br>
                <br>
                <div class="row">
                    <div class="col-md-12">
                        <b>Scenario: </b>
                        <div v-html="company.scenario">
                        </div>
                    </div>
                </div>
                <br>
                <br>
                <object v-if="company.pdfFile" width="100%" height="1200px" :data="`${$store.state.assetsPath}/capsiminbox/pdfs/${company.pdfFile}`"></object>
            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "version-role",

    data() {
        return {
            company: {
                role: '',
                scenario: '',
                pdfFile: ''
            }
        }
    },

    props: {
        resourceKey: {
            required: true
        }
    },

    created() {
        this.getRole()
    },

    methods: {

        getRole() {
            $.ajax({
                url: `/capsiminbox/admin/api/roles/${this.resourceKey}`,
                method: 'get',
                dataType: 'json'
            })
            .done( role => this.company = role )
            .fail(() => alert('An error occurred while fetching version role'))
        }
    }

}
</script>
