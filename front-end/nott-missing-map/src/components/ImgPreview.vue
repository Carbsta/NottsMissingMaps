<template>
  <div ref="container" >
    <img :src="imgUrl" ref = "i" class="comparison-image">
    <canvas ref = "c"></canvas>
  </div>
</template>

<script>
import ImageComparison from 'image-comparison';

export default {
  name: 'ImgPreview',
  props: {
    img: Object,
    slice: Array,
  },
  data() {
    return {};
  },
  methods: {
    getConfidence(x, y) {
      return this.resultArr[x + y * (this.slice[0])];
    },

    draw(canvas, img, fitCanvasSize) {
      const c = canvas;

      if (fitCanvasSize) {
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

      this.draw(this.$refs.c, img, true);

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
