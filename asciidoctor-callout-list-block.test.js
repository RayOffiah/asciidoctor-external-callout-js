const asciidoctor = require('@asciidoctor/core')()
const registry = asciidoctor.Extensions.create()
require('./asciidoctor-callout-list-block')(registry)


require('./asciidoctor-callout-list-block')

test('Load basic file', () => {

    let input_document = ` 
:source-highlighter: highlight.js
:icons: font

[calloutlist]
. This is the first line.
. This is the second line.
`
    let converted_doc = asciidoctor.convert(input_document,{safe: 'safe', standalone: true,
        extension_registry: registry})

    expect(converted_doc.length).toBeGreaterThan(0)
    expect(converted_doc.includes('<i class="conum" data-value="1">')).toBeTruthy()
    expect(converted_doc.includes('<i class="conum" data-value="2">')).toBeTruthy()

})
