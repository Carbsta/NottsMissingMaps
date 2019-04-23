<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-card-title primary-title>
          <!-- The tooltip for Image -->
          <v-tooltip bottom
            :position-x="dynamicTooltip.x"
            :position-y="dynamicTooltip.y"
            v-model="dynamicTooltip.show"
            content-class="segment-info-tooltip"
          >
            <template>
              <v-layout row justify-space-between
                v-for="oneClass in dynamicTooltip.segment.children"
                :key="oneClass.name"
                @mousemove="onmousemove($event)"
              >
                <span class="mr-1">{{oneClass.name}}:</span>
                <span>{{oneClass.score.toFixed(2)}}</span>
              </v-layout>
            </template>
          </v-tooltip>

          <!-- Image -->
          <v-flex xs6 sm12 lg6 justify-start pa-1>
            <div ref="container" justify-start
              @mousemove="onmousemove($event); dynamicTooltip.show = true"
              @mouseover="dynamicTooltip.show = true"
              @mouseout="dynamicTooltip.show = false;"
            >
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
                <div class="text-truncate" v-on="on">{{`Habitation Score: ${overallScore}`}}</div>
              </template>
              <span>{{`Habitation Score: ${overallScore}`}}</span>
            </v-tooltip>
          </v-flex>
        </v-card-title>

        <!-- The tags -->
        <v-layout row wrap mx-4 justify-start>
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
          <v-btn small flat color="primary" @click="download()"
            :loading="zipping" :disabled="zipping"
          >
            Download
            <template v-slot:loader><span>Compressing</span></template>
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

              <!-- append: segOverallScore -->
              <template v-slot:append="{ item }">
                <v-tooltip left v-if="item.children">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      {{item.segOverallScore.toFixed(2)}}
                    </span>
                  </template>
                  <span>
                    {{`Overall inhabitable score of ${item.name}: `
                      + item.segOverallScore.toFixed(2)}}
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
import { classifier, sliceNum } from '@src/config';
import colors from 'vuetify/es5/util/colors';
import kebabCase from 'lodash/kebabCase';
import { stringify as json2yml } from 'json2yaml';
import JSZip from 'jszip';

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
      zipping: false,
      dynamicTooltip: {
        x: -1,
        y: -1,
        show: false,
        segment: { children: [] },
      },
    };
  },
  methods: {
    getConfidence(x, y) {
      return Math.max(...this.resultArr[x + y * this.slice.x]);
    },

    // Download the masked image of current ReportCard. (Full size rather than thumbnail.)
    download() {
      this.zipping = true;
      const blobs = this.downloadableBlobs;
      const zip = new JSZip();

      ['maskedImg', 'friendlyReport', 'nerdReport'].forEach((fileItem) => {
        zip.file(blobs[fileItem].name, blobs[fileItem].blob);
      });

      // Save the zip
      zip.generateAsync({ type: 'blob' }).then((b) => {
        this.zipping = false;
        saveAs(b, `${blobs.nameNoExt}.zip`);
      });
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
    onmousemove(e) {
      // set tooltip position
      if (!this.dynamicTooltip.show) return;

      const rect = this.$refs.container.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const y = e.clientY - rect.top; // y position within the element.

      const segmentW = rect.width / this.slice.x;
      const segmentH = rect.height / this.slice.y;

      const segmentX = Math.floor(x / segmentW);
      const segmentY = Math.floor(y / segmentH);

      if (segmentX < 0 || segmentX >= this.slice.x
        || segmentY < 0 || segmentY >= this.slice.y) return;

      this.dynamicTooltip.segment = this
        .reportTree[segmentX + segmentY * this.slice.x];
      this.dynamicTooltip.x = rect.left + segmentW * (segmentX + 0.5);
      this.dynamicTooltip.y = rect.top + segmentH * (segmentY + 1);
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

      return Math.max(...habScoreList);
    },

    // The data used in v-treeview
    reportTree() {
      return this.img.result
        .map((segment, i) => {
          // Only list classes with non-zero score
          const x = i % this.slice.x;
          const y = Math.floor(i / this.slice.x);
          return {
            name: `Segment ${i} (x: ${x} y: ${y})`,
            segOverallScore: Math.max(...segment.classes
              .filter(c => this.inhabitableClasses.includes(c.class))
              .map(c => c.score)),
            children: segment.classes
              .map(oneClass => ({ name: oneClass.class, score: oneClass.score })),
          };
        });
    },

    // The array of class names, used to display coloured tags on the cards
    tagArr() {
      const confidentClasses = this.img.result
        .map(segment => segment.classes)
        .reduce((arr1, arr2) => arr1.concat(arr2))
        .filter(oneClass => oneClass.score > 0.8)
        .map(oneClass => oneClass.class);
      const unique = [...new Set(confidentClasses)].sort();
      return unique
        .filter((tag) => {
          if (tag === 'Beach' || tag === 'Water') {
            return confidentClasses
              .filter(c => c === tag)
              .length >= Math.floor((sliceNum.x + sliceNum.y) / 2);
          }

          return true;
        });
    },

    // The array of scores of every patch, used for calculate confidence
    resultArr() {
      return this.img.result
        .map(segment => segment.classes
          .filter(oneClass => this.inhabitableClasses.includes(oneClass.class))
          .map(oneClass => oneClass.score));
    },

    // The downloadable report object
    reportObj() {
      return {
        file: this.img.file.name,
        report: {
          overallScore: this.overallScore,
          overalTags: this.tagArr,
          segments: this.reportTree.reduce((obj, seg) => {
            obj[seg.name] = ({ // eslint-disable-line no-param-reassign
              segmentOverallScore: seg.segOverallScore,
              classes: seg.children.reduce((o, c) => {
                o[c.name] = c.score; // eslint-disable-line no-param-reassign
                return o;
              }, {}),
            });
            return obj;
          }, {}),
        },
      };
    },
  },


  asyncComputed: {
    // The blob data of masked image. Used for bulk downloading
    downloadableBlobs() {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = (() => {
          this.$refs.full.setAttribute('height', img.height);
          this.$refs.full.setAttribute('width', img.width);
          drawCanvas(this.$refs.full, img, this.slice, this.getConfidence);

          // determine file Name
          let fName = this.img.file.name;
          fName = fName.replace(/\.[^/.]+$/, '');

          // call resolve
          this.$refs.full.toBlob((blob) => {
            resolve({
              nameNoExt: fName,
              maskedImg: {
                blob,
                name: `${fName}_masked.jpg`,
              },
              friendlyReport: {
                blob: new Blob([
                  json2yml(this.reportObj)
                    .split('\n')
                    .slice(1) // remove the first line
                    .map(l => l.slice(2)) // decrease indent
                    .join('\n'),
                ], { type: 'text/plain' }),
                name: `${fName}_report.txt`,
              },
              nerdReport: {
                blob: new Blob([JSON.stringify(this.reportObj, null, 2)], { type: 'text/plain' }),
                name: `${fName}_report.json`,
              },
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

.segment-info-tooltip {
  transition: top 0.2s, left 0.2s;
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
