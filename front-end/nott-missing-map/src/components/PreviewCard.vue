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
    uploading: Boolean,
  },

  methods: {
    dismiss() {
      for (let i = 0; i < this.imgs.length; i += 1) {
        if (this.imgs[i].file === this.img.file) {
          this.imgs.splice(i, 1);
        }
      }
    },
  },

  computed: {
    fileSize() {
      const kb = this.img.file.size / 1024;
      return kb < 100 ? `${kb.toFixed(2)} KB` : `${(kb / 1024).toFixed(2)} MB`;
    },
    imgUrl() {
      return window.URL.createObjectURL(this.img.file);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
