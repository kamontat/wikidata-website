<template>
  <section 
    v-if="array && array.length > 0" 
    class="section">

    <wd-title :name="title"/>

    <div class="columns is-multiline">
      <div 
        v-for="value in array"
        :key="value" 
        class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-third-widescreen is-one-quarter-fullhd">
        <div 
          class="box" 
          style="height: 100%;">
          <h1 class="title is-size-5">{{ makeReadable(value) }}</h1>
          <wd-subtitle 
            :title="makeReadable(value)"
            :value="object[value]"/>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import lowercase from 'lodash.lowercase'

import Title from './title.vue'
import CardSubtitle from './card-subtitle.vue'

export default {
  components: { 'wd-title': Title, 'wd-subtitle': CardSubtitle },
  props: {
    title: {
      type: String,
      default: ''
    },
    array: {
      type: Array,
      default: () => []
    },
    object: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    generateID() {
      return this.name.toLowerCase()
    }
  },
  methods: {
    makeReadable(value) {
      const lower = lowercase(value)
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    }
  }
}
</script>
