// @ts-ignore
import { Node } from '@tiptap/vue-2'
// import { sinkListItem, splitToDefaultListItem, liftListItem } from '@tiptap/pm/commands'
import TodoItemView from './TodoItemView.vue'

export default class TodoItem extends Node {
  options

  name: 'todo_item'

  get defaultOptions () {
    return {
      nested: false
    }
  }

  get view () {
    return TodoItemView
  }

  get schema () {
    return {
      attrs: {
        done: {
          default: false
        }
      },
      draggable: true,
      content: this.options.nested ? '(paragraph|todo_list)+' : 'paragraph+',
      toDOM: node => {
        const { done } = node.attrs

        return [
          'li',
          {
            'data-type': this.name,
            'data-done': done.toString()
          },
          ['span', { class: 'todo-checkbox', contenteditable: 'false' }],
          ['div', { class: 'todo-content' }, 0]
        ]
      },
      parseDOM: [{
        priority: 51,
        tag: `[data-type="${this.name}"]`,
        getAttrs: dom => ({
          done: dom.getAttribute('data-done') === 'true'
        })
      }]
    }
  }

  keys ({ type }) {
    return {
      // Enter: splitToDefaultListItem(type),
      // Tab: this.options.nested ? sinkListItem(type) : () => {},
      // 'Shift-Tab': liftListItem(type)
    }
  }
}
