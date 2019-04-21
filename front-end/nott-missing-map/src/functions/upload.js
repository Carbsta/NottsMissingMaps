import axios from 'axios';
import Jimp from 'jimp';
import { backEnd } from '@src/config';

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


// Return a promise, which will resolve the result of segment and classfying
// Promises chaining is used, for reference: https://javascript.info/promise-chaining
export default (slice, file, progress) => {
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
            progress.data += 1.0; // eslint-disable-line no-param-reassign
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
      // Then query the API
      .then(patchs => {
        return axios.get(backEnd).then(res => ({ patchs, vrCfg: res.data }))
      })
      // Then access the classifier
      .then(data => Promise.all(data.patchs.map((buf, i) => {
        const formData = new FormData();
        formData.set('images_file', new File([buf], `${filename}_${i}.${fileext}`, { type: file.type }));
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
          progress.data += 0.2; // eslint-disable-line no-param-reassign
          return res;
        });
      })))
      // Then filter the response data
      .then(ress => ress.map(res => res.data.images[0].classifiers[0]))
      .then((res) => { resolve(res); })
      .catch((err) => { reject(err); });
  });
};
