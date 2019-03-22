<template>
  <v-layout>
   <v-flex>
     <v-card>
       <v-card-title primary-title>
         <v-flex xs6>

           <!-- <v-img :src="imgUrl"></v-img> -->
           <canvas ref = "c"></canvas>
           <canvas ref = "full" style="display: none"></canvas>
         </v-flex>
         <v-spacer />
         <div>
           <h3 class="headline mb-0" >{{img.file.name}}</h3>
         </div>
       </v-card-title>


       <v-card-actions>
         <v-btn flat color="primary" v-on:click="download()">
           Download
         </v-btn>
         <v-spacer />
         <v-btn flat color="primary" @click = "show = !show">
           {{show ? "Collapse" : "Details"}}
         </v-btn>
       </v-card-actions>
       <v-slide-y-transition>
         <v-card-text v-show = "show">
           <div v-for="n in reportInfo.length" :key="n" style="margin-bottom: 10px">{{reportInfo[n-1]}}</div>
         </v-card-text>
       </v-slide-y-transition>
     </v-card>
   </v-flex>
 </v-layout>
</template>

<script>
export default {
  name: 'ReportCard',
  props: {
    img: Object,
    imgs: Array,
    slice: Array
  },
  data: function () {
    return {
      show: false,
    }
  },
  methods:{
    downloadCanvas: function (canvas) {
      let link = document.createElement("a");
      let fName = this.img.file.name;
      fName = fName.replace(/\.[^/.]+$/, "");
      link.download = fName + "_masked.jpg";
      link.href = canvas.toDataURL("image/jpg").replace("image/png", "image/octet-stream");
      link.click();
    },
    downloadThumbnail: function() {
      this.downloadCanvas(this.$refs.c)
    },

    download: function() {


      let load = () => {
        let c = this.$refs.full;
        c.setAttribute("height", img.height)
        c.setAttribute("width", img.width)
        let ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        for (let x = 0; x < this.slice[0]; x++) {
          for (let y = 0; y < this.slice[1]; y++) {
            let conf = this.getConfidence(x, y);
            let width = c.width / this.slice[0]
            let height = c.height / this.slice[1]
            let xStart = width * x
            let yStart = height * y
            ctx.fillStyle="rgba(255, 0, 0, " + (1-conf) + ")"; // red stands for non-habitable
            ctx.fillRect(xStart, yStart, width, height);
          }
        }

        this.downloadCanvas(c)
      }

      let img = new Image(888, 888);
      img.onload = load
      img.src = this.imgUrl;
    },

    getConfidence: function(x, y) {
      return this.resultArr[x + y*(this.slice[0])]
    }
  },

  computed: {
    fileSize: function() {
        let kb = this.img.file.size / 1024
        return kb < 100 ? (kb.toFixed(2) + " KB") : ((kb / 1024).toFixed(2) + " MB")
    },

    imgUrl: function () {
      return window.URL.createObjectURL(this.img.file)
    },

    reportInfo: function() {
      // every line is an element in the returned list
      // console.log(this.img.result.images);
      if (this.img.result[0] === undefined) {
        return [
          `Here should be the report details. Some random stuff here now`,
          `Name: ${this.img.file.name}`,
          `LastModifiedDate: ${this.img.file.lastModifiedDate}`,
          `Type: ${this.img.file.type}\n`,
        ];
      } else {
        return this.img.result.map(rslt => {
          let classifier = rslt.images[0].classifiers[0]
          return [
            `classifier_id: ${classifier.classifier_id}`,
          ].concat(classifier.classes.map(oneClass => `${oneClass.class}: \t ${oneClass.score}` +
            (oneClass.type_hierarchy ? ` from \t ${oneClass.type_hierarchy}` : "")))
        }).reduce((acc, cur) => acc.concat(cur), [])
      }
    },

    resultArr: function() {
      return this.img.result.map(pitch => pitch.images[0].classifiers[0].classes[0].score)
    }

  },

  mounted: function() {
    let c = this.$refs.c;
    let ctx = c.getContext("2d");

    let draw = () => {
      ctx.drawImage(img, 0, 0);
      for (let x = 0; x < this.slice[0]; x++) {
        for (let y = 0; y < this.slice[1]; y++) {
          let conf = this.getConfidence(x, y);
          let width = c.width / this.slice[0]
          let height = c.height / this.slice[1]
          let xStart = width * x
          let yStart = height * y
          ctx.fillStyle="rgba(255, 0, 0, " + (1-conf) + ")"; // red stands for non-habitable
          ctx.fillRect(xStart, yStart, width, height);
        }
      }
    }

    let img = new Image(c.width, c.height);
    img.onload = draw
    img.src = this.imgUrl;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas {
  width: 100%;
  height: 100%;
}

</style>
