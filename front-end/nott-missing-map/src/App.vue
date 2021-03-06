<template>
  <div id="app">
    <v-app>
      <v-content>
        <v-layout row wrap>

          <!-- The top tool bar -->
          <v-card>
            <v-toolbar app fixed style="z-index: 999;">
              <v-btn icon @click="goHome()" :disabled="uploading || zipping">
                <v-icon>home</v-icon>
              </v-btn>
              <v-flex shrink>
                <v-toolbar-title>Missing Maps</v-toolbar-title>
              </v-flex>

              <!-- Alert window -->
              <v-flex shrink class="overflow-hidden">
                <v-alert
                  dismissible
                  v-model="alert"
                  type="error"
                  icon="new_releases"
                  transition="scale-transition"
                  class="ml-5"
                >
                  <span class="text-truncate">{{alertMsg}}</span>
                </v-alert>
              </v-flex>
              <v-spacer></v-spacer>

              <!-- Help dialog -->
              <v-dialog v-model="helpDialog" width="90%">
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-icon>help</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="grey lighten-2 py-2">
                    <span class="headline">Instructions</span>
                    <v-spacer />
                    <v-btn flat color="info" class="px-0"
                      href="http://tinyurl.com/yxzvkmd9" target="_blank"
                    >user manual</v-btn>
                    <v-btn flat color="info" class="px-0 hidden-sm-and-down"
                      href="http://tinyurl.com/y6qjhse3" target="_blank"
                    >Software documentation</v-btn>
                    <v-btn flat color="info" class="mx-0 hidden-xs-only"
                      href="https://github.com/Carbsta/NottsMissingMaps" target="_blank"
                    >
                      <img style="display: inline; width: 20px;" class="ma-1"
                        src="https://github.githubassets.com/favicon.ico"/>
                      <span style="text-transform: none; position: relative; top:2px">Star</span>
                    </v-btn>

                  </v-card-title>
                  <v-card-text class="text-xs-left">
                    <h1 class="title mb-1">Upload Images</h1>
                    <h2 class="subheading">Upload</h2>
                    <p class="body-2">
                      You can drag satellite images into the box, or click on
                      it to choose file(s) from your filesystem.Images that you
                      choose appear on the right-hand side on report cards. The
                      name and size are shown to the right of the images.
                    </p>

                    <h2 class="subheading">Dismiss</h2>
                    <p class="body-2">
                      You can scroll through these cards if you have uploaded
                      many images, and clicking on the dismiss button will remove
                      that image.
                    </p>
                    <h2 class="subheading">Format error</h2>
                    <p class="body-2">
                      If the format of the file is not image, you will get a
                      warning.
                    </p>
                    <h2 class="subheading">Submit</h2>
                    <p class="body-2">
                      Click “Submit”, classify these images that you uploaded.
                      Once the progress indicator reaches 100 percent, you will
                      be taken to the results page automatically.
                    </p>

                    <h1 class="title mb-1">Final Result</h1>
                    <p class="body-2">
                      The results of the classification are displayed as report cards.
                    </p>
                    <p class="body-2">
                      You can click on the images to move the heatmap with the little
                      slider, or click on the "preview" button to view a larger version
                      of the image.
                    </p>
                    <p class="body-2">
                      You can see the overall habitation score underneath the name of the
                      image, this score is the maximum habitation score from all of the segments.
                      It is a scale from 0 to 1, representing the percentage of confidence.
                      Also, the colour coded tags tell you which classes have a segment with a
                      score over 0.8. To view information about each segment in detail,
                      click on the "details" button of a card, or click on the "expand all"
                      button to view all cards at once.
                    </p>
                    <p class="body-2">
                      The segments are numbered in ascending order, with segment 1 being
                      the top left segment, going left to right. Each score represents
                      the confidence in the image belonging to each class, from 0 to 1.
                      1 being 100 percent confidence. Click "collapse" or "collapse all"
                      to hide these details again.
                    </p>
                    <p class="body-2">
                      The download button downloads the masked version of the image,
                      and the download all button downloads a zip archive containing
                      all of these images.
                    </p>
                    <p class="body-2">
                      Enjoy using the website!
                    </p>

                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="helpDialog = false">
                      Close
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </v-card>


          <!-- uploading page content -->
          <template v-if="uploadingPage">

            <!-- drag drop box and its progress circular -->
            <v-flex xs12 sm6>
              <div v-if="!uploading"
                :class="($vuetify.breakpoint.xsOnly ? 'upload-box-xs': 'upload-box')
                  + ($vuetify.breakpoint.smAndDown ? ' pa-3': ' pa-4')"
              >
                <div class="hidden-sm-and-up upload-box-xs-before"></div>
                <DragDropBox :files="imgs" :alert="raiseAlert" class="elevation-3"/>
              </div>
              <v-progress-circular
                v-else
                :rotate="0"
                :size="$vuetify.breakpoint.xsOnly ? 150 : 200"
                :width="$vuetify.breakpoint.xsOnly ? 15 : 20"
                :value="percentage"
                color="primary"
                class="non-transition-progress-circular"
              >
                {{percentage}}%
              </v-progress-circular>
            </v-flex>

            <v-flex xs12 class="hidden-sm-and-up upload-box-xs-placeholder"></v-flex>
            <!-- Preview Cards -->
            <v-flex xs12 sm6>
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


              <br>
              <br>
              <br>
              <br class="hidden-sm-and-up">
              <br class="hidden-sm-and-up">
            </v-container>
            <!-- popup in report page (image preview) -->
            <template>
              <div class="text-xs-center">
                <v-dialog v-model="previewImg.on" content-class="prevDialog" ref="prevDialog">
                  <v-card  v-if="previewImg.on" height="100%">
                    <v-layout class="ma-0 pa-0" column style="height: 100%">
                      <v-flex d-flex shrink>
                        <v-card-title class="title grey lighten-2 pa-3" >
                          <!-- Take the file name as the title of popup -->
                          {{previewImg.reportCard.img.file.name}}
                        </v-card-title>
                      </v-flex>

                      <v-flex d-flex grow>
                        <v-card-text class="">
                          <ImgPreview :reportCard="previewImg.reportCard"/>
                        </v-card-text>
                      </v-flex>
                      <v-flex d-flex shrink>
                        <v-card-actions>
                          <v-spacer></v-spacer><!-- align the close button right  -->
                          <v-btn small color="primary" flat @click="previewImg.on = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-flex>
                    </v-layout>

                  </v-card>
                </v-dialog>
              </div>
            </template>
          </template>

          <!-- Bottom buttons -->
          <v-layout row class="fab-container" ma-3>
            <!-- submit button on uploading page -->
            <v-btn v-if="uploadingPage" color="info" @click="submitImg" :loading="uploading">
              Submit
            </v-btn>

            <!-- 4 buttons on report page -->
            <template v-else>
              <v-flex pa-0 shrink text-xs-left>
                <v-btn color="info" :small="$vuetify.breakpoint.smAndDown"
                  @click="expand_all(true)"
                >
                  <v-icon class="hidden-sm-and-down">unfold_more</v-icon> Expand All
                </v-btn>

                <v-btn color="info" :small="$vuetify.breakpoint.smAndDown"
                  @click="expand_all(false)"
                >
                  <v-icon class="hidden-sm-and-down">unfold_less</v-icon> Collapse All
                </v-btn>
              </v-flex>

              <v-flex pa-0 shrink text-xs-left>
                <v-btn color="info" :small="$vuetify.breakpoint.smAndDown"
                  :loading="zipping" :disabled="zipping"
                  @click="download_all"
                >
                  <v-icon class="hidden-sm-and-down">arrow_downward</v-icon>
                  Download All
                  <template v-slot:loader><span>Compressing...</span></template>
                </v-btn>
              </v-flex>
            </template>
          </v-layout>
        </v-layout>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { sliceNum, progressWeight } from '@src/config';
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
      helpDialog: false,
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
        const weightSum = Object.values(progressWeight).reduce((a, b) => a + b, 0);
        this.progress = {
          // Init progress to 0
          data: 0,
          max: this.imgs.length * sliceNum.x * sliceNum.y * weightSum,
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
        child.show = expand; // eslint-disable-line no-param-reassign
      });
    },

    // DOWNLOAD ALL button handler
    download_all() {
      this.zipping = true;
      const zip = new JSZip();
      [...this.$refs.report_card].map(card => card.downloadableBlobs)
        .forEach((blobs) => {
          ['maskedImg', 'friendlyReport', 'nerdReport'].forEach((fileItem) => {
            zip.file(blobs[fileItem].name, blobs[fileItem].blob);
          });
        });

      // Generate zip file
      zip.generateAsync({ type: 'blob' }).then((b) => {
        saveAs(b, 'result.zip');
        this.zipping = false;
      });
    },
  },
  computed: {
    // Get the percentage of progress
    percentage() {
      return Math.floor(this.progress.data / this.progress.max * 100);
    },

    // The downloadable report objects
    reportObjs() {
      if (!this.$refs.report_card) return undefined;
      return [...this.$refs.report_card].map(rc => rc.reportObj);
    },
  },

  mounted() {
    // Warning before refresh
    window.onbeforeunload = () => (this.imgs.length
      ? 'You will lose all of data and report.'
      : undefined);
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
  z-index: 2;
  width: 50%;
}
.upload-box-xs {
  position: fixed;
  z-index: 2;
  top: 0;
  padding: 14px;
  padding-top: 0;
  width: 100%;
}
.upload-box-xs-before {
  height: 74px;
  background-color: #fafafa;
}
.upload-box-xs form {
  padding-top: 10px !important;
  padding-bottom: 10px !important;

  height: 200px !important;
}
.upload-box-xs-placeholder {
  height: 230px
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

.fab-container {
   position: fixed;
   bottom: 0;
   left: 0;
   z-index: 2;
   flex-wrap: wrap-reverse;
}

.prevDialog {
  width: 90%;
  overflow: hidden;
  height: 80vh;
}

</style>
