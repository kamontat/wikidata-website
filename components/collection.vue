<template>
  <section 
    v-if="filterArray && filterArray.length > 0" 
    class="section">

    <wd-title :name="title"/>

    <div class="columns is-multiline">
      <div 
        v-for="value in filterArray"
        :key="value" 
        class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-third-widescreen is-one-quarter-fullhd">
        <div 
          class="box" 
          style="height: 100%;">
          <h1 class="title is-size-5">{{ makeReadable(value) }}</h1>
          <wd-subtitle 
            :lang="lang"
            :title="makeReadable(value)"
            :value="filterObject[value]"/>
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
    },
    lang: {
      type: String,
      default: 'en'
    },
    searchBy: {
      type: String,
      default: ''
    }
  },
  computed: {
    generateID() {
      return this.name.toLowerCase()
    },
    filterObject() {
      return this.object
    },
    filterArray() {
      return this.array.filter(key => {
        const value = this.filterObject[key]
        const condition1 = key
          .toLowerCase()
          .includes(this.searchBy.toLowerCase())

        let condition2 = false
        if (typeof value === 'string')
          condition2 = value.toLowerCase().includes(this.searchBy.toLowerCase())

        let condition3 = false
        if (Array.isArray(value))
          condition3 = value.some(v =>
            v.toLowerCase().includes(this.searchBy.toLowerCase())
          )

        return condition1 || condition2 || condition3
      })
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
