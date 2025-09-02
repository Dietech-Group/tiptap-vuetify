import I18nText from '~/i18n/I18nText'
import { VuetifyIconsGroups } from '~/configs/theme'
import IconInterface from '~/extensions/nativeExtensions/icons/IconInterface'
import { Editor } from 'tiptap'

export interface ExtensionActionRenderBtnOptionsInterface {
  tooltip: string | I18nText | ((editor: Editor, options) => string | I18nText)
  icons: Partial<{
    [key in keyof typeof VuetifyIconsGroups]: IconInterface
  }>
  onClick: ({ editor }: {
    editor: Editor
  }) => any
  onClickCommand?: string
  onClickOptions?: { [key: string]: any }
  isActive: (editor: Editor) => boolean
  isActiveOptions?: { [key: string]: any }
  nativeExtensionName?: string
}
