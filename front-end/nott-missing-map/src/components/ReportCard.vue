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
            <div class="title mb-0" >{{img.file.name}}</div>
            <div class="text-truncate"> <!-- Some important info can be put here! -->
              {{this.img.result.some(r => r.error) ? "Warning: Error(s) from backend!" : ""}}
            </div>
          </div>
        </v-card-title>

        <v-card-actions>
          <v-btn small flat color="primary" v-on:click="download()">
            Download
          </v-btn>
          <v-spacer />
          <v-btn small flat color="primary"
            @click="previewImg.img = img; previewImg.on = true"
          > Preview </v-btn>
          <v-btn small flat color="primary" @click="show = !show">
            {{show ? "Collapse" : "Details"}}
          </v-btn>
        </v-card-actions>
        <v-slide-y-transition>
          <v-card-text v-show = "show">
            <p v-for="n in reportInfo.length" :key="n"
              style="margin-bottom: 10px; text-align: left;"
            >
              <!-- Probably it is not elegant / secure to write as following -->
              <span v-html="(n != 1 ? '&nbsp;&nbsp;&nbsp;' : '') + reportInfo[n-1]"></span>
            </p>
          </v-card-text>
        </v-slide-y-transition>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { saveAs } from 'file-saver';
import ImageComparison from 'image-comparison';

export default {
  name: 'ReportCard',
  props: {
    img: Object,
    imgs: Array,
    slice: Array,
    previewImg: Object,
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    // A helper function: download the given canvas element as image file
    downloadCanvas(canvas) {
      let fName = this.img.file.name;
      fName = fName.replace(/\.[^/.]+$/, '');
      fName += '_masked.jpg';

      canvas.toBlob((blob) => {
        saveAs(blob, fName);
      }, 'image/jpg');
    },

    getConfidence(x, y) {
      return this.resultArr[x + y * this.slice[0]];
    },

    // Draw the given Image html element on canvas
    //   canvas: the canvas element to draw on
    //   img: the DOM Image object
    //   resizeCanvas: resize the size of canvas according to size of img
    draw(canvas, img, resizeCanvas) {
      const c = canvas;

      if (resizeCanvas) {
        c.setAttribute('height', img.height);
        c.setAttribute('width', img.width);
      }
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);

      const tileWidth = c.width / this.slice[0];
      const tileHeight = c.height / this.slice[1];
      for (let x = 0; x < this.slice[0]; x += 1) {
        for (let y = 0; y < this.slice[1]; y += 1) {
          const conf = this.getConfidence(x, y);
          const xStart = tileWidth * x;
          const yStart = tileHeight * y;
          ctx.fillStyle = `rgba(255, 0, 0, ${conf * 0.5})`; // red stands for non-habitable
          ctx.fillRect(xStart, yStart, tileWidth, tileHeight);
        }
      }
    },

    // Download the masked image of current ReportCard. (Full size rather than thumbnail.)
    download() {
      const img = new Image();

      img.onload = () => {
        this.draw(this.$refs.full, img, true);
        this.downloadCanvas(this.$refs.full);
      };

      img.src = this.imgUrl;
    },
  },

  computed: {
    fileSize() {
      const kb = this.img.file.size / 1024;
      return kb < 100 ? `${kb.toFixed(2)} KB` : `${(kb / 1024).toFixed(2)} MB`;
    },

    // The local url of image of this ReportCard
    imgUrl() {
      return window.URL.createObjectURL(this.img.file);
    },

    // The infomation shown when the card is expanded
    reportInfo() {
      // every line is an element in the returned list
      if (this.img.result === undefined || this.img.result[0] === undefined) {
        return [
          'Here should be the report details. Some random stuff here now',
          `Name: ${this.img.file.name}`,
          `LastModifiedDate: ${this.img.file.lastModifiedDate}`,
          `Type: ${this.img.file.type}\n`,
        ];
      }
      if (this.img.result.some(r => r.error)) {
        return [
          'Some error happens in backend: ',
        ].concat(
          this.img.result.filter(r => r.error).map((r, i) => `Patch ${i}: ${r.error.message}`),
        );
      }

      console.log(this.img);
      let unique = [(this.img.result.map(classifier => {
        console.log(classifier);
        let tags = [].concat(classifier.classes.filter(oneClass => oneClass.score > 0.5).map(oneClass => `${oneClass.class}`))
        return tags
      }))].flat().flat()
      let habScoreList = [(this.img.result.map(classifier => {
        let score = [].concat(classifier.classes.filter(oneClass => oneClass.class == "Buildings" || oneClass.class == "Dense Residential" || oneClass.class == "Sparse Residential" || oneClass.class == "Medium Residential").map(oneClass => `${oneClass.score}`))
        console.log(score);
        return score
      }))].flat().flat()
      let habScore = Math.max.apply(Math, habScoreList)
      console.log(habScore);
      let report = [`Habitation Score: ` + habScore, `Tags: `].concat([...new Set(unique)])
      return report
    },

    // The array of scores of every patch, used for calculate confidence
    resultArr() {
      return this.img.result.map(patch => (patch.error ? 0 : patch.classes[0].score));
    },
  },

  asyncComputed: {
    // The blob data of masked image. Used for bulk downloading
    resultBlob() {
      return new Promise((resolve, reject) => { // TODO: check if need extra bind
        const img = new Image();
        img.onload = (() => {
          this.draw(this.$refs.full, img, true);

          // determine file Name
          let fName = this.img.file.name;
          fName = fName.replace(/\.[^/.]+$/, '');
          fName += '_masked.jpg';

          // call resolve
          this.$refs.full.toBlob((blob) => {
            resolve({
              blob,
              name: fName,
            });
          }, 'image/jpg');
        });

        img.src = this.imgUrl;
      });
    },
  },

  // Change size of elements; Add slide bar; Add listener for window resizing...
  mounted() {
    const img = new Image();
    const updateSize = () => {
      const cont = this.$refs.container;
      const { i } = this.$refs;
      cont.style.height = `${cont.clientWidth * i.naturalHeight / i.naturalWidth}px`;
      this.$refs.i.style.width = `${this.$refs.c.scrollWidth}px`;
      this.$refs.i.style.height = `${this.$refs.c.scrollHeight}px`;
    };
    img.onload = () => {
      this.draw(this.$refs.c, img, false);

      // eslint-disable-next-line
      new ImageComparison({
        container: this.$refs.container,
        startPosition: 0,
        data: [
          {
            image: this.$refs.i,
            label: '',
          },
          {
            image: this.$refs.c,
            label: '',
          },
        ],
      });
      updateSize();
    };
    img.src = this.imgUrl;
    window.addEventListener('resize', e => updateSize());
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
canvas {
  width: 100%;
  height: 100%;
}

@import 'ImageComparison.css';

/* Some modification: opacity of slide bar when not focused */
.comparison-separator, .comparison-control {
  opacity: 0.5;
}
</style>
