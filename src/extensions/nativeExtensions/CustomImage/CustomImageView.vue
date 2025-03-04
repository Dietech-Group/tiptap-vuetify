<template>
  <img
    :src="node.attrs.src"
    :alt="node.attrs.alt"
    :title="node.attrs.title"
    :class="{'tiptap-vuetify__custom-image': !!node.attrs.highResSrc}"
    @click="onClick"
  >
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component({
})
export default class CustomImageView extends Vue {
  @Prop({
    type: Object,
    required: true
  })
  node

  onClick () {
    if (this.node.attrs.highResSrc) window.open(this.node.attrs.highResSrc, '_blank')
  }
}
</script>

<style>
  .tiptap-vuetify__custom-image:hover {
    cursor: pointer;
  }
</style>
