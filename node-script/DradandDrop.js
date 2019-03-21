<script>
    /////////////////////////////////
    // The Drag Drop Box Component //
    /////////////////////////////////
    // reference: https://serversideup.net/drag-and-drop-file-uploads-with-vuejs-and-axios/
    Vue.component('drag-drop-box', {
      delimiters: ['{(', ')}'],
      props: {files: Array, alert: Function},
      data: function () {
        return {
          dragAndDropCapable: false,
        }
      },
      mounted: function() {
        Vue.use(Vuetify, { options: { customProperties: true } })

        var div = document.createElement('div');

        this.dragAndDropCapable = ( ( 'draggable' in div )
          || ( 'ondragstart' in div && 'ondrop' in div ) )
          && 'FormData' in window
          && 'FileReader' in window;

        console.log("dragAndDropCapable is " + this.dragAndDropCapable);

        let fileInput = this.$refs.fileform.querySelector( 'input[type="file"]' )
        fileInput.addEventListener( 'change', function(e) {
          this.addFiles(fileInput.files)
          this.$refs.fileform.reset()
        }.bind(this))

        if (this.dragAndDropCapable) {
          ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( function( evt ) {
            this.$refs.fileform.addEventListener(evt, function(e){
              e.preventDefault();
              e.stopPropagation();
            }.bind(this), false);
          }.bind(this));

          this.$refs.fileform.addEventListener('drop', function(e){
            this.addFiles(e.dataTransfer.files)
          }.bind(this));

          dragoverClasses = ["is-dragover",]
          // drag over
          this.$refs.fileform.addEventListener('dragover', function(e){
            dragoverClasses.forEach(className =>
              this.$refs.fileform.classList.add( className )
            )
          }.bind(this));

          // leave
          [ 'dragend', 'dragleave', 'drop'].forEach( function( evt ) {
            this.$refs.fileform.addEventListener(evt, function(e){
              dragoverClasses.forEach(className =>
                this.$refs.fileform.classList.remove( className )
              )
            }.bind(this), false);
          }.bind(this));
        }

      },
      methods: {
        dismissFile: function(fileName) { return },
        addFiles: function(files) {
          let fileArr = this.files;
          files = [...files];
          let filtered = files.filter(file => file.type.split("/")[0] == 'image')
          let invalidFile = files.length - filtered.length;
          if (invalidFile)
            this.alert(invalidFile + " of " + files.length + " file(s) are invalid and ignored!");
          filtered.forEach(file => fileArr.push({file:file, result: {}}))
        }
      },
      template: `
        <form ref="fileform" style="height:500px;" :class="'box mt-auto align-center d-flex grey lighten-4 elevation-3'">
          <div class="box__input" style="align-item: center">
            <input class="box__file" type="file" name="files[]" id="file" data-multiple-caption="{count} files selected" multiple />
            <label for="file" class="md-headline" style="display: inline">
              <strong>Choose a file <i class="material-icons" style="display:inline; vertical-align: bottom">folder</i></strong>
              <span class="box__dragndrop"> or drag it here</span>.
            </label>
          </div>
        </form>
      `
    })
</script>
