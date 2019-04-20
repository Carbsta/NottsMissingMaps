<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-card-title primary-title>
          <!-- Image -->
          <v-flex xs6 sm12 lg6 justify-start pa-1>
            <div ref="container" justify-start>
              <img :src="imgUrl" ref = "i" class="comparison-image">
              <canvas ref = "c" class="with-mask"></canvas>
            </div>
            <canvas ref = "full" id="full"></canvas>
          </v-flex>

          <v-spacer />

          <!-- Title and subtitle -->
          <v-flex xs6 sm12 lg6 shrink pa-1 overflow-hidden class="text-xs-center ">
            <!-- title -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <div class="title pa-1 text-truncate" v-on="on">{{img.file.name}}</div>
              </template>
              <span>{{img.file.name}}</span>
            </v-tooltip>
            <!-- subtitle -->
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div class="text-truncate" v-on="on">{{overallScore}}</div>
              </template>
              <span>{{overallScore}}</span>
            </v-tooltip>
          </v-flex>
        </v-card-title>

        <!-- The tags -->
        <v-layout row wrap mx-4 justify-space-between>
          <v-chip selected text-color="white"
            v-for="tag in tagArr" :key="tag"
            :color="palettes[availableClass.findIndex(x => x == tag) % palettes.length]
              +' darken-3'"
          >
            {{tag}}
          </v-chip>
        </v-layout>

        <!-- The buttons -->
        <v-card-actions>
          <v-btn small flat color="primary" v-on:click="download()">
            Download
          </v-btn>
          <v-spacer />
          <v-btn small flat color="primary"
            @click="onPreview();"
          > Preview </v-btn>
          <v-btn small flat color="primary" @click="show = !show">
            {{show ? "Collapse" : "Details"}}
          </v-btn>
        </v-card-actions>

        <!-- Report details -->
        <v-slide-y-transition>
          <v-layout row mx-3 justify-start v-show="show" id="tree-view">
            <v-treeview class="text-xs-left" :items="reportTree" style="width: 100%">
              <!-- Tree item -->
              <template v-slot:label="{ item }">
                <span>
                  {{item.name + (item.score != undefined ? `: ${item.score}` : '')}}
                </span>
              </template>

              <!-- append: overallScore -->
              <template v-slot:append="{ item }">
                <v-tooltip left v-if="item.children">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      {{item.overallScore.toFixed(2)}}
                    </span>
                  </template>
                  <span>
                    {{`Overall inhabitable score of ${item.name}: `
                      + item.overallScore.toFixed(2)}}
                  </span>
                </v-tooltip>
              </template>
            </v-treeview>
          </v-layout>
        </v-slide-y-transition>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { saveAs } from 'file-saver';
import ImageComparison from 'image-comparison';
import drawCanvas from '@src/functions/drawCanvas';
import { classifier } from '@src/config';
import colors from 'vuetify/es5/util/colors';
import kebabCase from 'lodash/kebabCase';


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

    onPreview() {
      this.previewImg.reportCard = this;
      this.previewImg.on = true;
    },
  },

  computed: {
    palettes() {
      // last 2 are: gray / shades
      return Object.keys(colors).map(kebabCase).slice(0, -2);
    },

    inhabitableClasses() {
      return classifier.classes
        .filter(c => c.inhabitable)
        .map(c => c.name);
    },

    availableClass() {
      return classifier.classes.map(c => c.name);
    },

    fileSize() {
      const kb = this.img.file.size / 1024;
      return kb < 100 ? `${kb.toFixed(2)} KB` : `${(kb / 1024).toFixed(2)} MB`;
    },

    // The local url of image of this ReportCard
    imgUrl() {
      return window.URL.createObjectURL(this.img.file);
    },

    // The overall score shown as  subtitle of the card
    overallScore() {
      if (this.img.result.some(r => r.error)) {
        return ([
          'Some error happens in backend: ',
        ].concat(
          this.img.result.filter(r => r.error).map((r, i) => `Patch ${i}: ${r.error.message}`),
        ))[0];
      }

      const habScoreList = this.img.result
        .map(segment => segment.classes)
        .reduce((arr1, arr2) => arr1.concat(arr2))
        .filter(oneClass => this.inhabitableClasses.includes(oneClass.class))
        .map(oneClass => oneClass.score);

      const habScore = Math.max(...habScoreList);
      return `Habitation Score: ${habScore}`;
    },

    reportTree() {
      return this.img.result
        .map((segment, i) => {
          // Only list classes with non-zero score
          const x = i % this.slice.x;
          const y = Math.floor(i / this.slice.x);
          return {
            name: `Segment ${i} (x: ${x} y: ${y})`,
            overallScore: Math.max(...segment.classes
              .filter(c => this.inhabitableClasses.includes(c.class))
              .map(c => c.score)),
            children: segment.classes
              .map(oneClass => ({ name: oneClass.class, score: oneClass.score })),
          };
        });
    },

    // The array of class names, used to display coloured tags on the cards
    tagArr() {
      const unique = this.img.result
        .map(segment => segment.classes)
        .reduce((arr1, arr2) => arr1.concat(arr2))
        .filter(oneClass => oneClass.score > 0.8)
        .map(oneClass => oneClass.class);
      return [...new Set(unique)].sort();
    },

    // The array of scores of every patch, used for calculate confidence
    resultArr() {
      return this.img.result
        .map(segment => segment.classes
          .filter(oneClass => this.inhabitableClasses.includes(oneClass.class))
          .map(oneClass => oneClass.score));
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


@import '~image-comparison/src/ImageComparison.css';

/* Some modification: opacity of slide bar when not focused */
.comparison-separator, .comparison-control {
  opacity: 0.5;
}
</style>
