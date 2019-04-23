<template>
  <!-- The tooltip for Image -->
  <div style="height: 100%;">
    <v-tooltip :bottom="alwaysBottom || !top" :top="!alwaysBottom && top"
      :position-x="x"
      :position-y="y"
      v-model="show"
      content-class="segment-info-tooltip"
    >
      <template>
        <v-layout @mousemove="onmousemove($event)">
          <span>{{segment.name}}: </span>
        </v-layout>
        <v-layout row justify-space-between
          v-for="oneClass in segment.children"
          :key="oneClass.name"
          @mousemove="onmousemove($event)"
        >
          <span class="mr-1 ml-2">{{oneClass.name}}:</span>
          <span>{{oneClass.score.toFixed(2)}}</span>
        </v-layout>
      </template>
    </v-tooltip>

    <!-- Image -->
    <v-flex ref="containerWrapper" class = "container-wrapper">
      <div ref="container" justify-start style="width: 100%; height: 100%"
        @mousemove="onmousemove($event); show = true"
        @mouseover="show = true"
        @mouseout="show = false;"
      >
        <img :src="reportCard.imgUrl" ref = "i" class="comparison-image">
        <canvas ref = "c" class="with-mask"></canvas>
      </div>
    </v-flex>

  </div>
</template>

<script>
import ImageComparison from 'image-comparison';
import drawCanvas from '@src/functions/drawCanvas';

export default {
  name: 'ImgPreview',
  props: {
    reportCard: Object,
    alwaysBottom: Boolean,
  },
  data() {
    return {
      x: -1,
      y: -1,
      show: false,
      segment: { children: [] },
      top: true,
    };
  },
  methods: {
    updateSize() {
      const contW = this.$refs.containerWrapper;
      const cont = this.$refs.container;
      const { i, c } = this.$refs;
      const ratio = contW.clientWidth / contW.clientHeight;
      if (ratio > i.naturalWidth / i.naturalHeight) {
        cont.style.width = `${contW.clientHeight * i.naturalWidth / i.naturalHeight}px`;
      } else {
        cont.style.height = `${contW.clientWidth * i.naturalHeight / i.naturalWidth}px`;
      }
      c.style.width = cont.style.width;
      c.style.height = cont.style.height;

      i.style.width = `${this.$refs.c.scrollWidth}px`;
      i.style.height = `${this.$refs.c.scrollHeight}px`;
    },
    onmousemove(e) {
      // set tooltip position
      if (!this.show) return;

      const rect = this.$refs.container.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const y = e.clientY - rect.top; // y position within the element.

      const segmentW = rect.width / this.reportCard.slice.x;
      const segmentH = rect.height / this.reportCard.slice.y;

      const segmentX = Math.floor(x / segmentW);
      const segmentY = Math.floor(y / segmentH);

      if (segmentX < 0 || segmentX >= this.reportCard.slice.x
        || segmentY < 0 || segmentY >= this.reportCard.slice.y) return;

      this.segment = this.reportCard
        .reportTree[segmentX + segmentY * this.reportCard.slice.x];

      this.top = segmentY > this.reportCard.slice.y / 2;
      this.x = rect.left + segmentW * (segmentX + 0.5);
      this.y = rect.top + segmentH * (segmentY + (this.top ? 0 : 1));
    },
  },

  mounted() {
    const img = new Image();
    img.onload = () => {
      this.$refs.c.setAttribute('height', this.$refs.containerWrapper.clientHeight);
      this.$refs.c.setAttribute('width', this.$refs.containerWrapper.clientWidth);
      drawCanvas(
        this.$refs.c,
        img,
        this.reportCard.slice,
        this.reportCard.getConfidence,
      );

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
    img.src = this.reportCard.imgUrl;
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

.container-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center
}

@import '~image-comparison/src/ImageComparison.css';

/* Some modification: opacity of slide bar when not focused */
.comparison-separator, .comparison-control {
  opacity: 0.5;
}
</style>
