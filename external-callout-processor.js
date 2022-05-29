const asciidoctor = require('@asciidoctor/core')()

asciidoctor.Extensions.register(function () {

    this.treeProcessor(function () {

        const self = this

        const CALLOUT_ITEM_ARRAY_RX = /.+\s+@\d+|@\/.+\/\s+@\d+|@\/.+\/*/

        self.process(function (document) {

            document.findBy({'context': 'olist'}, function (list) {

                if (is_external_callout_list(list)) {

                    try {

                        let owner_block = owning_block(list)

                        if (!owner_block.getSubstitutions().includes("callouts")) {
                            owner_block.getSubstitutions().push("callouts")
                        }

                        process_callouts(list, owner_block)
                        list.context = list.node_name ='colist'

                    }
                    catch (e) {
                        console.error(e)
                    }
                }
            })


            return document
        })

        function process_callouts(list, owner_block) {

            list.getBlocks().forEach((list_item) => {

                let item = list_item.getText()

                let locations = item.split(/\s+@/)

                // The first item in this array is our phrase. Hang on to it; you can use it later.
                let phrase = locations[0]

                let line_numbers = new Set()

                locations.slice((locations.length - 1) * -1).forEach(location => {

                    if (location.is_digits()) {

                        let number = parseInt(location)

                        if (number <= owner_block.getSourceLines().length)
                        {
                            line_numbers.add(number - 1)
                        }
                        else {
                            console.log(`Line number too large ==> ${number}`)
                        }

                    }
                    else {
                        //We must be dealing with a string matcher
                        let number = find_matching_lines(location, owner_block)

                        if (number > -1) {
                            line_numbers.add(number)
                        }
                        else {
                            console.log(`Phrase not found ==> ${location}`)
                        }
                    }

                })

                //Now add each callout to the listing

                line_numbers.forEach(line_number => {

                    let callout = find_list_index_for_item(list_item)

                    owner_block.getSourceLines()[line_number] += ` <${callout}>`
                })

                list_item.setText(phrase)

            })
        }

        /**
         * Make sure that this list is in the correct format
         * We don't process it otherwise.
         * @param list
         */
        function is_external_callout_list(list) {
            return list.getBlocks().every((item) => item.text.match(CALLOUT_ITEM_ARRAY_RX)
                && item.getBlocks().length === 0)

        }

        function owning_block(list) {

            let block_above = list.getParent()

            if (block_above === undefined) {
                throw "There is no block above the callout list"
            }

            let index_of_this_item = block_above.getBlocks().findIndex((block) => block === list)

            if (block_above.getBlocks()[index_of_this_item - 1].getContext() !== 'listing') {
                throw "Callout list: the attached block is not a source listing"
            }

            return block_above.getBlocks()[index_of_this_item - 1]
        }

        function find_list_index_for_item(list_item) {

            let list = list_item.getParent()

            let index_of_this_item = list.getBlocks().findIndex((item) => item === list_item)
            return index_of_this_item + 1
        }

        function find_matching_lines(search_string, owner_block) {

            // Take the slashes of the search string
            let phrase = search_string.substring(1, search_string.length - 1)

            return owner_block.getSourceLines().findIndex(line => {
                return line.match(new RegExp(phrase))
            })
        }

        String.prototype.is_digits = function() {
            return this.match(/\d+/)
        }
    })

})
