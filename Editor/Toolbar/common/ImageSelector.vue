<template>
    <div>
      <input v-model="localTerm" @input="updateTerm" placeholder="Search Images" class="searchImagesInput"/>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <div v-for="image in images" :key="image.id" class="image-container">
          <img :src="logImageAndGetUrl(image)" @click="selectImage(logImageAndGetUrl(image))" />
        </div>
      </div>
    </div>
  </template>
  
<script>
  export default {
    props: {
      term: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        localTerm: this.term,
        images: [],
        loading: true,
      }
    },
    methods: {
      logImageAndGetUrl(image) {
        return image.image.source.url
      },
      fetchImages() {
        let term = 'PPT background'
        if (this.localTerm)
        {
            term = this.localTerm
        }
        this.loading = true
        const url = `http://127.0.0.1:8000/PRESENTATIONManager/AJAXServer/bgImages/?term=${encodeURIComponent(term)}`
        fetch(url, {
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        })
          .then(response => response.json())
          .then(data => {
            this.images = data.data
            this.loading = false
          })
          .catch(error => {
            console.error('Error fetching images:', error)
            this.loading = false
          })
      },
      selectImage(url) {
        this.$emit('image-selected', url)
      },
      updateTerm() {
        this.fetchImages()
      }
    },
    watch: {
      term: {
        immediate: true,
        handler(newTerm) {
          this.localTerm = newTerm
          this.fetchImages()
        }
      }
    },
    mounted() {
      this.fetchImages()
    }
  }
</script>
  
<style>
  .image-container {
    display: inline-block;
    margin: 10px;
    cursor: pointer;
  }
  .image-container img {
    width: 50px;
    height: 30px;
    object-fit: cover;
    border: 2px solid #ccc;
    border-radius: 5px;
    display: grid;
  }
  .image-container img:hover {
    border-color: #000;
  }
  input.searchImagesInput {
    margin: 10px 0px;
    width: 100%;
    border-radius: 2px;
    border: 1px solid grey;
    font-family: inherit;
    padding: 2px 5px;
    
  }
  input::placeholder {
  color: #000;
}
</style>
  