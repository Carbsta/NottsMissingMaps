import axios from 'axios'
import Jimp from 'jimp'


// The FileReader promise
const pFileReader = file => new Promise((res, rej) => {
  let fr = new FileReader();
  fr.onload = e => res(e.target.result);
  fr.readAsArrayBuffer(file)
})


// Prevent "heavy work" of Jimp from frozing the browser
// see https://github.com/vuejs/vue/issues/9200
function  doubleRafPromise() {
  return new Promise((res, rej) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => res())
    })
  })
}


// Return a promise, which will resolve the result of segment and classfying
// Promises chaining is used, for reference: https://javascript.info/promise-chaining
export default (xSlice, ySlice, file, progress) => {
  const mime = file.type;
  const filename = file.name.replace(/\.[^/.]+$/, "")
  const fileext  = /(?:\.([^.]+))?$/.exec(file.name)[1]

  return new Promise((resolve, reject) => {
    pFileReader(file).then(buffer =>
      Jimp.read(buffer) // return the Jimp instance
    )
    // Then process the images
    .then(async im => {
      let w = im.bitmap.width / xSlice;   // the width of every patch
      let h = im.bitmap.height / ySlice;  // the height of every patch

      let patchs = [];

      for (var y = 0; y < ySlice; y++) {
        for (var x = 0; x < xSlice; x++) {
          progress.data += 1.0
          await doubleRafPromise();

          patchs.push( im
              .clone()
              .crop(w*x, h*y, w, h )
              //.getBase64Async(mime)    // get data URI
              .getBufferAsync(mime) // get buffer
          )
        }
      }
      return Promise.all(patchs);
    })
    // Then query the API
    .then(patchs => {
      return Promise.all(patchs.map((buf, i) => {
        const url = "https://gateway.watsonplatform.net/visual-recognition/api/v3/classify";
        let formData = new FormData();
        formData.set("images_file",    new File([buf], `${filename}_${i}.${fileext}`, {type: file.type}));
        formData.set("classifier_ids", "LandCategory_931213784");
        formData.set("threshold",      0);

        return axios.post(url, formData, {
          params : {
            version: "2018-03-19"
          },
          headers:{'Accept-Language': 'en'},
          auth: {
            username: 'apikey',
            password: 'qvKuhx-TfYJj4CF4z3935Y7niTKANlK-7HJNLF46ddg9'
          },
          // timeout:60000, // add timeout limit if needed
        }).then(res => {
          progress.data += 0.2
          return res
        })
      }))
    })
    // Then filter the response data
    .then(ress =>
      ress.map(res => res.data.images[0].classifiers[0])
    )

    .then(res => { resolve(res) })
    .catch(err => { reject(err) })
  })
}