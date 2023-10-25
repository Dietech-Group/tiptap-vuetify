import ImageSource from '~/extensions/nativeExtensions/image/ImageSource'
import { FileTypesType, MaxFileSizeType, FilterErrorFuncType, filterImages } from './CustomImageHelper'

export default class CustomImageSelector {
  private context: any
  private editor: any
  private nativeExtensionName: string
  private fileTypes: FileTypesType
  private maxFileSize: MaxFileSizeType
  private filterErrorFunc: FilterErrorFuncType
  constructor (context: any, editor: any, nativeExtensionName: string, fileTypes: FileTypesType, maxFileSize: MaxFileSizeType, filterErrorFunc: FilterErrorFuncType) {
    this.context = context
    this.editor = editor
    this.nativeExtensionName = nativeExtensionName
    this.fileTypes = fileTypes
    this.maxFileSize = maxFileSize
    this.filterErrorFunc = filterErrorFunc
  }

  open () {
    new Promise<FileList | null>((resolve, reject) => {
      let changeTriggered = false
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('id', 'tiptap-vuetify-custom-image__input-file')
      input.setAttribute('accept', 'image/*')
      input.setAttribute('multiple', '')
      input.style.display = 'none'
      document.querySelector('body')!.appendChild(input)

      input.addEventListener('change', () => {
        changeTriggered = true
        resolve(input.files)
        // remove dom
        const el = document.getElementById(input.id)
        if (el) document.body.removeChild(el)
      }, { once: true })

      // file blur
      window.addEventListener('focus', () => {
        setTimeout(() => {
          if (!changeTriggered) {
            const el = document.getElementById(input.id)
            if (el) {
              reject(new Error())
              // remove dom
              document.body.removeChild(el)
            }
          }
        }, 300)
      }, { once: true })

      input.click()
    })
      .then(files => {
        if (files) {
          this.readFiles(filterImages(Array.from(files), this.fileTypes, this.maxFileSize, this.filterErrorFunc))
            .then(sources => {
              sources.forEach(src => {
                this.context.commands[this.nativeExtensionName](src)
              })

              this.editor.focus()
            })
            .catch(error => console.error(error))
        }
      })
      .catch(error => console.error((error)))
  }

  async readFiles (files: File[]): Promise<ImageSource[]> {
    const filePromises = files.map((file) => {
      // Return a promise per file
      return new Promise<ImageSource>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async () => {
          resolve({
            src: reader.result!.toString(),
            alt: file.name
          })
        }

        reader.onerror = (error) => {
          reject(error)
        }
        reader.readAsDataURL(file)
      })
    })

    const imageSources = await Promise.all(filePromises)
    return imageSources
  }
}
