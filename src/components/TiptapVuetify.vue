<template>
  <div
    v-if="editor"
    class="tiptap-vuetify-editor"
    :class="{
      'tiptap-vuetify-editor--disabled': $props[PROPS.DISABLED]
    }"
  >
    <bubble
      v-if="availableActions.bubbleMenu.length && editor.options.editable"
      :editor="editor"
      :actions="availableActions.bubbleMenu"
    />

    <VCard
      v-if="$props[PROPS.TYPE] === EDITOR_TYPES_ENUM.card"
      v-bind="$props[PROPS.CARD_PROPS]"
    >
      <slot name="toolbar-before" />

      <toolbar
        v-if="availableActions.toolbar.length"
        :editor="editor"
        :actions="availableActions.toolbar"
        :toolbar-attributes="$props[PROPS.TOOLBAR_ATTRIBUTES]"
        :disabled="$props[PROPS.DISABLED]"
      >
        <!-- Позволяет пользователю показывать свой тулбар -->
        <template
          v-if="$scopedSlots.toolbar"
          #default="scopedSlot"
        >
          <slot
            name="toolbar"
            v-bind="scopedSlot"
          />
        </template>
      </toolbar>

      <slot name="toolbar-after" />

      <editor-content
        :editor="editor"
        :style="contentDynamicStyles"
        class="tiptap-vuetify-editor__content"
        :class="{
          'tiptap-vuetify-editor__content--disabled': $props[PROPS.DISABLED]
        }"
      />

      <slot name="footer" />
    </VCard>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-2'
import Toolbar from '~/components/Toolbar.vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { EVENTS, PROPS, EDITOR_TYPES_ENUM } from '~/const'
import Bubble from '~/components/Bubble.vue'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extension-placeholder'
import { ExtensionActionRenderInEnum } from '~/extensions/actions/ExtensionActionRenderInEnum'
import ExtensionActionInterface from '~/extensions/actions/ExtensionActionInterface'
import { VCard } from 'vuetify/lib'
import AbstractExtensionInterface from '~/extensions/AbstractExtensionInterface'

@Component({
  components: {
    Bubble,
    EditorContent,
    Toolbar,
    VCard
  }
})
export default class TiptapVuetify extends Vue {
  @Prop({ type: Boolean, default: false })
  readonly [PROPS.DISABLED]: boolean

  @Prop({ type: [String, Object], default: '' })
  readonly [PROPS.VALUE]: string

  @Prop({ type: Array, default: () => [] })
  readonly [PROPS.EXTENSIONS]: any[]

  @Prop({ type: String })
  readonly [PROPS.PLACEHOLDER]: string

  @Prop({
    type: Object,
    default: () => ({})
  })
  readonly [PROPS.CARD_PROPS]: Record<string, any>

  @Prop({ type: String, default: 'html' })
  readonly [PROPS.OUTPUT_FORMAT]: string

  @Prop({
    type: [Array, Object],
    default: () => ({})
  })
  readonly [PROPS.TOOLBAR_ATTRIBUTES]: Record<string, any>

  @Prop({
    type: Object,
    default: () => ({})
  })
  readonly [PROPS.EDITOR_PROPERTIES]: Record<string, any>

  @Prop({
    type: Array,
    default: () => []
  })
  readonly [PROPS.NATIVE_EXTENSIONS]: any[]

  @Prop({
    type: String,
    default: EDITOR_TYPES_ENUM.card
  })
  readonly [PROPS.TYPE]: EDITOR_TYPES_ENUM

  @Prop({ type: [String, Number] })
  readonly [PROPS.MIN_HEIGHT]: string | number

  @Prop({ type: [String, Number] })
  readonly [PROPS.MAX_HEIGHT]: string | number

  PROPS = PROPS
  EDITOR_TYPES_ENUM = EDITOR_TYPES_ENUM
  // TODO было бы удобно передавать через vue provide (DI)
  editor: Editor | null = null
  availableActions: {
    toolbar: ExtensionActionInterface[]
    bubbleMenu: ExtensionActionInterface[]
  } = {
    toolbar: [],
    bubbleMenu: []
  }
  emitAfterOnUpdate = false

