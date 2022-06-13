require('@asciidoctor/core')

module.exports = function (registry) {

    registry.treeProcessor(function () {

        const self = this

        const CALLOUT_SOURCE_BLOCK_ROLE = 'external-callout-block'
        const CALLOUT_ORDERED_LIST_ROLE = 'external-callout-list'

        const LOCATION_TOKEN_RX = /(@\d+|@\/[^\/]+?\/)/
        const LOCATION_TOKEN_GLOBAL_RX = /@(\d+)|@\/([^\/]+?)\//g
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
                        list.context = list.node_name = 'colist'

                        if (!list.getRoles().includes(CALLOUT_ORDERED_LIST_ROLE)) {
                            list.addRole(CALLOUT_ORDERED_LIST_ROLE)
                        }

                        if (!owner_block.getRoles().includes(CALLOUT_SOURCE_BLOCK_ROLE)) {
                            owner_block.addRole(CALLOUT_SOURCE_BLOCK_ROLE)
                        }

                    } catch (e) {
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

                let item_under_test = x.text
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

                // Don't use getText() because this returns the string
                // preformatted – just get the raw item instead.
                let item = list_item.text

                let location_token_index = item.search(LOCATION_TOKEN_RX)

                // Just the locations tokens at the end of the item.
                let location_tokens = item.substring(location_token_index).trim()

                // The text of the item itself
                let phrase = item.substring(0, location_token_index - 1).trim()

                let locations = location_tokens.scan(LOCATION_TOKEN_GLOBAL_RX).flat().filter(token => token !== undefined)

                let line_numbers = new Set()

                locations.forEach(location => {

                    if (location.is_numeric()) {

                        let number = parseInt(location)

                        if (number <= owner_block.getSourceLines().length) {
                            line_numbers.add(number - 1)
                        } else {
                            console.log(`Line number too large ==> ${number}`)
                        }

                    } else {
                        //We must be dealing with a string matcher
                        let number = find_matching_lines(location, owner_block)

                        if (number > -1) {
                            line_numbers.add(number)
                        } else {
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

            let block_parent = list.getParent()

            if (block_parent === undefined) {
                throw "There is no block above the callout list"
            }

            let index_back = block_parent.getBlocks().findIndex((block) => block === list)

            if (index_back === undefined) {
                // Shouldn't happen because we managed to get this far
                throw "Error – could not locate our ordered list"
            }

            // From the position of our ordered list, scan backwards until we find the next correct
            // source listing, looking for hazards along the way.
            while (index_back > 0) {

                index_back = index_back - 1;

                if (block_parent.getBlocks()[index_back].getContext() === 'listing') {

                    // We have found our matching block
                    return block_parent.getBlocks()[index_back]
                }

                if (block_parent.getBlocks()[index_back].getContext() === 'colist') {

                    // We have hit another callout list, but there was no list block first.
                    // Assume we have an error
                    throw "Callout list found while seeking listing"
                }

            }

            // If we didn't find a listing then this document has probably got
            // bits missing.
            throw "No listing found"
        }

        function find_list_index_for_item(list_item) {

            let list = list_item.getParent()

            let index_of_this_item = list.getBlocks().findIndex((item) => item === list_item)
            return index_of_this_item + 1
        }

        function find_matching_lines(phrase, owner_block) {

            return owner_block.getSourceLines().findIndex(line => {
                return line.match(new RegExp(phrase))
            })
        }

        String.prototype.is_numeric = function () {
            return this.match(/^\d+$/)
        }

        //Borrowed this function so that we can have
        // a scan that works in the same way as the Ruby version of the
        // callout extension.
        String.prototype.scan = function (regexp) {

            if (!regexp.global) {
                throw new Error("RegExp without global (g) flag is not supported.")
            }
            let result = []
            let m
            while (m = regexp.exec(this)) {
                if (m.length >= 2) {
                    result.push(m.slice(1));
                } else {
                    result.push(m[0])
                }
            }
            return result
        }
    })

}
