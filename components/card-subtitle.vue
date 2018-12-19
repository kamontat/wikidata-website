<template>
  <div>
    <a 
      v-if="isUrl(valueString)" 
      :href="valueString"
      target="_blank"
      class="subtitle is-size-6 has-text-link" 
    >{{ readable(valueString) }}</a>
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
          <div class="content">
            {{ valueString }}
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Array],
      default: ''
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
      return /^(https?:\/\/)/g.test(str)
    },
    readable(value) {
      if (this.isExceedLimit(this.valueString))
        return this.valueString.slice(0, 100).concat('...')
      else return this.valueString
    }
  }
}
</script>
