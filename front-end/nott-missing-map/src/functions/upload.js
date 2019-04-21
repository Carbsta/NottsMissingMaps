import axios from 'axios';
import Jimp from 'jimp';
import JSZip from 'jszip';
import { backEnd, progressWeight } from '@src/config';

// The greatest chunk size defined by IBM
// See https://console.bluemix.net/apidocs/visual-recognition#classify-images
const chunkSize = 20;

// The FileReader promise
const pFileReader = file => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = e => res(e.target.result);
  fr.readAsArrayBuffer(file);
});


// Prevent "heavy work" of Jimp from frozing the browser
// see https://github.com/vuejs/vue/issues/9200
function doubleRafPromise() {
  return new Promise((res, rej) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => res());
    });
  });
}

// Divide segments to chunks of 20 (IBM max size)
// imgs: an array of images buffer (Int8Array)
// return a list of zip File (Int8Array)
function imgZips(imgs, filename, fileext) {
  const zips = Array(Math.ceil(imgs.length / chunkSize))
    .fill()
    .map((_, index) => index * chunkSize)
    .map(begin => imgs.slice(begin, begin + chunkSize))
    .map((imgChunk, chunkNum) => {
      const zip = new JSZip();
      imgChunk.forEach((img, i) => {
        zip.file(`${filename}_${chunkNum * chunkSize + i}.${fileext}`, img);
      });
      return zip.generateAsync({ type: 'uint8array' });
    });
  return Promise.all(zips);
}

// Return a promise, which will resolve the result of segment and classfying
// Promises chaining is used, for reference: https://javascript.info/promise-chaining
export default (slice, file, progress) => {
  const segmentsTotal = slice.x * slice.y;
  const mime = file.type;
  const filename = file.name.replace(/\.[^/.]+$/, '');
  const fileext = /(?:\.([^.]+))?$/.exec(file.name)[1];

  return new Promise((resolve, reject) => {
    pFileReader(file).then(
      buffer => Jimp.read(buffer),
    ) // return the Jimp instance

    // Then process the images
      .then(async (im) => {
        const w = im.bitmap.width / slice.x; // the width of every patch
        const h = im.bitmap.height / slice.y; // the height of every patch

        const patchs = [];

        for (let y = 0; y < slice.y; y += 1) {
          for (let x = 0; x < slice.x; x += 1) {
            // eslint-disable-next-line no-param-reassign
            progress.data += progressWeight.segment;
            await doubleRafPromise(); // eslint-disable-line no-await-in-loop

            patchs.push(im
              .clone()
              .crop(w * x, h * y, w, h)
              /* .getBase64Async(mime) // get data URI */
              .getBufferAsync(mime)); // get buffer
          }
        }
        return Promise.all(patchs);
      })
      // Then zip to chunks
      .then((patchs) => {
        const zips = imgZips(patchs, filename, fileext);
        // eslint-disable-next-line no-param-reassign
        progress.data += progressWeight.zipping * segmentsTotal;
        return zips;
      })
      // Then query the API
      .then(
        patchs => axios.get(backEnd).then(res => ({ patchs, vrCfg: res.data })),
      )
      // Then access the classifier
      .then(data => Promise.all(data.patchs.map((buf, i) => {
        const formData = new FormData();
        const imagesFile = new File([buf], `${filename}_chunk_${i}.zip`, { type: 'application/zip' });
        formData.set('images_file', imagesFile);
        formData.set('classifier_ids', data.vrCfg.model_id);
        formData.set('threshold', 0);

        return axios.post(data.vrCfg.url, formData, {
          params: { version: data.vrCfg.version },
          headers: { 'Accept-Language': 'en' },
          auth: {
            username: 'apikey',
            password: data.vrCfg.api_key,
          },
          // timeout:60000, // add timeout limit if needed
        }).then((res) => {
          const segmentNum = (i === data.patchs.length - 1)
            ? (segmentsTotal) % chunkSize
            : chunkSize;
          // eslint-disable-next-line no-param-reassign
          progress.data += progressWeight.uploading * segmentNum;
          return res;
        });
      })))
      // Then filter the response data
      .then(ress => ress.map(res => res.data.images
        .sort((s1, s2) => {
          const re = /(?<=_)(([1-9]?[0-9])(?!.*(_[1-9]?[0-9])))/;
          const segmentNum = i => parseInt(re.exec(i.image), 10);
          return segmentNum(s1) - segmentNum(s2);
        }))
        .reduce((arr1, arr2) => arr1.concat(arr2))
        .map(img => img.classifiers[0]))
      .then((res) => { resolve(res); })
      .catch((err) => { reject(err); });
  });
};
