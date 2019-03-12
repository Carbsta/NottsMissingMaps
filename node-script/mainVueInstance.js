<script>

    ///////////////////////////
    // The main Vue Instance //
    ///////////////////////////
    new Vue({
      el: '#app',
      delimiters: ['{(', ')}'],
      data: {
        uploadingPage: true,
        imgs: [],
        alert: false,
        alertMsg: "",
        uploading: false,
      },
      methods: {
        submitImg: function (event) {
          if (this.imgs.length) {
            // TODO: the real uploading things
            let postURL = "testFE2"
            var formData = new FormData();
            this.imgs.forEach(img => formData.append("images", img.file));
            this.uploading = true;
            axios.post(postURL, formData, {
              timeoutL:1000000,
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
        cardsData: function() {return {}} // TODO
      }
    })

  </script>