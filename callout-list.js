const asciidoctor = require('@asciidoctor/core')()
const registry = asciidoctor.Extensions.create()
require('./asciidoctor-callout-list-block')(registry)

asciidoctor.convertFile('./callout-list-sample.adoc', {safe: 'safe',
    attributes: {'stylesheet': './callout.css'},
    standalone: true,
    extension_registry: registry})

