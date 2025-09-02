<template>
  <bubble-menu :editor="editor" :tippy-options="{ zIndex: 200 }">
    <v-sheet rounded elevation="2" color="grey lighten-4" class="bubble-menu">
      <actions-render
        :actions="actions"
        :editor="editor"
      />
    </v-sheet>
  </bubble-menu>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import { Editor, BubbleMenu } from '@tiptap/vue-2'
import I18nMixin from '~/mixins/I18nMixin'
import ExtensionActionInterface from '~/extensions/actions/ExtensionActionInterface'
import ActionsRender from '~/components/ActionsRender.vue'
import { VSheet } from 'vuetify/lib'

@Component({
  components: {
    ActionsRender,
    BubbleMenu,
    VSheet
  }
})
export default class Menu extends mixins(I18nMixin) {
  @Prop({ type: Object, required: true })
  readonly editor!: Editor

  @Prop({
    type: Array,
    default: () => []
  })
  readonly actions: ExtensionActionInterface[]
}
</script>
