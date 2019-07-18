<template>
  <textarea :id="id" :value="value"></textarea>
</template>

<script>
import "tinymce/themes/modern/theme";
import "tinymce/plugins/code";
import "tinymce/plugins/textcolor";
import "tinymce/plugins/preview";
import "tinymce/plugins/lists";
import "tinymce/plugins/paste";
import "tinymce/plugins/image";

export default {
  name: "tiny-mce",

  props: {
    id: {
      type: String,
      default: "editor"
    },
    value: {
      type: String,
      required: true
    }
  },

  mounted() {
    setTimeout(() => this.init(), 200);
  },

<<<<<<< HEAD
    methods: {
        init() {
            tinymce.init({
                selector: `#${this.id}`,
				        skin: false,
                toolbar: 'undo redo | preview | code | paste | numlist | bulllist | forecolor backcolor | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                plugins: "code textcolor preview lists paste",
                init_instance_callback: (editor) => {
=======
  beforeDestroy() {
    while (tinymce.editors.length > 0) {
      tinymce.remove(tinymce.editors[0]);
    }
  },
>>>>>>> b915d7aea7c738ea4c637069413ed12f8f5eb403

  methods: {
    init() {
      tinymce.init({
        selector: `#${this.id}`,
        skin: false,
        toolbar:
          "undo redo | preview | code | paste | numlist | bulllist | forecolor backcolor | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image | help",
        plugins: "code textcolor preview lists paste image",
        init_instance_callback: editor => {
          this.editor = editor;

          editor.on("KeyUp", e => {
            this.$emit("input", editor.getContent());
          });

          editor.on("blur", function() {
            var newContent = editor.getContent();
          });

          editor.on("Change", e => {
            this.$emit("input", editor.getContent());
            var newContent = editor.getContent();
            this.$emit("content-updated", newContent);
          });

          setTimeout(() => editor.setContent(this.value), 300);
        }
      });
    }
  }
};
</script>
