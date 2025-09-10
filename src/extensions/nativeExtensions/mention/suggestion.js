import { VueRenderer } from '@tiptap/vue-2'
import Vue from 'vue'
import MentionWindow from './MentionWindow.vue'

export default {
  render: () => {
    let component

    return {
      onStart: props => {
        component = new VueRenderer(MentionWindow, {
          vuetify: Vue.prototype.tiptapVuetifyPlugin.vuetify,
          propsData: props
        })

        document.querySelector('body').appendChild(component.element)
      },

      onUpdate (props) {
        component?.updateProps(props)
      },

      onKeyDown (props) {
        return component?.ref?.onKeyDown(props)
      },

      onExit () {
        component?.element?.parentNode?.removeChild(component.element)
        component?.destroy()
        component = null
      }
    }
  }
}
