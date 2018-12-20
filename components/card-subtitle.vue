<template>
  <div>
    <a 
      v-if="isUrl(value)" 
      :href="value"
      target="_blank"
      class="subtitle is-size-6 has-text-link" 
    >{{ readable(value) }}</a>
    <h2 
      class="subtitle is-size-6"
      v-else>{{ readable(valueString) }}
      <span v-if="isExceedLimit(valueString)">
        <a @click="modal=true">[see more]</a>
    </span></h2>

    <b-modal 
    :active.sync="modal" >
      <div class="card">
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title">{{ title }}</p>
            </div>
          </div>
          <div 
            class="content" 
            v-html="formatize(value)"/>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Array],
      default: ''
    },
    lang: {
      type: String,
      default: 'en'
    }
  },
  data() {
    return { modal: false }
  },
  computed: {
    valueString() {
      return Array.isArray(this.value)
        ? this.value.join(', ')
        : this.value.toString()
    }
  },
  methods: {
    isExceedLimit(str) {
      return str.length > 100
    },
    isUrl(str) {
      if (typeof str === 'string') return /^(https?:\/\/)/g.test(str)
      return false
    },
    readable(value) {
      if (this.isExceedLimit(this.valueString))
        return this.valueString.slice(0, 100).concat('...')
      else return this.valueString
    },
    formatize(value) {
      if (typeof value === 'string') {
        return `<p>${this._formatize(value).toString()}</p>`
      } else if (Array.isArray(value))
        return `<ol>${value
          .map(v => `<li>${this._formatize(v)}</li>`)
          .join('')}</ol>`
    },
    _formatize(value) {
      if (typeof value !== 'string') return value
      else {
        // is url
        if (this.isUrl(value))
          return `<a target="_blank" href="${value}">${value}</a>`
        // is date
        moment.locale(this.lang)
        const date = moment(value)
        if (date.isValid()) return date.format('dddd MMMM DD, YYYY')
        else return value
      }
    }
  }
}
</script>
