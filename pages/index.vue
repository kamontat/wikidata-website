<template>
  <section class="container">
    <div>
      <div class="form">
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
              :key="element.id + '-' + index"
            >
              <th>{{ index + 1 }}</th>
              <th>{{ element.id }}</th>
              <td>{{ element.title }}</td>
              <td>
                <a 
                  :href="element.url" 
                  :title="element.title" 
                  target="_black">
                  {{ element.url }}
                </a>
              </td>
              <td>
                {{
                  typeof element.date === 'string'
                    ? element.date
                    : element.date.format('ddd DD MMMM YYYY')
                }}
              </td>
            </tr>
          </tbody>
        </table>
        <!-- <ol>
          <li 
            v-for="element in results" 
            :key="element.title">
            {{ element.title }}: <a :href="element.url">{{ element.url }}</a>
          </li>
        </ol> -->
      </div>
    </div>
  </section>
</template>

<script>
import wdk from 'wikidata-sdk'
import moment from 'moment'

const query = async (axios, date, _limit, _sort, _order) => {
  const limit = _limit || 100
  const sort = _sort || 'date'
  const order = _order || 'descending'

  const formatedDate = (date && moment(date).format('YYYY-MM-DD')) || ''

  console.log(`date=${date}(${typeof date}), limit=${limit}`)

  const query = `SELECT ?id ?idLabel ?date ?title WHERE {
  ?id (wdt:P31/wdt:P279*) wd:Q2018526.
  ?id wdt:P1191 ?date.
  ?id wdt:P1476 ?title.
  ${date ? '' : '#'} FILTER("${formatedDate}"^^xsd:dateTime = ?date)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}

ORDER BY ${order === 'descending' ? 'DESC' : 'ASC'}(?${sort})
LIMIT ${limit}`

  console.log(query)

  const url = wdk.sparqlQuery(query)
  const json = await axios.$get(url)
  const results = json.results.bindings.map(element => {
    // console.log(element)

    const head = element.title.value
      ? element.title.value
      : element.idLabel.value
    const url = element.id.value
    const id = url.replace('http://www.wikidata.org/entity/', '')
    const date = moment(element.date.value)

    return {
      title: head,
      url,
      id,
      date: !date.isValid()
        ? element.date.value.substring(1).replace(/-(.)+/g, ' BCE')
        : date
    }
  })

  // FIXME: this should sorting by query better than manually sort
  if (sort !== 'date')
    results.sort((a, b) => {
      if (order === 'descending')
        return b[sort].toString().localeCompare(a[sort].toString())
      else return a[sort].toString().localeCompare(b[sort].toString())
    })

  return {
    results
  }
}

import DatePicker from 'vue2-datepicker'
import Multiselect from 'vue-multiselect'

export default {
  components: {
    DatePicker,
    Multiselect
  },
  data() {
    return {
      date: '',
      limit: '100',
      limitOptions: ['10', '20', '50', '100', '200', '400', '800', '1000'],
      sort: 'date',
      sortOptions: ['date', 'id', 'title'],
      sortOrder: 'descending',
      sortOrderOptions: ['ascending', 'descending'],
      isLoading: false,
      columns: ['Index', 'ID', 'Title', 'Link', 'Date']
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
      const res = await query(
        this.$axios,
        this.date,
        this.limit,
        this.sort,
        this.sortOrder
      )
      this.isLoading = false
      this.results = res.results
    }
  },
  async asyncData({ $axios }) {
    const results = await query($axios)
    return results
  }
}
</script>

<style>
.container {
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
