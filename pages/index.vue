<template>
  <section class="container">
    <div>
      <ul>
        <li 
          v-for="element in results" 
          :key="element.title">
          {{ element.title }}: <a :href="element.url">{{ element.url }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import wdk from 'wikidata-sdk'
// import Logo from '~/components/Logo.vue'

export default {
  async asyncData({ $axios }) {
    const date = '2015-11-04'
    const limit = 50

    const query = `SELECT ?id ?idLabel ?date ?title WHERE {
  ?id (wdt:P31/wdt:P279*) wd:Q2018526.
  ?id wdt:P1191 ?date.
  ?id wdt:P1476 ?title.
  # FILTER(YEAR(?date) = 2015)
  # FILTER("${date}"^^xsd:dateTime = ?date)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}

ORDER BY DESC(?date)
LIMIT ${limit}`

    const url = wdk.sparqlQuery(query)

    const json = await $axios.$get(url)
    const results = json.results.bindings.map(element => {
      const head = element.title.value
        ? element.title.value
        : element.idLabel.value

      return {
        title: head,
        url: element.id.value
      }
    })

    return { results }
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
</style>
