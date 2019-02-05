Vue.use(VueMaterial.default)
key = "AkOxVVCiK3eLn7_RNH-yWJj56N2xXv1m_I-sCYrG5fIgney_5JLLHr99OHsfUgyP"
let id = 0
let app = new Vue({
    el: '#app',
    data: {
        title: 'Upload image/folder...',
        files: [],
    },
    computed: {
        cards: function(){return this.files.map(toCardData)},
    },
    methods: {
        dismissFile: function (fileId) {
            for (var i = this.files.length - 1; i >= 0; i--) {
                if (this.files[i].id == fileId) {
                    this.files.splice(i, 1);
                    break;
                }
            }
            console.log(this.files)
        },
    },
})

// called by file uploader
function addFiles(files) {
    files.forEach(file => {
        app.files.push({id: id, file: file})
        id ++
    })
    console.log(app.files)
}

function toCardData(file) {
    let src = window.URL.createObjectURL(file.file)
    let imagedata = {}
    return {
        id: file.id,
        image_file_name: file.file.name,
        image_url: src,
        image_file_size: biteToString(file.file.size),
    }
}

function biteToString(biteNum) {
    let kb = biteNum / 1024
    if (kb < 100) {
        return kb.toFixed(2) + " KB"
    } else {
        let mb = kb / 1024
        return mb.toFixed(2) + " MB"
    }
}

