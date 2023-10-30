import { Node, Plugin } from 'tiptap'
import { filterImages } from './CustomImageHelper'

export default class CustomImageNode extends Node {
  constructor (options) {
    super(options)
    this.fileTypes = options.fileTypes
    this.maxFileSize = options.maxFileSize
    this.filterErrorFunc = options.filterErrorFunc
  }
  get name () {
    return 'custom_image'
  }

  get schema () {
    return {
      inline: true,
      attrs: {
        src: {},
        alt: {
          default: null
        },
        title: {
          default: null
        }
      },
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: dom => ({
            src: dom.getAttribute('src'),
            title: dom.getAttribute('title'),
            alt: dom.getAttribute('alt')
          })
        }
      ],
      toDOM: node => ['img', node.attrs]
    }
  }

  commands ({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos
      const node = type.create(attrs)
      const transaction = state.tr.insert(position, node)
      dispatch(transaction)
    }
  }

  get plugins () {
    const fileTypes = this.fileTypes
    const maxFileSize = this.maxFileSize
    const filterErrorFunc = this.filterErrorFunc

    const handleImageEvent = function (view, event, files, coordinates) {
      if (!files || files.length === 0) {
        return
      }

      event.preventDefault()

      const images = filterImages(Array.from(files), fileTypes, maxFileSize, filterErrorFunc)

      if (images.length === 0) {
        return
      }

      const { schema } = view.state

      images.forEach(image => {
        const reader = new FileReader()

        reader.onload = readerEvent => {
          const node = schema.nodes.custom_image.create({
            src: readerEvent.target.result
          })
          const transaction = coordinates ? view.state.tr.insert(coordinates.pos, node) : view.state.tr.replaceSelectionWith(node)
          view.dispatch(transaction)
        }
        reader.readAsDataURL(image)
      })
    }

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop (view, event) {
              handleImageEvent(view, event, event.dataTransfer && event.dataTransfer.files, view.posAtCoords({ left: event.clientX, top: event.clientY }))
            },
            paste (view, event) {
              handleImageEvent(view, event, event.clipboardData && event.clipboardData.files, null)
            }
          }
        }
      })
    ]
  }
}
