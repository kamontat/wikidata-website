<template>
  <div v-if="error">
    <wd-error 
      :error="error" 
      :reason="reason" />
  </div>
  <div v-else >
    <nav 
      class="level navbar is-fixed-top" 
      style="padding-top: 1.5rem; padding-bottom: 1.5rem; padding-left: 1rem; padding-right: 1rem;">
      <div 
        v-if="result.properties.logoImage" 
        class="navbar-brand">
        <a 
          v-for="img in result.properties.logoImage" 
          :key="img"
          class="navbar-item" 
          :href="img" 
          target="_blank">
          <img 
            class="image"
            height="32"
            :src="img" >
        </a>
      </div>

      <div class="navbar-menu">
        <div class="navbar-start">
          <p class="navbar-item">
            <strong>Wikidata</strong> display
            <!-- <a 
                target="_blank" 
                :href="'http://wikidata.org/wiki/'+result.id"><span class="tag is-info">{{ result.labels[language] }}</span></a> -->
          </p>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <b-autocomplete
              v-model="lang"
              placeholder="en"
              :open-on-focus="true"
              :data="filterLanguage"
              @input="inputMethod"/>
          </div>
          <div class="navbar-item">
            <b-dropdown 
              hoverable 
              position="is-bottom-left">
              <a 
                class="navbar-item" 
                slot="trigger">
                <span>Actions</span>
                <b-icon icon="menu-down"/>
              </a>

              <b-dropdown-item 
                custom 
                paddingless>
                <form action="">
                  <div 
                    class="modal-card" 
                    style="width:300px;">
                    <section class="modal-card-body">
                      <b-field label="Search">
                        <input 
                          class="input" 
                          placeholder="search in page" 
                          v-model="searchQuery">
                      </b-field>

                      <b-field label="Query">
                        <input 
                          class="input" 
                          placeholder="query something" 
                          v-model="query"
                          @keyup.enter="queryProcess" >
                      </b-field>
                    </section>
                  </div>
                </form>
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              More
            </a>

            <div class="navbar-dropdown is-right">
              <a 
                :href="'http://wikidata.org/wiki/'+result.id"
                target="_blank" 
                class="navbar-item">
                Wikidata
              </a>
              <hr class="navbar-divider">
              <a 
                href="/table" 
                class="navbar-item">
                Table page
              </a>
              <hr class="navbar-divider">
              <a 
                href="https://github.com/kamontat"
                target="_blank" 
                class="navbar-item">
                Developer
              </a>
              <a 
                href="https://github.com/kamontat/Wikidata-website"
                target="_blank" 
                class="navbar-item">
                Repository
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <div
      class="container is-fluid" 
      style="margin-top: 4rem">
      <div 
        id="image"
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

      <div 
        id="other-image"
        class="columns is-multiline" 
        v-if="result.properties.images">
        <div 
          class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd"
          style="min-width: 20%;"
          v-for="(img, key) in result.properties.images" 
          :key="img">
          <div>
            <label>{{ makeReadable(key) }}</label>
          </div>
          <div class="columns is-multiline">
            <div
              class="column is-half-mobile is-half-tablet is-one-third-desktop is-one-third-widescreen is-one-third-fullhd"
              v-for="i in img"
              :key="i">
              <figure class="image">
                <a 
                  :href="i" 
                  target="_blank">
                  <img 
                  :src="i" >
                </a>
              </figure>
            </div>
          </div>
          
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
        :search-by="searchQuery"
        :lang="language"
        title="Name"
        :array="names" 
        :object="result.properties.name"/>

      <wd-collection 
        :search-by="searchQuery"
        :lang="language"
        title="Member"
        :array="members" 
        :object="result.properties.member"/>

      <wd-collection 
        :search-by="searchQuery"
        :lang="language"
        title="Date"
        :array="dates" 
        :object="result.properties.date"/>

      <wd-collection 
        :search-by="searchQuery"
        :lang="language"
        title="Location"
        :array="locations" 
        :object="result.properties.location"/>

      <wd-collection 
        :search-by="searchQuery"
        :lang="language"
        title="Language"
        :array="languagesProperty" 
        :object="result.properties.language"/>

      <wd-collection 
        :search-by="searchQuery"
        :lang="language"
        title="Music"
        :array="musics" 
        :object="result.properties.music"/>

      <wd-collection 
        :search-by="searchQuery"
        :lang="language"
        title="Others"
        :array="others" 
        :object="result.properties"/>

      <wd-collection 
        :search-by="searchQuery"
        :lang="language"
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
  </div>
</template>

<script>
import lowercase from 'lodash.lowercase'

import { WikidataBuilder } from '../models/wikidataBuilder'

import Collection from '../components/collection.vue'
import ErrorComponent from '../components/error.vue'

export default {
  components: { 'wd-collection': Collection, 'wd-error': ErrorComponent },
  head: {
    bodyAttrs: {
      class: 'has-navbar-fixed-top'
    }
  },
  data() {
    return {
      lang: '',
      language: 'en',
      query: '',
      searchQuery: ''
    }
  },
  computed: {
    languages() {
      return Object.keys(this.result.labels)
    },
    filterLanguage() {
      return this.languages.filter(lang => lang.includes(this.lang))
    },
    images() {
      if (!this.result.properties.images) return []
      return Object.keys(this.result.properties.images)
    },
    names() {
      if (!this.result.properties.name) return []
      return Object.keys(this.result.properties.name)
    },
    members() {
      if (!this.result.properties.member) return []
      return Object.keys(this.result.properties.member)
    },
    dates() {
      if (!this.result.properties.date) return []
      return Object.keys(this.result.properties.date)
    },
    locations() {
      if (!this.result.properties.location) return []
      return Object.keys(this.result.properties.location)
    },
    musics() {
      if (!this.result.properties.music) return []
      return Object.keys(this.result.properties.music)
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
          v !== 'member' &&
          v !== 'language' &&
          v !== 'image' &&
          v !== 'images' &&
          v !== 'music'
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
    makeReadable(value) {
      const lower = lowercase(value)
      return lower.charAt(0).toUpperCase() + lower.slice(1)
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