  get contentDynamicStyles () {
    // если не указана еденица измерения (e.g. 60, 25), то будет как px. То есть 60em, 25% такими и останетутся.
    const getUnitWithPxAsDefault = (str) => {
      if (!str) return str

      const num = parseInt(str, 10)
      const unit = str.slice(num.toString().length)

      return num + (unit || 'px')
    }

    return {
      minHeight: getUnitWithPxAsDefault(this[PROPS.MIN_HEIGHT]),
      maxHeight: getUnitWithPxAsDefault(this[PROPS.MAX_HEIGHT])
    }
  }

  @Watch('disabled')
  onDisabledChange (val) {
    if (this.editor) this.editor.setOptions({ editable: !val })
  }

  @Watch('value')
  onValueChange (val) {
    if (this.emitAfterOnUpdate) {
      this.emitAfterOnUpdate = false

      return
    }

    if (this.editor) this.editor.commands.setContent(val)
  }

  mounted () {
    const nativeExtensionsInstances: any = []
    const extensionsInstances: AbstractExtensionInterface[] = []
    // опции расширений по умолчанию
    const paramsDefault = {
      renderIn: ExtensionActionRenderInEnum.toolbar,
      options: {}
    }

    this[PROPS.EXTENSIONS].forEach(extensionDefinition => {
      let ExtensionClass
      let params

      // Получение расширения и его опций
      if (Array.isArray(extensionDefinition)) {
        ([ExtensionClass, params] = extensionDefinition)
        // TODO улучшить проверку, но почему-то это не работает: http://bit.ly/2ALqFJB
      } else if (extensionDefinition.prototype.availableActions) { // Если extends от AbstractExtension
        ExtensionClass = extensionDefinition
      } else {
        throw new Error('Incorrect extension declaration passed to "extensions" prop (array). ' +
          'It looks like the array\'s element is in the wrong format.')
      }

      // параметры с дефолтными значениями TODO deep merge
      const paramsFinal = { ...paramsDefault, ...params }
      const extension: AbstractExtensionInterface = new ExtensionClass(paramsFinal.options)
      // const renderInVariants = Object.values(ExtensionActionRenderInEnum)
      //
      // if (!renderInVariants.includes(options.renderIn)) {
      //   throw new Error('Please, set the "renderIn" option to one of following values: ' + renderInVariants)
      // }

      // пополнение доступных действий для конкретного renderIn
      this.availableActions[paramsFinal.renderIn].push(...extension.availableActions)

      // Сбор нативных расширений
      if (extension.nativeExtensionInstance) {
        nativeExtensionsInstances.push(extension.nativeExtensionInstance)
      }
      // Сбор расширений
      extensionsInstances.push(extension)
    })
    const extensions = [
      Document,
      Paragraph,
      Text,
      ...this[PROPS.NATIVE_EXTENSIONS],
      ...nativeExtensionsInstances
    ]

    if (this[PROPS.PLACEHOLDER]) {
      // !!!!!!!!!!!!!!!!! TODO ONLY FOR TEST (update: не помню что это, возможно и не нужно убирать код ниже)
      extensions.push(Placeholder.configure({
        emptyNodeClass: 'tiptap-vuetify-editor__paragraph--is-empty',
        placeholder: this[PROPS.PLACEHOLDER],
        showOnlyWhenEditable: true
      }))
    }

    this.editor = (new Editor({
      editable: !this[PROPS.DISABLED],
      extensions,
      ...this[PROPS.EDITOR_PROPERTIES],
      editorProps: {
        ...this[PROPS.EDITOR_PROPERTIES].editorProps,
        handleKeyDown: (view, event) => {
          if (this[PROPS.EDITOR_PROPERTIES].editorProps &&
            this[PROPS.EDITOR_PROPERTIES].editorProps.handleKeyDown
          ) {
            this[PROPS.EDITOR_PROPERTIES].editorProps.handleKeyDown(view, event)
          }

          this.$emit('keydown', event, view)
        }
      },
      content: this[PROPS.VALUE],
      onUpdate: this.onUpdate.bind(this),
      onBlur: this.onBlur.bind(this),
      onFocus: this.onFocus.bind(this)
    }))!

    this.$emit(EVENTS.INIT, {
      editor: this.editor
    })
    extensionsInstances.forEach(ext =>
      ext.onEditorInit && ext.onEditorInit(this.editor!)
    )
  }

