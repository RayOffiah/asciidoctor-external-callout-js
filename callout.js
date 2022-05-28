const asciidoctor = require('asciidoctor')()
require('./external-callout-processor')

asciidoctor.convertFile('./sample.adoc', {safe: 'safe', standalone: true, attributes: {'icons': 'font'}})

