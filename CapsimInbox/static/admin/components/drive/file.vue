<template>
  <tr id="drive-file">
    <template v-if="showOnly">
      <td>
        {{ file.displayName }}
      </td>
      <td>
        {{ fileType }}
      </td>
      <td>
        {{ timer }}
      </td>
      <td>
        <a v-if="file.FK_fileTypeKey == 2" target="_blank" class="btn mat btn-info" :href="file.fileName">Link</a>
        <a v-else target="_blank" class="btn mat btn-info" :href="`${$store.state.assetsPath}/capsiminbox/images/${file.fileName}`">Link</a>
      </td>
      <td>
      </td>
      <td>
      </td>
    </template>
    <template v-else>
      <td>
        <input v-model="file.displayName" class="form-control">
      </td>
      <td>
        <select v-model="file.FK_fileTypeKey" class="form-control">
          <option :value="fileType.fileTypeKey" v-for="fileType in fileTypes"> {{ fileType.name }} </option>
        </select>
      </td>
      <td>
        <input v-model.number="timer" class="form-control">
      </td>
      <td>
        <a target="_blank" class="btn mat btn-info" :href="`${$store.state.assetsPath}/capsiminbox/${fileTypeFolder}/${file.fileName}`">Link</a>
      </td>
      <td>
        <button class="btn mat btn-success" @click="$emit('updateFile', file.fileKey)">Update</button>
      </td>
      <td>
        <button class="btn mat btn-danger" @click="$emit('deleteFile', file.fileKey)">Delete</button>
      </td>
    </template>
  </tr>

</template>
<script>
export default {

  name: "drive-file",

  props: {

    file: {
      type: Object,
      required: true
    },

    fileTypes: {
      type: Array,
      required: true
    },

    showOnly: {
      type: Boolean,
      required: true,
      default: true
    }
  },

  computed: {

    timer: {
      get() {
        return this.file.timer/60000
      },
      set(val) {
        this.file.timer = val*60000
      }
    },

    fileTypeFolder() {
      let fileTypeFolder = ''

      if( /\.png|\.jpeg|\.jpg/.test( this.file.fileName ) ) fileTypeFolder = 'images'
      else if( /\.pdf/.test( this.file.fileName ) ) fileTypeFolder = 'pdfs'
      else fileTypeFolder = 'documents'

      return fileTypeFolder
    },

    fileType() {
      return this.fileTypes.find( ft => ft.fileTypeKey == this.file.FK_fileTypeKey ).name
    }
  }
}
</script>
