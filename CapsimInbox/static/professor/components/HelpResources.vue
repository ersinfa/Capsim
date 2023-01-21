<template>
    <div id="help-resources">
        <h1>Help & Support</h1>
        <div class="panel panel-default">
            <div class="panel-body">
                <h2 class="mb-20 mt-10">Resources</h2>
                <!-- <template v-for="link in links">
                    <a class="btn btn-primary btn-lg mb-20" target="_blank" :href="`/capsiminbox/resources/${link.href}`">{{ link.name }}</a>
                    <div class="clearfix"></div>
                </template> -->

                <template v-for="file in professorResources">
                  <a v-if="file.FK_fileTypeKey == 2" target="_blank" class="btn btn-primary btn-lg mb-20" :href="file.fileName">{{file.displayName}}</a>
                  <a v-else target="_blank" class="btn btn-primary btn-lg mb-20" :href="getFilePath(file.fileName)">{{file.displayName}}</a>
                  <div class="clearfix"></div>
                </template>

                <br>
                <br>
                <h4>Need additional help?</h4>
                Capsim's support team is ready to help you! When contacting Capsim with your question or problem please provide your first and last name and your Industry ID. You can find your Industry ID at the top of this page.
                <br>
                <br>
                <h4>Email: support@capsim.com</h4>
                <br>
                <br>
                <h4>If you require immediate assistance, please call:</h4>
                <h4>USA and Canada: 1.877.477.8787</h4>
                <h4>Others: 1.312.477.7200</h4>
            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "help-resources",

    data: () => ({
        // links: [
        //     { href: 'Admin_Guide.pdf', name: 'Administration Guide' },
        //     { href: 'CapsimInbox_Administrator-Intro_v1.pptx', name: 'Introduction PowerPoint' },
        //     { href: 'CapsimInbox_Administrator-Debrief_v1.pptx', name: 'Debrief PowerPoint' },
        //     { href: 'Scoring_Guide.pdf', name: 'Stimuli Scoring' }
        // ]
    }),

    computed: {
      professorResources() {
        return this.$store.state.professorResources
      }
    },
    methods:{
      getFilePath(fileName) {
        let fileTypeFolder = ''

        if( /\.png|\.jpeg|\.jpg/.test( fileName ) ) fileTypeFolder = 'images'
        else if( /\.pdf/.test( fileName ) ) fileTypeFolder = 'pdfs'
        else fileTypeFolder = 'documents'
        return `${this.$store.state.assetsPath}/capsiminbox/${fileTypeFolder}/${fileName}`

      }
    },

    beforeRouteEnter (to, from, next) {
        next( instance => {
            instance.$store.dispatch('GET_PROFESSOR_RESOURCES')
        })
    },
}
</script>
