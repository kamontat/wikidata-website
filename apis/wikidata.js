import wdk, { simplify } from 'wikidata-sdk'

export const query = async (axios, options = {}) => {
  const date = options.date || ''
  const limit = options.limit || 10
  const sort = options.sort || 'date'
  const order = options.sortOrder || 'descending'
  const language = options.language || 'en'

  const formatedDate = (date && moment(date).format('YYYY-MM-DD')) || ''

  console.log(`date=${date}(${typeof date}), limit=${limit}`)

  // SELECT ?id ?idLabel ?idDescription ?title ?date ?composerLabel WHERE {
  //   ?id (wdt:P31/wdt:P279*) wd:Q1344.
  //   OPTIONAL {
  //     ?id wdt:P1191 ?date.
  //     ?id wdt:P1476 ?title.
  //     ?id wdt:P86 ?composer.
  //   }
  //   # FILTER(""^^xsd:dateTime = ?date)
  //   SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  // }

  // ORDER BY DESC(?date)
  // LIMIT 200

  const query = `SELECT ?id ?idLabel ?idDescription ?title ?date ?composer ?composerLabel WHERE {
  ?id (wdt:P31/wdt:P279*) wd:Q1344.
  OPTIONAL {
       ?id wdt:P1191 ?date.
       ?id wdt:P1476 ?title.
       ?id wdt:P86 ?composer.
  }
  ${date ? '' : '#'} FILTER("${formatedDate}"^^xsd:dateTime = ?date)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${language}". }
}

ORDER BY ${order === 'descending' ? 'DESC' : 'ASC'}(?${sort})
LIMIT ${limit}`

  const url = wdk.sparqlQuery(query)
  const json = await axios.$get(url)

  const simplified = simplify.sparqlResults(json)
  console.log(simplified)

  // FIXME: this should sorting by query better than manually sort
  if (sort !== 'date')
    simplified.sort((a, b) => {
      const aa = order === 'descending' ? a : b
      const bb = order === 'descending' ? b : a

      if (sort === 'id')
        return (
          parseInt(aa.id.value.substring(1)) -
          parseInt(bb.id.value.substring(1))
        )
      else if (sort === 'title')
        return aa.title.toString().localeCompare(bb.title.toString())
      // else if (sort === 'date')
      //   return aa.date.toString().localeCompare(bb.date.toString())
      return 0
    })

  return {
    results: simplified,
    query: query,
    link: url.replace('sparql?format=json&query=', '#')
  }
}
