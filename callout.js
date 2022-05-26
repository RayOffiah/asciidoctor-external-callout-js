const asciidoctor = require('asciidoctor')()
require('./external-callout-processor')

doc = asciidoctor.convertFile('./sample.adoc', {safe: 'safe', standalone: true})
console.log(doc.getAttributes())
