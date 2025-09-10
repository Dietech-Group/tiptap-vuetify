import Mention from '@tiptap/extension-mention'
import { Suggestion } from '../suggestion/suggestion'
import { getSuggestionOptions } from './utils/get-default-suggestion-attributes'
import type { Editor } from '@tiptap/core'
import { MentionOptions } from '@tiptap/extension-mention/src/mention'

interface GetSuggestionsOptions {
  editor?: Editor
  options: MentionOptions
  name: string
}

function getSuggestions (options: GetSuggestionsOptions) {
  return (options.options.suggestions.length ? options.options.suggestions : [options.options.suggestion]).map(
    suggestion => getSuggestionOptions({
      // @ts-ignore `editor` can be `undefined` when converting the document to HTML with the HTML utility
      editor: options.editor,
      overrideSuggestionOptions: suggestion,
      extensionName: options.name,
      char: suggestion.char
    })
  )
}

export const CustomMention = Mention.extend({
  addProseMirrorPlugins () {
    return getSuggestions(this).map(Suggestion)
  }
})
