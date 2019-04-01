<template>
  <div id="app">
    <v-app>
      <v-content>
        <v-layout row wrap>

          <!-- The top tool bar -->
          <v-card>
            <v-toolbar fixed>
              <v-btn icon v-on:click="goHome()">
                <v-icon>home</v-icon>
              </v-btn>
              <v-toolbar-title>Missing Map</v-toolbar-title>
            </v-toolbar>
          </v-card>

          <v-flex xs12>  <!-- take the space of the floatting toolbar -->
            <div style="height: 70px"> </div>
          </v-flex>

          <!-- uploading page content -->
          <template v-if="uploadingPage">
            <!-- drag drop box -->
            <v-flex xs6>
              <v-flex>
                <DragDropBox :files="imgs" :alert="raiseAlert" style="position:fixed; top:94px ;margin: 2%; width:45%"/>
              </v-flex>

              <!-- Alert window -->
              <v-flex>
                <v-toolbar flat fixed class="transparent" style="left: 230px">
                  <v-alert
                    dismissible
                    v-model="alert"
                    type="error"
                    icon="new_releases"
                    transition="scale-transition"
                  >
                    {{alertMsg}}
                  </v-alert>
                </v-toolbar>
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
                    <PreviewCard upload :img="file" :imgs="imgs" :uploading="uploading">
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
                  Expend All
                </v-btn>
                <v-btn color="info" v-on:click="expend_all(false)">
                  <v-icon>unfold_less</v-icon>
                  Collapse All
                </v-btn>
                <v-btn color="info">
                  <v-icon>arrow_downward</v-icon>
                  Download All
                </v-btn>
              </v-toolbar>
              <v-layout row wrap>
                <v-flex d-flex xs4 v-for="img in imgs" :key="img.name">
                  <ReportCard ref="report_card" :img="img" :imgs="imgs"/>
                </v-flex>
              </v-layout>
              <br>
              <br>
              <br>
            </v-container>
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
const axios = require('axios');

export default {
  name: 'app',
  data: function(){
    return {
      uploadingPage: true,
      imgs: [],
      alert: false,
      alertMsg: "",
      uploading: false,
      slice: [2, 2],
    }
  },
  methods: {
    submitImg: function (event) {
      if (this.imgs.length) {
        this.uploading = true;
        this.alert = false;
        this.alertMsg = "";

        let postURL = "https://nottnodered.eu-gb.mybluemix.net/ts2"
        var formData = new FormData();
        this.imgs.forEach(img => formData.append("images", img.file));
        formData.set("xSlice", this.slice[0]);
        formData.set("ySlice", this.slice[1]);
        axios.post(postURL, formData, {
          timeout:100000, // 100s
        }).then(function(res) {
          console.log(res);
          let results = res.data
          if (results.length != this.imgs.length) {
            console.log("results.length != this.imgs.length, this should never happens");
          } else {
            for (let i = 0; i < results.length; i++) {
              this.imgs[i].result = results[i]
            }
          }

          // end of processing
          this.uploading = false;
          this.uploadingPage = false; // switch page
        }.bind(this))
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
          this.alert = true;
          this.alertMsg = msg;
        }.bind(this), 100)
      }
    },
    goHome: function() {
      this.uploadingPage = true
      this.imgs = []
    },
    expend_all: function (expend) {
      [...this.$refs.report_card].forEach(function(child) {child.show = expend})
    }
  },
  computed:{

  },
  components: {
    DragDropBox,
    PreviewCard,
    ReportCard,
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
