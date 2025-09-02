import { ListItem as ListItemOriginal } from '@tiptap/extension-list-item'
import AbstractExtension from '~/extensions/AbstractExtension'
import ExtensionActionInterface from '~/extensions/actions/ExtensionActionInterface'

export default class ListItem extends AbstractExtension {
  constructor (options) {
    super(options, ListItemOriginal)
  }

  get availableActions (): ExtensionActionInterface[] {
    return []
  }
}
