import CustomImageNode from './CustomImageNode'
import { VuetifyIconsGroups } from '~/configs/theme'
import VuetifyIcon from '~/extensions/nativeExtensions/icons/VuetifyIcon'
import I18nText from '~/i18n/I18nText'
import AbstractExtension from '~/extensions/AbstractExtension'
import ExtensionActionInterface from '~/extensions/actions/ExtensionActionInterface'
import ExtensionActionRenderBtn from '~/extensions/actions/renders/btn/ExtensionActionRenderBtn.ts'
import CustomImageSelector from './CustomImageSelector'
import { FileTypesType, MaxFileSizeType, FilterErrorFuncType } from './CustomImageHelper'
export default class CustomImage extends AbstractExtension {
  private fileTypes: FileTypesType
  private maxFileSize: MaxFileSizeType
  private filterErrorFunc: FilterErrorFuncType

  constructor (options) {
    options = options || {}
    options.fileTypes = options.fileTypes || ['png', 'jpeg', 'gif']
    super(options, CustomImageNode)

    this.fileTypes = options.fileTypes
    this.maxFileSize = options.maxFileSize
    this.filterErrorFunc = options.filterErrorFunc
  }

  get availableActions (): ExtensionActionInterface[] {
    const nativeExtensionName = 'custom_image'
    const fileTypes = this.fileTypes
    const maxFileSize = this.maxFileSize
    const filterErrorFunc = this.filterErrorFunc

    return [
      {
        render: new ExtensionActionRenderBtn({
          tooltip: new I18nText('extensions.Image.buttons.tooltip'),
          icons: {
            [VuetifyIconsGroups.md]: new VuetifyIcon('image'),
            [VuetifyIconsGroups.fa]: new VuetifyIcon('fas fa-image'),
            [VuetifyIconsGroups.mdi]: new VuetifyIcon('mdi-image'),
            [VuetifyIconsGroups.mdiSvg]: new VuetifyIcon('M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z')
          },
          nativeExtensionName,
          async onClick ({ context, editor }) {
            const selector = new CustomImageSelector(context, editor, nativeExtensionName, fileTypes, maxFileSize, filterErrorFunc)
            selector.open()
          }
        })
      }
    ]
  }
}
