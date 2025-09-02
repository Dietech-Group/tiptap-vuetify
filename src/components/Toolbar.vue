<template>
  <!-- Open/Closed principle https://css-tricks.com/creating-vue-js-component-instances-programmatically/ -->
  <div class="tiptap-vuetify-editor__toolbar">
    <v-toolbar
      v-bind="{
        ...toolbarConfig,
        ...toolbarAttributes
      }"
    >
      <actions-render
        :actions="actions"
        :editor="editor"
        :disabled="disabled"
      />
    </v-toolbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Editor } from '@tiptap/vue-2'
import toolbarConfig from '~/configs/toolbar'
import ExtensionActionInterface from '~/extensions/actions/ExtensionActionInterface'
import ActionsRender from '~/components/ActionsRender.vue'
import { VToolbar } from 'vuetify/lib'
import { VBtn, VIcon } from 'vuetify/lib'

@Component({
  components: {
    ActionsRender,
    VToolbar,
    VBtn,
    VIcon
  }
})
export default class Toolbar extends Vue {
  @Prop({ type: Boolean, default: false })
  readonly disabled: boolean

  @Prop({ type: Object, required: true })
  readonly editor: Editor

  @Prop({
    type: Array,
    default: () => []
  })
  readonly actions: ExtensionActionInterface[]

  @Prop({
    type: [Array, Object],
    default: () => ({})
  })
  readonly toolbarAttributes!: any

  readonly toolbarConfig = toolbarConfig
}
</script>

<style lang="stylus">
  .tiptap-vuetify-editor__toolbar
    .v-toolbar
      display: flex
      height: auto !important
      padding: 5px

      .v-toolbar__content
        height: auto !important
        flex-wrap: wrap
        padding: 0
</style>
