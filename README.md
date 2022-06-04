# External callouts for Asciidoctor

## Description

An [Asciidoc](https://asciidoctor.org/) extension which adds support for callout tags added outside the listing block.

## Motivation

Aside from getting little practice around  Ruby and JavaScript, I decided to have a crack at this to help with a problem that comes up at work every so often.

The [callout mechanism](https://docs.asciidoctor.org/asciidoc/latest/verbatim/callouts/) for Asciidoc works extremely well in 99% of the cases I run into:

```asciidoc
[source,ruby]
----
require 'sinatra' #<1>

get '/hi' do #<2> #<3>
  "Hello World!"
end
----
<1> Library import
<2> URL mapping
<3> Response block
```

Great, but it does mean you have to add commented to the tags to the source code to register the callout in the following block. As I've said, this is fine, 99% of the time, but I've run across a few occasions when adding tags to the source code (either in-line or an included file) can be a little problematic:

. Restricted access to the source code: as a humble tech-writer, you might not have access to the included source code to add your own tags.
. The source code has to remain runnable, but doesn't have a commenting mechanism that works well with Asciidoc (shell scripts spring to mind.)

## A possible Solution
And that's where this extension comes in: it adds support adding tags outside the source listing block, like this:


```asciidoc
[source,ruby]
----
require 'sinatra'

get '/hi' do
  "Hello World!"
end
----
. Library import @3
. URL mapping @5
. Response block @5
```

Rather than tagging the code, you add a location token at the end of a list item, which will then add the tag at the specified line number. Run the source text through Asciidoctor{plus}extension, and it'll spit the same source block complete with callouts.

Two types callouts are supported:

**@nn** – This format takes a numeric value indicating the line in the source block where the callout should appear. The callouts will appear at the end of the line. Multiple callouts on the same line will have a single space between tham.

**@/text/** – The text between the two slashes will be used in a regex search. A callout will be placed at the end of the first matching line.
If you have a large listing then it may be preferable to use the text search rather than counting all the lines. It may also be preferable to use a smaller listing, as a long listing might mean that your description is a bit too general.

You can have multiple callouts on the same line.
You can also mix and match numeric and text callout tokens on the same list item. (Though I'm not sure why you would).

## Installation

### Node module

You can include the extension as part of a Node project by running the `npm install`command.

`npm install asciidoctor-external-callout`

To call it as part of an Asciidoctor conversion, then register the module then register before calling a `convert` function:

```javascript
const asciidoctor = require('@asciidoctor/core')()
const registry = asciidoctor.Extensions.create()
require('asciidoctor-external-callout')(registry)

asciidoctor.convertFile('./sample.adoc', {safe: 'safe', standalone: true, extension_registry: registry})
```

### Antora

Install the callout extension as part of the Antora installation. The Node setup is usually the same directory from where you run the `antora` script.

`npm install asciidoctor-external-callout`

You will also need to register the extension in the playbook used to generate the site:

```yaml
  extensions:
    - asciidoctor-external-callout

```


