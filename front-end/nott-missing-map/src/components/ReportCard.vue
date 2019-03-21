<template>
  <v-layout>
   <v-flex>
     <v-card>
       <v-card-title primary-title>
         <v-flex xs6>
           <v-img :src="imgUrl"></v-img>
         </v-flex>
         <v-spacer />
         <div>
           <h3 class="headline mb-0" >{{img.file.name}}</h3>
         </div>
       </v-card-title>


       <v-card-actions>
         <v-btn flat color="primary" v-on:click="download()">
           Download
         </v-btn>
         <v-spacer />
         <v-btn flat color="primary" @click = "show = !show">
           {{show ? "Collapse" : "Details"}}
         </v-btn>
       </v-card-actions>
       <v-slide-y-transition>
         <v-card-text v-show = "show">
           <div v-for="n in reportInfo.length" :key="n" style="margin-bottom: 10px">{{reportInfo[n-1]}}</div>
         </v-card-text>
       </v-slide-y-transition>
     </v-card>
   </v-flex>
 </v-layout>
</template>

<script>
export default {
  name: 'ReportCard',
  props: {
    img: Object,
    imgs: Array
  },
  data: function () {
    return {
      show: false,
    }
  },
  methods:{
    download: function() {
      let link = document.createElement("a");
      link.download = this.img.file.name;
      link.href = this.imgUrl;
      link.click();
    }
  },

  computed: {
    fileSize: function() {
        let kb = this.img.file.size / 1024
        if (kb < 100) {
            return kb.toFixed(2) + " KB"
        } else {
            let mb = kb / 1024
            return mb.toFixed(2) + " MB"
        }
    },
    imgUrl: function () {
      return window.URL.createObjectURL(this.img.file)
    },
    reportInfo: function() {
      // every line is an element in the returned list
      // console.log(this.img.result.images);
      if (this.img.result[0] === undefined) {
        return [
          `Here should be the report details. Some random stuff here now`,
          `Name: ${this.img.file.name}`,
          `LastModifiedDate: ${this.img.file.lastModifiedDate}`,
          `Type: ${this.img.file.type}\n`,
        ];
      } else {
        return this.img.result.map(rslt => {
          let classifier = rslt.images[0].classifiers[0]
          return [
            `classifier_id: ${classifier.classifier_id}`,
          ].concat(classifier.classes.map(oneClass => `${oneClass.class}: \t ${oneClass.score}` +
            (oneClass.type_hierarchy ? ` from \t ${oneClass.type_hierarchy}` : "")))
        }).reduce((acc, cur) => acc.concat(cur), [])
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
