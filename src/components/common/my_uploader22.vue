<template>
  <div class="uploader_containner">
    <input style="display:none" @change="addFile" :multiple="false" type="file" id="my-upload" ref="file_input"/>
    <img :src="img_url" class="upload_img" @click="chooseFile"/>
    <span v-if="file.type && !(file.type.match(/image/))">{{file.name}}</span>
  </div>
</template>
<script>
import imgDefault from "@/assets/upload.png"
export default {
 name: 'MyUploader',
 data (){
   return {
    file: {}
   }
 },
 props: {
   onChange: Function
 },
 computed: {
   img_url(){
     return this.file.type && this.file.type.match(/image/) ? this.file.url : imgDefault
   }
 },
 methods: {
   chooseFile (){
     this.$refs.file_input.click()
   },
   addFile({target: {files}}){
     for(let i = 0, l = files.length; i < l; i++){
       files[i].url = URL.createObjectURL(files[i]);
     }
     this.file = files[0] || {}
     this.onChange(files[0] || {});
   }
  }
}
</script>
<style>
  .uploader_containner{
    display: inline-block;
  }
  .uploader_containner > .upload_img{
    padding-left: 3rem;
    width:5rem;
    height:5rem;
  }
</style>
