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
    slice: Array
  },
  data: function () {
    return { }
  },
  methods: {
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
    updateSize: function() {
      this.$refs.i.style.width = this.$refs.c.scrollWidth + "px"
      this.$refs.i.style.height = this.$refs.c.scrollHeight + "px"
    }
  },

  computed: {
    imgUrl: function () {
      return window.URL.createObjectURL(this.img.file)
    },

    resultArr: function() {
      return this.img.result.map(pitch => pitch.images[0].classifiers[0].classes[0].score)
    }
  },

  mounted: function() {
    let img = new Image();

    img.onload = () => {
      if (img.width > window.innerWidth * 0.7){
        img.width = window.innerWidth * 0.7;
      }
      if (img.height > window.innerHeight * 0.7) {
        img.height = window.innerHeight * 0.7;
      }

      this.draw(this.$refs.c, img, true)

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
      this.updateSize()
    }
    img.src = this.imgUrl;
    window.addEventListener("resize", this.updateSize );
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
