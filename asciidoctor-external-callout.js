const asciidoctor = require('@asciidoctor/core')()

asciidoctor.Extensions.register(function () {

    this.treeProcessor(function () {

        const self = this

        const LOCATION_TOKEN_RX = /(@\d+|@\/[^\/]+?\/)/
        const LOCATION_TOKEN_ARRAY_RX = /^(@\d+|@\/[^\/]+?\/)((\s+@\d+)|(\s+@\/[^\/]+?\/))*$/

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

        /**
         * Make sure that this list is in the correct format
         * We don't process it otherwise.
         * @param list
         */
        function is_external_callout_list(list) {

            return list.getBlocks().every((x) => {

                let item_under_test = x.getText()
                let location_token_index = item_under_test.search(LOCATION_TOKEN_RX)

                // if we don't find the start of the list of location tokens, or the token is the first item
                // then we don't need to carry on any further; this is not the list we are looking for.

                if (location_token_index < 1) {
                    return false
                }

                let location_tokens = item_under_test.substring(location_token_index).trim()
                return location_tokens.match(LOCATION_TOKEN_ARRAY_RX) && x.getBlocks().length === 0
            })

        }

        function process_callouts(list, owner_block) {

            list.getBlocks().forEach((list_item) => {

                let item = list_item.getText()

                let location_token_index = item.search(LOCATION_TOKEN_RX)

                // Just the locations tokens at the end of the item.
                let location_tokens = item.substring(location_token_index).trim()

                // The text of the item itself
                let phrase = item.substring(0, location_token_index -1).trim()

                let locations = location_tokens.split(/\s+@/)

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
            return this.match(/^\d+$/)
        }
    })

})
