import { Image, ImageOptions } from '@tiptap/extension-image'
import { Plugin } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import ImageView from './ImageView.vue'
import { FileTypesType, MaxFileSizeType, FilterErrorFuncType, filterImages } from './ImageHelper'

export interface ExtendedImageOptions extends Partial<ImageOptions> {
  /**
   * Controls which image file types are allowed to drop.
   * @default ['png', 'jpeg', 'gif']
   * @example ['png']
   */
  fileTypes: FileTypesType

  /**
   * Controls the allowed max image file size of dropped images.
   * @default null
   * @example 1073741824
   */
  maxFileSize: MaxFileSizeType

  /**
   * Callback function which is called for every dropped file which is rejected because of file type or size.
   * @default null
   * @example (type, file) => { console.log(type, file) }
   */
  filterErrorFunc: FilterErrorFuncType
}

export const ExtendedImageExtension = Image.extend<ExtendedImageOptions>({
  addOptions () {
    return {
      ...this.parent?.(),
      fileTypes: ['png', 'jpeg', 'gif'],
      maxFileSize: undefined,
      filterErrorFunc: undefined
    }
  },
  addAttributes () {
    return {
      ...this.parent?.(),
      'data-high-res-src': null
    }
  },
  addNodeView () {
    return VueNodeViewRenderer(ImageView)
  },
  addProseMirrorPlugins () {
    const options = this.options

    const handleImageEvent = function (view: EditorView, event: Event, files: FileList | undefined, coordinates: any) {
      if (!(files && files.length > 0)) {
        return
      }

      event.preventDefault()

      const images = filterImages(Array.from(files), options.fileTypes, options.maxFileSize, options.filterErrorFunc)
      if (images.length === 0) {
        return
      }

      const { schema } = view.state

      images.forEach(image => {
        const reader = new FileReader()

        reader.onload = readerEvent => {
          if (readerEvent?.target?.result) {
            const node = schema.nodes.image.create({
              src: readerEvent.target.result
            })
            const transaction = coordinates ? view.state.tr.insert(coordinates.pos, node) : view.state.tr.replaceSelectionWith(node)
            view.dispatch(transaction)
          }
        }
        reader.readAsDataURL(image)
      })
    }

    const plugin = new Plugin({
      props: {
        handleDOMEvents: {
          drop (view, event) {
            handleImageEvent(view, event, event.dataTransfer?.files, view.posAtCoords({ left: event.clientX, top: event.clientY }))
          },
          paste (view, event) {
            handleImageEvent(view, event, event.clipboardData?.files, null)
          }
        }
      }
    })

    return [plugin]
  }
})
