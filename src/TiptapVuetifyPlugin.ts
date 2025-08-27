import theme from '~/configs/theme'
import { OptionsInterface, PluginInterface } from '../types'
import ConsoleLogger from '~/logging/ConsoleLogger'

const TiptapVuetifyPlugin = new (class Plugin implements PluginInterface<OptionsInterface> {
  vuetify
  installed = false

  get vuetifyLang () {
    return this.vuetify.framework.lang.current
  }

  install (VueFuncConstructor, options?: OptionsInterface) {
    if (!options || !options.vuetify) {
      ConsoleLogger.error('Please, specify in options the Vuetify Object ("vuetify" property)')

      return
    }

    const {
      vuetify: vuetifyFramework,
      iconsGroup = theme.defaultIconsGroup
    } = options

    VueFuncConstructor.prototype.tiptapVuetifyPlugin = TiptapVuetifyPlugin
    VueFuncConstructor.prototype.$tiptapVuetify = {
      iconsGroup
    }
    this.vuetify = vuetifyFramework
    this.installed = true
  }
})()

export default TiptapVuetifyPlugin
