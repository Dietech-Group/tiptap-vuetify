import { Image, ImageOptions } from '@tiptap/extension-image'
import { Plugin } from '@tiptap/pm/state'
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
  addProseMirrorPlugins () {
    const options = this.options

    const plugin = new Plugin({
      props: {
        handleDOMEvents: {
          drop (view, event) {
            if (!(event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0)) {
              return
            }

            event.preventDefault()

            const images = filterImages(Array.from(event.dataTransfer.files), options.fileTypes, options.maxFileSize, options.filterErrorFunc)
            if (images.length === 0) {
              return
            }

            const { schema } = view.state
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
            if (!coordinates) {
              return
            }

            images.forEach(image => {
              const reader = new FileReader()

              reader.onload = readerEvent => {
                if (readerEvent?.target?.result) {
                  const node = schema.nodes.image.create({
                    src: readerEvent.target.result
                  })
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }
              }
              reader.readAsDataURL(image)
            })
          }
        }
      }
    })

    return [plugin]
  }
})
