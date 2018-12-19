import wdk, { simplify } from 'wikidata-sdk'

import { transform } from '../apis/wikidata'

export class WikidataBuilder {
  static ListAllProperty(axios, entity) {
    const query = `SELECT ?id ?propertyLabel ?entityLabel {
      VALUES ?id { wd:${entity} }
      ?id ?p ?statement .
      ?statement ?ps ?entity .

      ?property wikibase:claim ?p.
      ?property wikibase:statementProperty ?ps.

      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    }

    ORDER BY ?property ?statement ?entity`

    const propertyUrl = wdk.sparqlQuery(query)
    const titleUrl = wdk.getEntities(entity)

    return Promise.all([axios.$get(propertyUrl), axios.$get(titleUrl)]).then(
      results => {
        const propertyResult = results[0]
        const _titleResult = results[1]
        const titleResult = simplify.entities(_titleResult.entities)[entity]
        return {
          id: entity,
          labels: titleResult.labels,
          descriptions: titleResult.descriptions,
          aliases: titleResult.aliases,
          properties: transform.propertyList(
            simplify.sparqlResults(propertyResult)
          )
        }
      }
    )
  }

  static Select(axios, property, entity, opts) {
    const options = Object.assign(
      {
        limit: 100
      },
      opts
    )
    const query = `SELECT ?item ?itemLabel ?date WHERE {
  ?item wdt:${property} wd:${entity}.
  OPTIONAL {
    ?item wdt:P577 ?date.
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT ${options.limit}`

    console.log(query)
    const url = wdk.sparqlQuery(query)

    return axios.$get(url).then(simplify.sparqlResults)
  }

  static SearchEntity(axios, name) {
    const url = wdk.searchEntities(name, 'en', 1)
    return axios.$get(url).then(v => {
      if (v.success === 1) {
        if (v.search && v.search.length > 0) return v.search[0].id
      }
      return ''
    })
  }
}
