<template>
    <div id="folder-list">
        <table v-if="folders.length" class="table">
            <thead>
                <th>Folder Name</th>
                <th :colspan="[ !versionActive ? '3' : '1' ]">Actions</th>
            </thead>
            <tbody>
                <tr v-for="folder in folders">
                    <td>{{ folder.name }}</td>
                    <td>
                        <router-link class="btn mat btn-primary" :to="{ name: 'show-folder', params: { resourceKey: folder.fileFolderKey} }">
                            Show
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <router-link class="btn mat btn-success" :to="{ name: 'edit-folder', params: { resourceKey: folder.fileFolderKey} }">
                            Edit
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <button class="btn mat btn-danger" @click="deleteFolder(folder.fileFolderKey)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else>
            No Drive Folders in this version
        </div>
    </div>
</template>
<script>
export default {

    name: "folder-list",

    props: {

        folders: {
            type: Array,
            default: function() {
                return []
            }
        },

        versionActive: {
            type: Number
        }
    },

    methods: {
        deleteFolder(folderKey) {
            this.$store.dispatch('folder/DELETE_RESOURCE', folderKey)
            .then( () => this.folders = this.folders.filter( el => el.fileFolderKey != folderKey ) )
            .catch( err => alert('There was an error while processing your request') )
        }
    }
}
</script>
