import { maxOpacity } from '@src/config';


// Draw an image with mask of given confidence to given canvas
// params:
//   canvas: the canvas DOM element to draw on
//   img: the img DON element which is the base of drawing
//   sliceNum: define the how many slices will be divides to in x / y axis
//   confidence: a function return confidence between 0 to 1
export default (canvas, img, sliceNum, confidence) => {
  const c = canvas;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, c.width, c.height);

  const tileWidth = c.width / sliceNum.x;
  const tileHeight = c.height / sliceNum.y;
  for (let x = 0; x < sliceNum.x; x += 1) {
    for (let y = 0; y < sliceNum.y; y += 1) {
      const conf = confidence(x, y);
      const xStart = tileWidth * x;
      const yStart = tileHeight * y;
      ctx.fillStyle = `rgba(255, 0, 0, ${conf * maxOpacity})`; // red stands for non-habitable
      ctx.fillRect(xStart, yStart, tileWidth, tileHeight);
    }
  }
};
