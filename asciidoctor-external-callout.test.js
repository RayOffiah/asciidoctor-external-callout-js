const asciidoctor = require('@asciidoctor/core')()
const registry = asciidoctor.Extensions.create()
require('./asciidoctor-external-callout.js')(registry)


require('./asciidoctor-external-callout')

test('Load basic file', () => {

    let input_document = ` 
:source-highlighter: highlight.js
:icons: font

[source, shell]
----
#!/bin/bash

# example of using arguments to a script
echo "My first name is $1"
echo "My surname is $2"
echo "Total number of arguments is $#"
----
. Echo the surname @5
. Explain the total number of arguments   @/number of .+/
`
    let converted_doc = asciidoctor.convert(input_document,{safe: 'safe', standalone: true, extension_registry: registry})
    expect(converted_doc.length).toBeGreaterThan(0)
    expect(converted_doc.includes('My first name is $1')).toBeTruthy()
    expect(converted_doc.includes('Echo the surname @5')).toBeFalsy()
    expect(converted_doc.includes('My surname is $2" <i class="conum" data-value="1">')).toBeTruthy()
    expect(converted_doc.includes('Total number of arguments is $#" <i class="conum" data-value="2">'))

})
