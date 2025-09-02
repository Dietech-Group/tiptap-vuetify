import { TableRow as TableRowOriginal } from '@tiptap/extension-table-row'
import ExtensionActionInterface from '~/extensions/actions/ExtensionActionInterface'
import AbstractExtension from '~/extensions/AbstractExtension'

export default class TableRow extends AbstractExtension {
  constructor (options) {
    super(options, TableRowOriginal)
  }

  get availableActions (): ExtensionActionInterface[] {
    return []
  }
}
