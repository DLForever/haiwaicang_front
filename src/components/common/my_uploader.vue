<template>
  <div class="uploader_containner">
    <input style="display:none" @change="addFile" :multiple="false" type="file" id="my-upload" ref="file_input"/>
    <div class="show_img_contaier">
      <img :src="img_url" class="upload_img" @click="chooseFile"/>
      <img src="@/assets/close.png" class="close above_img" @click="removeFile" v-if="this.file.type && this.file.type.match(/image/)">
      <span  v-if="file.type && !(file.type.match(/image/))"><a :href="file.url" target="_blank">{{file.name}}</a><img src="@/assets/close.png" class="close" @click="removeFile"></span>
    </div>
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
   onChange: Function,
   defaultImg: String
 },
 computed: {
   img_url(){
     return this.file.type && this.file.type.match(/image/) ? this.file.url : (this.defaultImg || imgDefault)
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
     console.log(this.file)
     this.onChange(files[0] || {});
   },
   removeFile(){
     this.$refs.file_input.value = ""
     this.file = {}
     this.onChange(undefined)
   }
  }
}
</script>
<style>
  .uploader_containner{
    display: inline-block;
  }
  .uploader_containner  .upload_img{
    padding-left: 3rem;
    width:5rem;
    height:5rem;
  }
  .uploader_containner .close{
    width: 1rem;
    height: 1rem;
  }
  .uploader_containner .show_img_contaier{
    position: relative;
  }
  .uploader_containner .above_img{
    position: absolute;
    right: 0;
    top: .1rem;
  }
</style>
