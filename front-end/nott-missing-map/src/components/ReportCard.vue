<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-card-title primary-title>
          <v-flex xs6>
            <div ref="container">
              <img :src="imgUrl" ref = "i" class="comparison-image">
              <canvas ref = "c" class="with-mask"></canvas>
            </div>
            <canvas ref = "full" id="full"></canvas>
          </v-flex>
          <v-spacer />
          <div>
            <div class="title mb-0" >{{img.file.name}}</div>
            <div class="text-truncate"> <!-- Some important info can be put here! -->
              {{this.img.result.some(r => r.error) ?
                "Warning: Error(s) from backend!" : this.reportInfo[0]}}
            </div>
          </div>
        </v-card-title>
        <div v-for="n in tagArr.length" :key="n" style="display:inline;">
          <!-- Probably it is not elegant / secure to write as following -->
          <v-chip v-if="tagArr[n-1] == 'Agriculture'"
          color="light-green darken-4" text-color="white">Agriculture</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Beach'"
          color="amber darken-1" text-color="white">Beach</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Buildings'"
          color="red accent-4" text-color="white">Buildings</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Dense Residential'"
          color="red darken-3" text-color="white">Dense Residential</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Desert'"
          color="deep-orange darken-3" text-color="white">Desert</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Forest'"
          color="green darken-4" text-color="white">Forest</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Medium Residential'"
          color="red" text-color="white">Medium Residential</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Shrubland'"
          color="lime darken-4" text-color="white">Shrubland</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Sparse Residential'"
          color="red darken-1" text-color="white">Sparse Residential</v-chip>
          <v-chip v-if="tagArr[n-1] == 'Water'"
          color="teal darken-3" text-color="white">Water</v-chip>
        </div>
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
            <p v-for="n in reportInfo.length-1" :key="n" class="report-details">
              <!-- Probably it is not elegant / secure to write as following -->
              <span v-html="(n % 11 != 1 ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
               : '') + reportInfo[n]"></span>
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
import drawCanvas from '@src/functions/drawCanvas';

export default {
  name: 'ReportCard',
  props: {
    img: Object,
    imgs: Array,
    slice: Object,
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
      return Math.max(...this.resultArr[x + y * this.slice.x]);
    },

    // Download the masked image of current ReportCard. (Full size rather than thumbnail.)
    download() {
      const img = new Image();

      img.onload = () => {
        this.$refs.full.setAttribute('height', img.height);
        this.$refs.full.setAttribute('width', img.width);
        drawCanvas(this.$refs.full, img, this.slice, this.getConfidence);
        this.downloadCanvas(this.$refs.full);
      };

      img.src = this.imgUrl;
    },
    updateSize() {
      const cont = this.$refs.container;
      const { i } = this.$refs;
      cont.style.height = `${cont.clientWidth * i.naturalHeight / i.naturalWidth}px`;
      this.$refs.i.style.width = `${this.$refs.c.scrollWidth}px`;
      this.$refs.i.style.height = `${this.$refs.c.scrollHeight}px`;
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
      const resultArray = [(this.img.result.map((classifier, index) => {
        const score = ['Segment: '.concat(index + 1)].concat(classifier.classes.map(oneClass => `${oneClass.class}: ${oneClass.score}`));
        console.log(score);
        return score;
      }))].flat().flat();
      const habScoreList = [(this.img.result.map((classifier) => {
        const score = [].concat(classifier.classes.filter(
          oneClass => oneClass.class === 'Buildings'
            || oneClass.class === 'Dense Residential'
            || oneClass.class === 'Sparse Residential'
            || oneClass.class === 'Medium Residential',
        ).map(oneClass => `${oneClass.score}`));
        return score;
      }))].flat().flat();
      const habScore = Math.max(...habScoreList);
      return [`Habitation Score: ${habScore}`].concat(resultArray);
    },

    // The array of class names, used to display coloured tags on the cards
    tagArr() {
      const unique = [(this.img.result.map((classifier) => {
        const tags = [].concat(classifier.classes
          .filter(oneClass => oneClass.score > 0.75)
          .map(oneClass => `${oneClass.class}`));
        return tags;
      }))].flat().flat().sort();
      console.log([...new Set(unique)]);
      return [...new Set(unique)];
    },

    // The array of scores of every patch, used for calculate confidence
    resultArr() {
      return [(this.img.result.map((classifier) => {
        const score = [].concat(classifier.classes.filter(
          oneClass => oneClass.class === 'Buildings'
            || oneClass.class === 'Dense Residential'
            || oneClass.class === 'Sparse Residential'
            || oneClass.class === 'Medium Residential',
        ).map(oneClass => `${oneClass.score}`));
        return score;
      }))].flat();
    },
  },

  asyncComputed: {
    // The blob data of masked image. Used for bulk downloading
    resultBlob() {
      return new Promise((resolve, reject) => { // TODO: check if need extra bind
        const img = new Image();
        img.onload = (() => {
          this.$refs.full.setAttribute('height', img.height);
          this.$refs.full.setAttribute('width', img.width);
          drawCanvas(this.$refs.full, img, this.slice, this.getConfidence);

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

    img.onload = () => {
      drawCanvas(this.$refs.c, img, this.slice, this.getConfidence);

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
      this.updateSize();
    };
    img.src = this.imgUrl;
    window.addEventListener('resize', this.updateSize);
  },
  destroyed() {
    window.removeEventListener('resize', this.updateSize);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.with-mask {
  width: 100%;
  height: 100%;
}

#full {
  display: none;
}
.report-details {
  margin-bottom: 10px;
  text-align: left;
}

@import '~image-comparison/src/ImageComparison.css';

/* Some modification: opacity of slide bar when not focused */
.comparison-separator, .comparison-control {
  opacity: 0.5;
}
</style>
