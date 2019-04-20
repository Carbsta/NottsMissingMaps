<template>
  <div id="app">
    <v-app>
      <v-content>
        <v-layout row wrap>

          <!-- The top tool bar -->
          <v-card>
            <v-toolbar app fixed style="z-index: 999;">
              <v-btn icon v-on:click="goHome()" :disabled="uploading || zipping">
                <v-icon>home</v-icon>
              </v-btn>
              <v-toolbar-title>Missing Maps</v-toolbar-title>

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

            <!-- drag drop box -->
            <v-flex xs6>
              <v-flex>
                <DragDropBox v-if="!uploading"
                  :files="imgs" :alert="raiseAlert" class="upload-box" />
                <v-progress-circular
                  v-else
                  :rotate="0"
                  :size="200"
                  :width="20"
                  :value="percentage"
                  color="primary"
                  class="non-transition-progress-circular"
                >
                  {{percentage}}%
                </v-progress-circular>
              </v-flex>

              <!-- Bottom submit button -->
              <v-flex>
                <v-btn
                  class="text-none submit-btn"
                  color="primary"
                  fixed
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
                  <v-flex d-flex xs12 md6 v-for="file in imgs" :key="file.name">
                    <PreviewCard upload :img="file" :imgs="imgs" :uploading="uploading" />
                  </v-flex>
                </v-layout>
              </v-container>
            </v-flex>
          </template>

          <!-- report page content -->
          <template v-else>
            <v-container fluid grid-list-xl>
              <v-layout row wrap>
                <v-flex d-flex xs12 sm6 md4 v-for="img in imgs" :key="img.name">
                  <ReportCard
                    ref="report_card"
                    :img="img"
                    :imgs="imgs"
                    :slice="$options.sliceNum"
                    :previewImg="previewImg"
                  />
                </v-flex>
              </v-layout>

              <v-toolbar floatting flat class="transparent bottom-toolbar">
                <v-btn color="info" v-on:click="expand_all(true)">
                  <v-icon>unfold_more</v-icon>
                  Expand All
                </v-btn>
                <v-btn color="info" v-on:click="expand_all(false)">
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
                      <!-- Take the file name as the title of popup -->
                      {{previewImg.reportCard.img.file.name}}
                    </v-card-title>

                    <v-card-text>
                      <ImgPreview :reportCard="previewImg.reportCard" :slice="$options.sliceNum"/>
                    </v-card-text>

                    <v-divider></v-divider> <!-- align the close button right  -->

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
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { sliceNum } from '@src/config';
import DragDropBox from './components/DragDropBox.vue';
import PreviewCard from './components/PreviewCard.vue';
import ReportCard from './components/ReportCard.vue';
import ImgPreview from './components/ImgPreview.vue';
import upload from './functions/upload';

export default {
  name: 'app',
  data() {
    return {
      uploadingPage: true,
      imgs: [],
      alert: false,
      alertMsg: '',
      uploading: false,
      zipping: false,
      previewImg: { reportCard: undefined, on: false },
      progress: { data: 0, max: 0 },
    };
  },

  // See http://tinyurl.com/yxvd2kzt
  // Can be accessed in template as $options.sliceNum
  sliceNum,

  methods: {
    // Submit button handler
    submitImg(event) {
      if (this.imgs.length) {
        this.uploading = true;
        this.alert = false;
        this.alertMsg = '';
        this.progress = {
          // Init progress to 0
          data: 0,
          // 1 for image processing and 0.2 for querying API
          max: 1.2 * this.imgs.length * sliceNum.x * sliceNum.y,
        };
        Promise.all(this.imgs.map(
          img => upload(sliceNum, img.file, this.progress),
        )).then((res) => {
          res.forEach((r, i) => {
            this.imgs[i].result = r;
          });
        }).catch((err) => {
          this.raiseAlert(err.message);
        }).finally(() => {
          this.uploadingPage = false; // switch page
          this.uploading = false;
          window.scroll(0, 0); // go to the top
        });
      } else {
        this.raiseAlert('No images to submit');
      }
    },

    // Show an error massage on the top toolbar
    raiseAlert(msg) {
      if (!this.alert) {
        this.alert = true;
        this.alertMsg = msg;
      } else {
        // If there is already an error message, give it 100ms to shrink out
        this.alert = false;
        setTimeout(() => this.raiseAlert(msg), 100);
      }
    },

    // Top left home button handler
    goHome() {
      this.imgs = [];
      this.previewImg.reportCard = undefined;
      this.previewImg.on = false;
      setTimeout(() => {
        this.uploadingPage = true;
      }, 10);
    },

    // EXPAND ALL and COLLAPSE ALL button (expand=false for collapse)
    expand_all(expand) {
      [...this.$refs.report_card].forEach((child) => {
        // eslint-disable-next-line
        child.show = expand;
      });
    },

    // DOWNLOAD ALL button handler
    download_all() {
      this.zipping = true;
      const zip = new JSZip();
      const promiseBlob = [...this.$refs.report_card]
        .map(card => card.resultBlob);
      Promise.all(promiseBlob).then((blobs) => {
        blobs.forEach(x => zip.file(x.name, x.blob));

        // Generate zip file
        zip.generateAsync({ type: 'blob' }).then((b) => {
          saveAs(b, 'result.zip');
          this.zipping = false;
        });
      });
    },
  },
  computed: {
    // Get the percentage of progress
    percentage() {
      return Math.floor(this.progress.data / this.progress.max * 100);
    },
  },
  components: {
    DragDropBox,
    PreviewCard,
    ReportCard,
    ImgPreview,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* Avoid transition as we only have a flash to update the screen
** See functions/upload.js for more details */
.non-transition-progress-circular {
  transition: none !important;
  margin-top: 110px;
}

/* All sub element of .non-transition-progress-circular should avoid transition */
.non-transition-progress-circular *{
  transition: none !important;
  font-size: 34px; /* The font size of number at the centre of progress-circular */
}

/* The drag drop box on uploading page */
.upload-box {
  position: fixed;
  top: 94px;
  margin: 2%;
  width: 45%
}

/* The submit button on uploading page */
.submit-btn {
  margin: 2%;
  bottom: 0px;
  left :0px;
}

/* The bottom toolbar on report page */
.bottom-toolbar {
  position: fixed;
  z-index: 2;
  left: 30px;
  bottom: 30px;
  width: auto;
}

</style>
