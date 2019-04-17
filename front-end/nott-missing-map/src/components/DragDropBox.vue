<template>
  <form ref="fileform" class="box mt-auto align-center d-flex grey lighten-4 elevation-3">
    <div class="box__input">
      <input
        class="box__file"
        type="file"
        name="files[]"
        id="file"
        data-multiple-caption="{count} files selected"
        multiple
      />
      <label for="file" class="md-headline" style="display: inline">
        <strong>
          Choose a file <i class="material-icons folder-icon">folder</i>
        </strong>
        <span class="box__dragndrop"> or drag it here</span>.
      </label>
    </div>
  </form>
</template>

<script>
// import Vue from 'vue'
// import vuetify from 'Vuetify'
export default {
  name: 'DragDropBox',
  props: { files: Array, alert: Function },
  data() {
    return {
      dragAndDropCapable: false,
    };
  },
  mounted() {
    const div = document.createElement('div');

    this.dragAndDropCapable = (('draggable' in div)
      || ('ondragstart' in div && 'ondrop' in div))
      && 'FormData' in window
      && 'FileReader' in window;

    const fileInput = this.$refs.fileform.querySelector('input[type="file"]');
    fileInput.addEventListener('change', (e) => {
      this.addFiles(fileInput.files);
      this.$refs.fileform.reset();
    });

    if (this.dragAndDropCapable) {
      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((evt) => {
        this.$refs.fileform.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, false);
      });

      this.$refs.fileform.addEventListener('drop', (e) => {
        this.addFiles(e.dataTransfer.files);
      });

      const dragoverClasses = ['is-dragover'];
      // drag over
      this.$refs.fileform.addEventListener('dragover', (e) => {
        dragoverClasses.forEach(
          className => this.$refs.fileform.classList.add(className),
        );
      });

      // leave
      ['dragend', 'dragleave', 'drop'].forEach((evt) => {
        this.$refs.fileform.addEventListener(evt, (e) => {
          dragoverClasses.forEach(
            className => this.$refs.fileform.classList.remove(className),
          );
        }, false);
      });
    }
  },
  methods: {
    addFiles(files) {
      const fileArr = [...files];
      const filtered = fileArr.filter(file => file.type.split('/')[0] === 'image');
      const invalidFile = fileArr.length - filtered.length;
      if (invalidFile) {
        this.alert(`${invalidFile} of ${fileArr.length} file(s) are invalid and ignored!`);
      }
      filtered.forEach(file => this.files.push({ file, result: {} }));
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box {
  height:500px;
  outline: 2px dashed #BDBDBD;
  outline-offset: -10px;
  text-align: center;
  padding: 200px 20px;
  transition: outline-offset .15s ease-in-out, background-color .15s linear;
}

.box__input {
  align-item: center;
}

.box__dragndrop {
  display: inline;
}
.is-dragover {
  outline-offset: -20px;
  outline-color: #82B1FF; /* default accent */
  color: #82B1FF; /* default accent */
}
.box__file {
  display: none;
}
.box label {
  cursor: pointer;
}
.folder-icon {
  display:inline;
  vertical-align: bottom;
}

</style>
