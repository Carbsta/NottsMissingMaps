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
           <div>{{this.fileSize}}</div>
         </div>
       </v-card-title>


       <v-card-actions>
         <v-spacer />
         <v-btn flat color="primary" v-on:click="dismiss()" :disabled="uploading">
           dismiss
         </v-btn>
       </v-card-actions>
     </v-card>
   </v-flex>
 </v-layout>
</template>

<script>
export default {
  name: 'PreviewCard',
  props: {
    img: Object,
    imgs: Array,
    uploading: Boolean
  },

  methods:{
    dismiss: function() {
      for (let i = 0; i < this.imgs.length; i++) {
        if (this.imgs[i].file === this.img.file) {
          this.imgs.splice(i, 1)
        }
      }
    },
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
