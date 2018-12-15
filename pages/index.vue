<template>
  <section class="container">

    <article class="message is-link">
      <div class="message-header">
        <p>Query (<a :href="queryLink">link</a>)</p>
        <button 
          @click="showQuery=!showQuery" 
          class="delete" 
          aria-label="delete"/>
      </div>
      <div 
        class="message-body is-paddingless is-marginless" 
        :class="showQuery ? '' : 'is-hidden' ">
        <pre style="background-color: transparent;">{{ query }}</pre>
      </div>
    </article>
    
    <div>
      <div class="form">
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label"> Language </label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control select is-fullwidth">
                <Multiselect
                  v-model="language"
                  :options="languageOptions"
                  :preserve-search="true"
                  placeholder="Language option"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label"> Date </label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control">
                <DatePicker
                  v-model="date"
                  :first-day-of-week="1"
                  class="date-picker"
                  lang="en"
                />
              </p>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label"> Limit </label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control select is-fullwidth">
                <Multiselect
                  v-model="limit"
                  :options="limitOptions"
                  :preserve-search="true"
                  placeholder="Limitation size"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label"> Sort by </label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control select is-fullwidth">
                <Multiselect
                  v-model="sort"
                  :options="sortOptions"
                  :preserve-search="true"
                  placeholder="Sorting by"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label"> Sort order </label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control select is-fullwidth">
                <Multiselect
                  v-model="sortOrder"
                  :options="sortOrderOptions"
                  :preserve-search="true"
                  placeholder="Sorting order"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label"><!-- Left empty for spacing --></div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <button
                  :class="isLoading ? 'is-loading' : ''"
                  class="button is-primary search"
                  @click="search"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="display">
        <h5>Size: {{ length }}</h5>

        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th 
                v-for="col in columns" 
                :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
              <th 
                v-for="col in columns" 
                :key="col">{{ col }}</th>
            </tr>
          </tfoot>
          <tbody>
            <tr
              v-for="(element, index) in results"
              :key="element.id.value + '-' + index"
            >
              <th>{{ index + 1 }}</th>
              <th><a 
                :href="getLink(element.id)" 
                target="_blank">
                {{ element.id.value }}
              </a></th>
              <td style="width: 15%">{{ getTitle(element) }}</td>
              <td style="width: 15%">{{ element.id.description }}</td>
              <td>
                {{
                  getDate(element.date)
                }}
              </td>
              <td>{{ element.composer && element.composer.label || "" }} (<a 
                :href="getLink(element.composer)"
                target="_blank">{{ element.composer && element.composer.value }}</a>)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script>
import wdk, { simplify } from 'wikidata-sdk'
import moment from 'moment'

import DatePicker from 'vue2-datepicker'
import Multiselect from 'vue-multiselect'

import { query as dataQuery } from '../apis/wikidata.js'

export default {
  components: {
    DatePicker,
    Multiselect
  },
  data() {
    return {
      date: '',
      limitOptions: [
        '5',
        '10',
        '20',
        '30',
        '50',
        '100',
        '200',
        '500',
        '1000',
        '3000',
        '5000'
      ],
      sortOptions: ['date', 'id', 'title'],
      sortOrderOptions: ['ascending', 'descending'],
      languageOptions: ['en', 'fr', 'de'],
      isLoading: false,
      showQuery: true,
      columns: ['Index', 'ID', 'Title', 'Description', 'Date', 'Composer']
    }
  },
  computed: {
    length() {
      return (this.results && this.results.length) || 0
    }
  },
  methods: {
    async search() {
      this.isLoading = true
      const res = await dataQuery(this.$axios, this)
      this.isLoading = false
      this.results = res.results
      this.query = res.query
      this.queryLink = res.link
    },
    getLink(id) {
      if (!id || !id.value) return ''
      return wdk.getSitelinkUrl({ site: 'wikidata', title: id.value })
    },
    getDate(_date) {
      const date = moment(_date)
      return !date.isValid()
        ? _date.substring(1).replace(/-(.)+/g, ' BCE')
        : date.format('ddd DD MMMM YYYY')
    },
    getTitle(element) {
      // label exist
      if (element.id.label.match(/^Q\d+/g) === null && element.title)
        return `${element.id.label} (${element.title})`
      else if (element.title) return element.title
      else return element.id.label
    }
  },
  async asyncData({ $axios, query }) {
    const opts = {
      limit: query.limit || '10',
      language: query.language || query.lang || 'en',
      sort: query.sort || 'date',
      sortOrder: query.order || 'descending'
    }

    const results = await dataQuery($axios, opts)
    opts.results = results.results
    opts.query = results.query
    opts.queryLink = results.link
    return opts
  }
}
</script>

<style>
.container {
  margin-top: 20px;
  min-height: 100vh;
  display: block;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.form {
  margin-top: 50px;
}

.links {
  padding-top: 15px;
}

.date-picker {
  display: block;
  width: 100%;
}

.search {
  margin-top: 10px;
  margin-bottom: 20px;
}

.multiselect__select::before {
  content: none !important;
}

.select:not(.is-multiple):not(.is-loading)::after {
  z-index: 0;
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css">
</style>
