const asciidoctor = require('asciidoctor')()

asciidoctor.Extensions.register(function () {

    this.treeProcessor(function () {

        const self = this

        const CALLOUT_ITEM_LINE_NUMBER_RX = /(?<phrase>.+)\s+@(?<location>\d+)/
        const CALLOUT_ITEM_PHRASE_RX = /(?<phrase>.+)\s+@\/(?<location>.+)\//

        self.process(function (document) {

            document.findBy({'context': 'olist'}, function (list) {

                if (is_external_callout_list(list)) {

                    try {

                        let owner_block = owning_block(list)

                        if (!owner_block.getSubstitutions().includes("callouts")) {
                            owner_block.getSubstitutions().push("callouts")
                        }

                        process_callouts(list, owner_block)
                        list.context = 'colist'

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

                if (item.match(CALLOUT_ITEM_LINE_NUMBER_RX)) {

                    let match = item.match(CALLOUT_ITEM_LINE_NUMBER_RX)

                    let location = match.groups['location']
                    let line_number = parseInt(location)
                    let callout = find_list_index_for_item(list_item)

                    if (line_number < owner_block.getSourceLines().length) {
                        owner_block.getSourceLines()[line_number - 1] += ` <${callout}>`
                    }
                    else {
                        console.warn(`Line number out of range ==> ${item}`)
                    }
                }
                else if (item.match(CALLOUT_ITEM_PHRASE_RX)) {

                    let match = item.match(CALLOUT_ITEM_PHRASE_RX)
                    let location = match.groups['location']

                    let line_number = owner_block.getSourceLines().findIndex((line) => line.match(new RegExp(location)))

                    if (line_number < 0) {
                        console.warn(`No match found for ${location} ==> ${item}`)
                    }
                    else {

                        let callout = find_list_index_for_item(list_item)

                        owner_block.getSourceLines()[line_number] += ` <${callout}>`

                    }
                }
                else {
                    throw `Mismatched expression ==> ${item}`
                }

                list_item.setText(list_item.getText().replace(/@.+/, ""))

            })
        }

        /**
         * Make sure that this list is in the correct format
         * We don't process it otherwise.
         * @param list
         */
        function is_external_callout_list(list) {
            return list.getBlocks().every((item) =>
                item.text.match(CALLOUT_ITEM_LINE_NUMBER_RX) || item.text.match(CALLOUT_ITEM_PHRASE_RX) )

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
    })

})
