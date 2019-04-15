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
  // eslint-disable-next-line
  const filename = file.name.replace(/\.[^/.]+$/, "")
  // eslint-disable-next-line
  const fileext  = /(?:\.([^.]+))?$/.exec(file.name)[1]

  return new Promise((resolve, reject) => {
    pFileReader(file).then(buffer =>
      Jimp.read(buffer) // return the Jimp instance
    ).then(async im => {
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
      //
      // progress.data += 1.0
      // console.log(JSON.stringify(progress));
      // im
      //   .clone()
      //   .crop(w*1, h*1, w, h )
      //   //.getBase64Async(mime)    // get data URI
      //   .getBufferAsync(mime) // get buffer
      //   .then(res => {
      //     progress.data += 1.0
      //     console.log(JSON.stringify(progress));
      //     im
      //       .clone()
      //       .crop(w*1, h*2, w, h )
      //       //.getBase64Async(mime)    // get data URI
      //       .getBufferAsync(mime) // get buffer
      //       .then (res2 => {
      //
      //       })
      //   })
      //
    })
    // .then(patchs => {
    //   let postURL = "https://fortestbranchnott.eu-gb.mybluemix.net/api"
    //
    //   return Promise.all(patchs.map(p => {
    //     // let formData = new FormData();
    //     // formData.append("image", p)
    //
    //     const readable = new Readable()
    //     readable._read = () => {}
    //     readable.push(p)
    //     readable.push(null)
    //
    //
    //     console.log(p);
    //     return axios.post(postURL, {image: readable}, {
    //       timeout:60000, // 60s
    //     })
    //   }))
    // })

    // .then(patchs => {
    //   let visualRecognition = new VisualRecognitionV3({
    //     version: '2018-03-19',
    //     iam_apikey: 'qvKuhx-TfYJj4CF4z3935Y7niTKANlK-7HJNLF46ddg9'
    //   });
    //   return Promise.all(patchs.map(buf => {
    //     let params = {
    //       images_file: buf
    //     }
    //     return new Promise((res, rej) => {
    //       visualRecognition.classify(params, (err, r) => err ? rej(err) : res(r))
    //     })
    //   }))
    // })

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
          // timeout:60000, // 60s
        }).then(res => {
          progress.data += 0.2
          return res
        })
      }))
    })
    .then(ress =>
      ress.map(res => res.data.images[0].classifiers[0])
    )

    .then(res => { resolve(res) })
    .catch(err => { reject(err) })
  })
}
