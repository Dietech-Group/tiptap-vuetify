<template>
  <v-dialog
    :value="value"
    max-width="500px"
  >
    <v-card>
      <v-card-title>
        <span class="headline">
          {{ $i18n.getMsg('extensions.Table.window.title') }}
        </span>

        <v-spacer />

        <v-btn
          @click="close"
          icon
        >
          <v-icon>{{ COMMON_ICONS.close[$tiptapVuetify.iconsGroup] }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="form.rowsCount"
          :label="$i18n.getMsg('extensions.Table.window.form.rowsCount')"
        />
        <v-text-field
          v-model="form.colsCount"
          :label="$i18n.getMsg('extensions.Table.window.form.colsCount')"
        />
        <v-checkbox
          v-model="form.withHeaderRow"
          :label="$i18n.getMsg('extensions.Table.window.form.withHeaderRow')"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          @click="close"
          text
        >
          {{ $i18n.getMsg('extensions.Table.window.buttons.close') }}
        </v-btn>

        <v-btn
          @click="apply"
          text
        >
          {{ $i18n.getMsg('extensions.Table.window.buttons.apply') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component'
import { Component, Prop } from 'vue-property-decorator'
import {
  VRow,
  VCol,
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VBtn,
  VSpacer,
  VIcon,
  VTextField,
  VCheckbox
} from 'vuetify/lib'
import I18nMixin from '~/mixins/I18nMixin'
import { COMMON_ICONS } from '~/configs/theme'

export const PROPS = {
  VALUE: 'value' as const,
  EDITOR: 'editor' as const,
  IMAGE_SOURCES: 'imageSources' as const,
  IMAGE_SOURCES_OVERRIDE: 'imageSourcesOverride' as const,
  NATIVE_EXTENSION_NAME: 'nativeExtensionName' as const
}

@Component({
  components: { VRow, VCol, VDialog, VCard, VCardTitle, VCardText, VCardActions, VBtn, VSpacer, VIcon, VTextField, VCheckbox }
  })
export default class TableWindow extends mixins(I18nMixin) {
  @Prop({
    type: Boolean,
    default: false
    })
  readonly [PROPS.VALUE]: boolean

  @Prop({
    type: String,
    required: true
    })
  readonly [PROPS.NATIVE_EXTENSION_NAME]: string

  @Prop({
    type: Object,
    required: true
    })
  readonly [PROPS.EDITOR]: any

  @Prop({
    type: Boolean,
    required: false
    })
  readonly [PROPS.IMAGE_SOURCES_OVERRIDE]: any

  readonly COMMON_ICONS = COMMON_ICONS

  form = {
    rowsCount: 2,
    colsCount: 3,
    withHeaderRow: false
  }

  apply () {
    this[PROPS.EDITOR].chain().focus().insertTable({
      rows: this.form.rowsCount,
      cols: this.form.colsCount,
      withHeaderRow: this.form.withHeaderRow
    }).run()

    this.close()
  }

  close () {
    this.$destroy()
    this.$el.parentNode!.removeChild(this.$el)
  }
}
</script>