  onUpdate (info) {
    this.emitAfterOnUpdate = true
    let output: any

    if (this[PROPS.OUTPUT_FORMAT] === 'html') {
      output = info.editor.getHTML()
    } else {
      output = info.editor.getJSON()
    }

    this.$emit(EVENTS.INPUT, output, info)
  }

  onBlur ({ event, view }) {
    this.$emit(EVENTS.BLUR, event, view)
  }

  onFocus ({ event, view }) {
    this.$emit(EVENTS.FOCUS, event, view)
  }

  beforeDestroy () {
    if (this.editor) this.editor.destroy()
  }
}
</script>

<style lang="stylus">
  .tiptap-vuetify-editor
    position: relative

    .ProseMirror
      outline: none !important
      margin: 20px !important

    &--disabled
      cursor: not-allowed

  /* The element does not necessarily contain .tiptap-vuetify-editor, it can be used to display the result of the editor in a non-editor */
  .tiptap-vuetify-editor__content
    transition: all 2s
    overflow: auto !important
    padding: 5px

    :first-child
      margin-top: 0 !important

    a
      pointer-events: none

    h1, h2, h3, h4
      margin: 10px 0 20px !important

    blockquote
      border-left: .25em solid #dfe2e5
      color: #6a737d
      padding-left: 1em
      margin: 20px 0 !important

    code
      padding: 0 4px !important
      margin: 0 5px !important

    pre code
        padding: 8px !important
        margin: 0 5px !important

    code:before, code:after
      content: none !important
      letter-spacing: initial !important

    p
      margin-top: 16px !important
      margin-bottom: 16px !important
      /* без этого пустой <p> в превью не будет занимать пространство (чтобы был вид пустой строки) как он это делает в редакторе */
      min-height: 1rem

      // placeholder
      &.tiptap-vuetify-editor__paragraph--is-empty
        &:first-child::before
          content: attr(data-empty-text)
          float: left
          color: #aaa
          pointer-events: none
          height: 0
          font-style: italic

    table
      border-collapse: collapse
      table-layout: fixed
      width: 100%
      margin: 0
      overflow: hidden

      td, th
        min-width: 1em
        border: 2px solid gray
        padding: 3px 5px
        vertical-align: top
        box-sizing: border-box
        position: relative
        > *
          margin-bottom: 0

      th
        font-weight: bold
        text-align: left

      .selectedCell:after
        z-index: 2
        position: absolute
        content: ''
        left: 0
        right: 0
        top: 0
        bottom: 0
        background: rgba(200, 200, 255, 0.4)
        pointer-events: none

      .column-resize-handle
        position: absolute
        right: -2px; top: 0; bottom: 0
        width: 4px
        z-index: 20
        background-color: #adf
        pointer-events: none

    .tableWrapper
      margin: 1em 0
      overflow-x: auto

    .resize-cursor
      cursor: col-resize

    &--disabled
      // same color for disabled text as default light vuetify theme: vuetify/src/styles/settings/_light.scss#L30
      color rgba(0, 0, 0, 0.38)
      &:after
        // same as background as for filled v-text-input: vuetify/src/styles/settings/_light.scss#L87
        background-color: rgba(0, 0, 0, 0.06)
        position: absolute
        content: ''
        top: 0
        left: 0
        right: 0
        bottom: 0

    ul, ol
      padding: 0 1rem
      margin: 1.25rem 1rem 1.25rem 0.4rem

      li p
        margin-top: 0.25em !important
        margin-bottom: 0.25em !important

    ul[data-type="taskList"]
      list-style: none
      margin-left: 0
      padding: 0

      li
        align-items: flex-start
        display: flex

        > label
          flex: 0 0 auto
          margin-right: 0.5rem
          user-select: none

        > div
          flex: 1 1 auto

      input[type="checkbox"]
        cursor: pointer

      ul[data-type="taskList"]
        margin: 0
  
</style>
