<template>
  <div id="app">
    <v-app>
      <v-content>
        <v-layout row wrap>

          <!-- The top tool bar -->
          <v-card>
            <v-toolbar fixed style="z-index: 999;">
              <v-btn icon v-on:click="goHome()">
                <v-icon>home</v-icon>
              </v-btn>
              <v-toolbar-title>Missing Map</v-toolbar-title>

              <!-- Alert window -->
              <v-alert
                dismissible
                v-model="alert"
                type="error"
                icon="new_releases"
                transition="scale-transition"
                class="ml-5"
              >
                {{alertMsg}}
              </v-alert>
              <v-spacer></v-spacer>
            </v-toolbar>
          </v-card>



          <!-- uploading page content -->
          <template v-if="uploadingPage">

            <v-flex xs12>  <!-- take the space of the floatting toolbar -->
              <div style="height: 70px"> </div>
            </v-flex>

            <!-- drag drop box -->
            <v-flex xs6>
              <v-flex>
                <DragDropBox v-if="!uploading" :files="imgs" :alert="raiseAlert" style="position:fixed; top:94px ;margin: 2%; width:45%"/>
                <v-progress-circular
                  v-show="uploading"
                  ref="progressC"
                  :rotate="0"
                  :size="100"
                  :width="15"
                  :value="percentage"
                  color="primary"
                >
                  {{percentage}}
                </v-progress-circular>
              </v-flex>

              <!-- Bottom submit button -->
              <v-flex>
                <v-btn
                  class="text-none"
                  color="primary"
                  fixed style="margin:2%; bottom:0px; left:0px"
                  v-on:click="submitImg"
                  :loading="uploading"
                >
                  Submit
                </v-btn>
              </v-flex>
            </v-flex>

            <!-- Right part -->
            <v-flex xs6>
              <v-container fluid grid-list-xl>
                <v-layout row wrap>
                  <v-flex d-flex xs6 v-for="file in imgs" :key="file.name">
                    <PreviewCard upload :img="file" :imgs="imgs" :uploading="uploading" />
                  </v-flex>
                </v-layout>
              </v-container>
            </v-flex>
          </template>

          <!-- report page content -->
          <template v-else>
            <v-container fluid grid-list-xl>
              <v-toolbar  floatting flat style="position: fixed; z-index: 2; left: 30px;bottom: 30px; width: auto" class="transparent">
                <v-btn color="info" v-on:click="expend_all(true)">
                  <v-icon>unfold_more</v-icon>
                  Expand All
                </v-btn>
                <v-btn color="info" v-on:click="expend_all(false)">
                  <v-icon>unfold_less</v-icon>
                  Collapse All
                </v-btn>
                <v-btn color="info"
                  :loading="zipping"
                  :disabled="zipping"
                  @click="download_all"
                >
                  <v-icon>arrow_downward</v-icon>
                  Download All
                  <template v-slot:loader>
                    <span>Compressing...</span>
                  </template>
                </v-btn>
              </v-toolbar>
              <v-layout row wrap>
                <v-flex d-flex xs4 v-for="img in imgs" :key="img.name">
                  <ReportCard ref="report_card" :img="img" :imgs="imgs" :slice="slice" :previewImg="previewImg"/>
                </v-flex>
              </v-layout>
              <br>
              <br>
              <br>
            </v-container>
            <!-- popup in report page -->
            <template>
              <div class="text-xs-center">
                <v-dialog v-model="previewImg.on" width="1000">
                  <v-card  v-if="previewImg.on">
                    <v-card-title class="title grey lighten-2 pa-3" >
                      {{previewImg.img.file.name}} <!-- Take the file name as the title of popup -->
                    </v-card-title>

                    <v-card-text ref="imgPrev">
                      <ImgPreview :img="previewImg.img" :slice="slice"/>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn small color="primary" flat @click="previewImg.on = false">
                        Close
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
            </template>
          </template>
        </v-layout>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import DragDropBox from './components/DragDropBox.vue'
import PreviewCard from './components/PreviewCard.vue'
import ReportCard from './components/ReportCard.vue'
import ImgPreview from './components/ImgPreview.vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import upload from './functions/upload.js'

export default {
  name: 'app',
  data: function(){
    return {
      uploadingPage: true,
      imgs: [],
      alert: false,
      alertMsg: "",
      uploading: false,
      slice: [4, 4],
      zipping: false,
      previewImg: {img: undefined, on: false},
      progress: {data:0, max: 0},
    }
  },

  methods: {

    submitImg: function (event) {
      if (this.imgs.length) {
        this.uploading = true;
        this.alert = false;
        this.alertMsg = "";
        this.progress = {
          data: 0,
          max: 1.2 * this.imgs.length * this.slice[0] * this.slice[1]
        };
        Promise.all(this.imgs.map(img => {
           return upload(this.slice[0], this.slice[1], img.file, this.progress, this.$refs.progressC)
        }
        ))
        .then( res => {
          console.log(res)
          res.forEach((r, i) => {
            this.imgs[i].result = r;
          })
        })
        .catch(err => {
          this.raiseAlert(err.message);
          console.log([err])
        })
        .finally( () => {
          this.uploadingPage = false; // switch page
          this.uploading = false;
          window.scroll(0,0)
        })
      } else {
        this.raiseAlert("No images to submit");
      }
    },

    raiseAlert: function (msg) {
      if (!this.alert) {
        this.alert = true;
        this.alertMsg = msg;
      } else {
        this.alert = false;
        setTimeout(function() {
          this.raiseAlert(msg);
        }.bind(this), 100)
      }
    },
    goHome: function() {
      this.uploadingPage = true
      this.imgs = []
    },
    expend_all: function (expend) {
      [...this.$refs.report_card].forEach(function(child) {child.show = expend})
    },
    download_all: function () {
      this.zipping = true
      var zip = new JSZip();
      let promiseBlob = [...this.$refs.report_card]
        .map(card => card.resultBlob)
      Promise.all(promiseBlob).then(blobs => {
        blobs.forEach(x => zip.file(x.name, x.blob))

        // Generate zip file
        zip.generateAsync({type : "blob"}).then(b => {
          saveAs(b, "result.zip")
          this.zipping = false
        })
      })
    }
  },
  computed:{
    percentage: function () {
      return parseInt( this.progress.data / this.progress.max * 100)
    }
  },
  components: {
    DragDropBox,
    PreviewCard,
    ReportCard,
    ImgPreview,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
