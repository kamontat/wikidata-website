<template>
  <h1 
    class="title is-4 is-spaced anchor-title" 
    :id="generateID">
    <span class="anchor-name">{{ name }}</span>
    <a
      class="anchor-link" 
      :href="'#'+generateID">#</a>
  </h1>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  computed: {
    generateID() {
      return this.name.toLowerCase()
    }
  }
}
</script>


<style>
.anchor-title {
  padding-top: 1.5rem;
  position: relative;
}

.anchor-link {
  position: absolute;
  top: 1.5rem;
  right: calc(100% + 1rem);
}

.anchor-name {
  font: 1.5rem;
}
</style>
