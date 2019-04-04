<template>
  <v-layout>
   <v-flex>
     <v-card>
       <v-card-title primary-title>
         <v-flex xs6>
           <div ref="container">
             <img :src="imgUrl" ref = "i" class="comparison-image">
             <canvas ref = "c"></canvas>
           </div>
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
         <v-btn flat color="primary" @click="previewImg.img = img; previewImg.on = true"> Preview </v-btn>
         <v-btn flat color="primary" @click="show = !show">
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
import { saveAs } from 'file-saver'
import ImageComparison from 'image-comparison';

export default {
  name: 'ReportCard',
  props: {
    img: Object,
    imgs: Array,
    slice: Array,
    previewImg: Object
  },
  data: function () {
    return {
      show: false,
    }
  },
  methods:{
    downloadCanvas: function (canvas) {
      let fName = this.img.file.name;
      fName = fName.replace(/\.[^/.]+$/, "");
      fName += "_masked.jpg";

      canvas.toBlob(function(blob) {
        saveAs(blob, fName)
      }, "image/jpg")
    },

    getConfidence: function(x, y) {
      return this.resultArr[x + y*(this.slice[0])]
    },

    draw: function(canvas, img, fitCanvasSize) {
      let c = canvas;

      if (fitCanvasSize) {
        c.setAttribute("height", img.height)
        c.setAttribute("width", img.width)
      }
      let ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, c.width, c.height);

      let tileWidth = c.width / this.slice[0]
      let tileHeight = c.height / this.slice[1]
      for (let x = 0; x < this.slice[0]; x++) {
        for (let y = 0; y < this.slice[1]; y++) {
          let conf = this.getConfidence(x, y);
          let xStart = tileWidth * x
          let yStart = tileHeight * y
          ctx.fillStyle="rgba(255, 0, 0, " + (conf)*.5 + ")"; // red stands for non-habitable
          ctx.fillRect(xStart, yStart, tileWidth, tileHeight);
        }
      }
    },

    download: function() {
      let img = new Image();

      img.onload = (() => {
        this.draw(this.$refs.full, img, true)
        this.downloadCanvas(this.$refs.full)
      }).bind(this)

      img.src = this.imgUrl;
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
      if (this.img.result[0] === undefined) {
        return [
          `Here should be the report details. Some random stuff here now`,
          `Name: ${this.img.file.name}`,
          `LastModifiedDate: ${this.img.file.lastModifiedDate}`,
          `Type: ${this.img.file.type}\n`,
        ];
      } else {
        return this.img.result.map(rslt => {
          let classifier = rslt.images[0].classifiers[0];
          let unique = [... new Set([].concat(classifier.classes.filter(oneClass => oneClass.score > 0.5).map(oneClass => `${oneClass.class}`)))];
          return unique
        }).filter.reduce((acc, cur) => acc.concat(cur), [])
      }
    },

    resultArr: function() {
      return this.img.result.map(pitch => pitch.images[0].classifiers[0].classes[0].score)
    }
  },

  asyncComputed: {
    resultBlob: function () {
      return (new Promise(function (resolve, reject) {
        let img = new Image();
        img.onload = (() => {
          this.draw(this.$refs.full, img, true)

          //determine file Name
          let fName = this.img.file.name;
          fName = fName.replace(/\.[^/.]+$/, "");
          fName += "_masked.jpg";

          // call resolve
          this.$refs.full.toBlob(function(blob) {
            resolve({
              "blob": blob,
              "name": fName
            })
          }, "image/jpg")
        }).bind(this)

        img.src = this.imgUrl;
      }.bind(this)))
    }
  },

  mounted: function() {
    let img = new Image();
    let updateSize = () => {
      this.$refs.i.style.width = this.$refs.c.scrollWidth + "px"
      this.$refs.i.style.height = this.$refs.c.scrollHeight + "px"
    }
    img.onload = () => {
      this.draw(this.$refs.c, img, false)

      new ImageComparison({
        container: this.$refs.container,
        startPosition: 0,
        data: [
          {
            image: this.$refs.i,
            label: ''
          },
          {
            image: this.$refs.c,
            label: ''
          }
        ],
      });
      updateSize()
    }
    img.src = this.imgUrl;
    window.addEventListener("resize", e => { updateSize() } );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
canvas {
  width: 100%;
  height: 100%;
}

@import 'ImageComparison.css';

/* Some modification */
.comparison-separator, .comparison-control {
  opacity: 0.5;
}
</style>
