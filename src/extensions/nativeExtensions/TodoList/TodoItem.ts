import { TaskItem as TodoItemOriginal } from '@tiptap/extension-task-item'
import AbstractExtension from '~/extensions/AbstractExtension'
import ExtensionActionInterface from '~/extensions/actions/ExtensionActionInterface'
// import TodoItemNode from '~/extensions/nativeExtensions/TodoList/TodoItemNode'

export default class TodoItem extends AbstractExtension {
  constructor (options) {
    super(options, TodoItemOriginal)
  }

  get availableActions (): ExtensionActionInterface[] {
    return []
  }
}
