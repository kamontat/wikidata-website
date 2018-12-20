import wdk, { simplify } from 'wikidata-sdk'
import moment from 'moment'
import camalCase from 'lodash.camelcase'

export class transform {
  static propertyList(data, _group, opts = { convert: true }) {
    const group = Object.assign(
      {
        id: /[ -]id[ ]?/gi,
        name: /(name|title|label)/gi,
        images: /^(?!logo).*[^^]image.*/gi,
        member: /(producer|member|designer|creator|developer|director|composer|editor|writer)/gi,
        date: /date/gi,
        location: /(location|coordinates|coordinate|geo|point|locator|country)/gi,
        music: /(album|sound|music)/gi,
        language: /(language)/gi
      },
      _group
    )

    const json = { id: { wikidataId: data[0].id } }
    return data.reduce((p, c) => {
      // console.log(c.propertyLabel)
      const matches = Object.keys(group).filter(_key =>
        group[_key].test(c.propertyLabel)
      )
      const _key = matches && matches.length > 0 ? matches[0] : undefined

      let key = opts.convert ? camalCase(c.propertyLabel) : c.propertyLabel
      let subkey = ''

      if (_key && c.propertyLabel.toLowerCase().match(group[_key])) {
        subkey = key
        key = _key
      }

      if (subkey) {
        if (!p[key]) {
          // no key before
          const _json = {}
          _json[subkey] = [c.entityLabel]
          p[key] = _json
        } else if (!p[key][subkey]) {
          const _json = p[key]
          _json[subkey] = [c.entityLabel]
          p[key] = _json
        } else if (Array.isArray(p[key][subkey])) {
          p[key][subkey].push(c.entityLabel)
        }
      } else {
        // is array, append it
        if (Array.isArray(p[key])) {
          p[key].push(c.entityLabel)
          // is exist, convert to array
        } else {
          p[key] = [c.entityLabel]
        }
      }
      // })

      return p
    }, json)
  }
}

export const query = async (axios, options = {}) => {
  const date = options.date || ''
  const composer = options.composer || ''
  const limit = options.limit || 10
  const sort = options.sort || 'none'
  const order = options.sortOrder || 'descending'
  const language = options.language || 'en'

  const formatedDate = (date && moment(date).format('YYYY-MM-DD')) || ''

  const query = `SELECT ?id ?idLabel ?idDescription ?title ?date ?composer ?composerLabel WHERE {
  ?id (wdt:P31/wdt:P279*) wd:Q1344.
  OPTIONAL {
       ?id wdt:P1191 ?date.
       ?id wdt:P1476 ?title.
       ?id wdt:P86 ?composer.
       ?id rdfs:label ?idLabel.
       ?composer rdfs:label ?composerLabel.
  }

  FILTER(LANG(?idLabel) = "${language}").
  FILTER(LANG(?composerLabel) = "${language}").
  ${date ? '' : '# '}FILTER("${formatedDate}"^^xsd:dateTime = ?date)
  ${
    composer ? '' : '# '
  }FILTER(CONTAINS(LCASE(?composerLabel), "${composer.toLowerCase()}"@${language}))
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${language}". }
}

${sort === 'none' ? '# ' : ''}ORDER BY ${
    order === 'descending' ? 'DESC' : 'ASC'
  }(?${sort})
LIMIT ${limit}`

  console.log(`built query`)
  console.log(query)

  const url = wdk.sparqlQuery(query)
  console.log(`built url`)
  const json = await axios.$get(url)
  console.log(`received json`)
  const simplified = simplify.sparqlResults(json)
  console.log(`simplified results`)

  // FIXME: this should sorting by query better than manually sort
  if (sort !== 'date' && sort !== 'none')
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
