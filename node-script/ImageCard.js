<script>


    //////////////////////////////
    // The Image Card Component //
    //////////////////////////////
    Vue.component('img-card', {
      delimiters: ['{(', ')}'],
      props: {upload: Boolean, img: Object, imgs: Array, uploading: Boolean},
      data: function () {
        return {
          show: false,
          data: "hello vue",
        }
      },
      methods:{
        dismiss: function() {
          for (let i = 0; i < this.imgs.length; i++) {
            if (this.imgs[i].file === this.img.file) {
              this.imgs.splice(i, 1)
            }
          }
        },
        download: function() {
          let link = document.createElement("a");
          link.download = this.img.file.name;
          link.href = this.imgUrl;
          link.click();
        }
      },
      computed: {
        fileSize: function() {
            let kb = this.img.file.size / 1024
            if (kb < 100) {
                return kb.toFixed(2) + " KB"
            } else {
                let mb = kb / 1024
                return mb.toFixed(2) + " MB"
            }
        },
        imgUrl: function () {
          return window.URL.createObjectURL(this.img.file)
        },
        reportInfo: function() {
          // every line is an element in the returned list
          console.log(this.img.result.images);
          if (!this.img.result.images) {
            return [
              `Here should be the report details. Some random stuff here now`,
              `Name: ${this.img.file.name}`,
              `LastModifiedDate: ${this.img.file.lastModifiedDate}`,
              `Type: ${this.img.file.type}\n`,
            ];
          } else {
            let classifier = this.img.result.images[0].classifiers[0]
            return [
              `classifier_id: ${classifier.classifier_id}`,
            ].concat(classifier.classes.map(oneClass => `${oneClass.class}: \t ${oneClass.score}` + 
              (oneClass.type_hierarchy ? ` from \t ${oneClass.type_hierarchy}` : "")))
          }
        }
      },

      template: `
         <v-layout>
          <v-flex>
            <v-card>
              <v-card-title primary-title>
                <v-flex xs6>
                  <v-img :src="imgUrl"></v-img>
                </v-flex>
                <v-spacer />
                <div>
                  <h3 class="headline mb-0" >{(img.file.name)}</h3>
                  <div>{(upload ? this.fileSize : this.fileSize)}</div>
                </div>
              </v-card-title>


              <v-card-actions>
                <v-btn v-if="!upload" flat color="primary" v-on:click="download()">
                  Download
                </v-btn>
                <v-spacer />
                <v-btn v-if="upload" flat color="primary" v-on:click="dismiss()" :disabled= "uploading" >
                  dismiss
                </v-btn>
                <v-btn v-else flat color="primary" @click = "show = !show">
                  {(show ? "Collapse" : "Details")}
                </v-btn>
              </v-card-actions>
              <v-slide-y-transition>
                <v-card-text v-show = "show">
                  <div v-for="line in reportInfo" style="margin-bottom: 10px">{(line)}</div>
                </v-card-text>
              </v-slide-y-transition>
            </v-card>
          </v-flex>
        </v-layout>
      `
    })


</script>