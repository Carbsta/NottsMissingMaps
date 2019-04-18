<template>
  <div ref="container" >
    <img :src="imgUrl" ref = "i" class="comparison-image">
    <canvas ref = "c" class="with-mask"></canvas>
  </div>
</template>

<script>
import ImageComparison from 'image-comparison';
import drawCanvas from '@src/functions/drawCanvas';

export default {
  name: 'ImgPreview',
  props: {
    img: Object,
    slice: Object,
  },
  data() {
    return {};
  },
  methods: {
    getConfidence(x, y) {
      return this.resultArr[x + y * (this.slice.x)];
    },

    updateSize() {
      this.$refs.i.style.width = `${this.$refs.c.scrollWidth}px`;
      this.$refs.i.style.height = `${this.$refs.c.scrollHeight}px`;
    },
  },

  computed: {
    imgUrl() {
      return window.URL.createObjectURL(this.img.file);
    },

    resultArr() {
      return this.img.result.map(pitch => pitch.classes[0].score);
    },
  },

  mounted() {
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(
        window.innerWidth / img.naturalWidth,
        (window.innerHeight - 150) / img.naturalHeight,
      ) * 0.8;
      img.width = img.naturalWidth * ratio;
      img.height = img.naturalHeight * ratio;

      this.$refs.c.setAttribute('height', img.height);
      this.$refs.c.setAttribute('width', img.width);
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
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.with-mask {
  width: 100%;
  height: 100%;
}

@import '~image-comparison/src/ImageComparison.css';

/* Some modification: opacity of slide bar when not focused */
.comparison-separator, .comparison-control {
  opacity: 0.5;
}
</style>
