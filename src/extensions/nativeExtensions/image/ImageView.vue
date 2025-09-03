<template>
  <node-view-wrapper>
    <img
      :src="node.attrs.src"
      :alt="node.attrs.alt"
      :title="node.attrs.title"
      :class="{'tiptap-vuetify__custom-image': !!node.attrs['data-high-res-src']}"
      @click="onClick"
    >
  </node-view-wrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { NodeViewWrapper } from '@tiptap/vue-2'

@Component({
  components: {
  NodeViewWrapper
  }
  })
export default class ImageView extends Vue {
  @Prop({
    type: Object,
    required: true
    })
  node

  get highResSrc (): string | null {
    return this.node.attrs['data-high-res-src']
  }

  onClick () {
    if (this.node.attrs['data-high-res-src']) window.open(this.node.attrs['data-high-res-src'], '_blank')
  }
}
</script>

<style>
  .tiptap-vuetify__custom-image:hover {
    cursor: pointer;
  }
</style>
