const asciidoctor = require('@asciidoctor/core')()
require('./asciidoctor-external-callout')

asciidoctor.convertFile('./sample.adoc', {safe: 'safe', standalone: true})

