import { Node, Plugin } from 'tiptap'
import { nodeInputRule } from 'tiptap-commands'
import { filterImages } from './CustomImageHelper'
/**
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */
const IMAGE_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

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

  inputRules ({ type }) {
    return [
      nodeInputRule(IMAGE_INPUT_REGEX, type, match => {
        const [, alt, src, title] = match
        return {
          src,
          alt,
          title
        }
      })
    ]
  }

  get plugins () {
    const fileTypes = this.fileTypes
    const maxFileSize = this.maxFileSize
    const filterErrorFunc = this.filterErrorFunc
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop (view, event) {
              const hasFiles = event.dataTransfer &&
                                event.dataTransfer.files &&
                                event.dataTransfer.files.length

              if (!hasFiles) {
                return
              }

              event.preventDefault()

              const images = filterImages(Array.from(event.dataTransfer.files), fileTypes, maxFileSize, filterErrorFunc)

              if (images.length === 0) {
                return
              }

              const { schema } = view.state
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

              images.forEach(image => {
                const reader = new FileReader()

                reader.onload = readerEvent => {
                  const node = schema.nodes.custom_image.create({
                    src: readerEvent.target.result
                  })
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }
                reader.readAsDataURL(image)
              })
            }
          }
        }
      })
    ]
  }
}
