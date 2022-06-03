const asciidoctor = require('asciidoctor')()
require('./asciidoctor-external-callout')

asciidoctor.convertFile('./sample.adoc', {safe: 'safe', standalone: true})

