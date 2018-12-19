<template>
  <div v-if="error">
    <wd-error 
      :error="error" 
      :reason="reason" />
  </div>
  <div 
    class="container is-fluid"
    v-else >
    <nav 
      class="level" 
      style="margin-top: 1.5rem;">
      <div class="level-left">
        <div 
          class="level-item"
          v-if="result.properties.logoImage">
          <figure 
            v-for="img in result.properties.logoImage" 
            :key="img"
            class="image is-32x32"
            style="margin-right: 4px; margin-left: 4px;">
            <a 
              :href="img" 
              target="_blank">
              <img 
              :src="img" >
            </a>
          </figure>
        </div>
        <div class="level-item has-text-centered">
          <p class="subtitle is-5">
            <strong>Wikidata</strong> display <a 
              target="_blank" 
              :href="'http://wikidata.org/wiki/'+result.id"><span class="tag is-info">{{ result.labels[language] }}</span></a>
          </p>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <p style="margin-right: 10px;">Languages: </p>
          <b-autocomplete
            v-model="lang"
            placeholder="en"
            :open-on-focus="true"
            :data="filterLanguage"
            @input="inputMethod"/>
        </div>
        <div class="level-item">
          <input 
            class="input" 
            placeholder="query something" 
            v-model="query"
            @keyup.enter="queryProcess">
        </div>
        <div class="level-item">
          <nuxt-link to="/table">Table page</nuxt-link>
        </div>
      </div>
    </nav>
    
    <div 
      class="columns is-multiline" 
      v-if="result.properties.image">
      <div 
        class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd"
        style="min-width: 20%;"
        v-for="img in result.properties.image" 
        :key="img">
        <figure class="image">
          <a 
            :href="img" 
            target="_blank">
            <img 
            :src="img" >
          </a>
        </figure>
      </div>
    </div>

    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            {{ result.labels[language] }} 
            <div class="tags is-inline-block">
              <span 
                class="tag is-rounded"
                v-for="alias in result.aliases[language]" 
                :key="alias">
                {{ alias }}
              </span>
            </div>
          </h1>
          <h2 class="subtitle">
            {{ result.descriptions[language] }}
          </h2>
        </div>
      </div>
    </section>

    <wd-collection 
      title="Name"
      :array="names" 
      :object="result.properties.name"/>

    <wd-collection 
      title="Date"
      :array="dates" 
      :object="result.properties.date"/>

    <wd-collection 
      title="Location"
      :array="locations" 
      :object="result.properties.location"/>

    <wd-collection 
      title="Language"
      :array="languagesProperty" 
      :object="result.properties.language"/>

    <wd-collection 
      title="Others"
      :array="others" 
      :object="result.properties"/>

    <wd-collection 
      title="ID"
      :array="ids" 
      :object="result.properties.id"/>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>Wikdata UI</strong> by <a href="https://kcnt.info">Kamontat Chantrachirathumrong</a>. 
          The source code is licensed <a href="http://opensource.org/licenses/mit-license.php">MIT</a>. <br>
          The website content is licensed by <a href="https://www.wikidata.org/wiki/Wikidata:Licensing">Wikidata</a>.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { WikidataBuilder } from '../models/wikidataBuilder'

import Collection from '../components/collection.vue'
import ErrorComponent from '../components/error.vue'

export default {
  components: { 'wd-collection': Collection, 'wd-error': ErrorComponent },
  data() {
    return {
      lang: '',
      language: 'en',
      query: ''
    }
  },
  computed: {
    languages() {
      return Object.keys(this.result.labels)
    },
    filterLanguage() {
      return this.languages.filter(lang => lang.includes(this.lang))
    },
    names() {
      if (!this.result.properties.name) return []
      return Object.keys(this.result.properties.name)
    },
    dates() {
      if (!this.result.properties.date) return []
      return Object.keys(this.result.properties.date)
    },
    locations() {
      if (!this.result.properties.location) return []
      return Object.keys(this.result.properties.location)
    },
    ids() {
      if (!this.result.properties.id) return []
      return Object.keys(this.result.properties.id)
    },
    languagesProperty() {
      if (!this.result.properties.language) return []
      return Object.keys(this.result.properties.language)
    },
    others() {
      const results = Object.keys(this.result.properties).filter(
        v =>
          v !== 'location' &&
          v !== 'date' &&
          v !== 'id' &&
          v !== 'name' &&
          v !== 'language'
      )
      return results
    }
  },
  methods: {
    inputMethod(value) {
      if (this.languages.findIndex(v => v === value) >= 0) {
        this.language = value
      } else {
        this.language = 'en'
      }
    },
    queryProcess() {
      console.log(this.query)

      this.$router.push({
        path: this.$router.path,
        query: {
          query: this.query
        }
      })

      this.$router.go({
        path: this.$router.path,
        query: {
          t: +new Date()
        }
      })
    }
  },
  async asyncData({ $axios, query }) {
    const name = query.query
    const id = name
      ? await WikidataBuilder.SearchEntity($axios, name)
      : undefined

    if (!id && !query.id)
      return { error: `404 Not Found`, reason: `query='${name}', id='${id}'` }

    const result = await WikidataBuilder.ListAllProperty($axios, id || query.id)
    console.log(result)
    return { result }
  }
}
</script>
