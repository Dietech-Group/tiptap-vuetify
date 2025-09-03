<template>
  <div>
    <!-- :toolbar-attributes="{ color: 'yellow' }"
    min-height="500"
    max-height="600"
    :editor-properties="editorProperties"
    output-format="json"
   -->
    <tiptap-vuetify
      v-model="content"
      :extensions="extensions"
      :native-extensions="nativeExtensions"
      placeholder="Write something …"
      @keydown="onkeydown"
    />

    <br><br>
    <h1>Preview</h1>
    <hr>

    <div
      class="tiptap-vuetify-editor__content"
      v-html="content"
    />
  </div>
</template>

<script>
import { MAIN_MODULE } from '../config'
import MyCustomExtension from '../MyCustomExtension'
import FileSelector from '../Components/FileSelector'

// import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import 'highlight.js/styles/stackoverflow-light.css'

const lowlight = createLowlight(common)
lowlight.register('dockerfile', dockerfile)

export default {
  components: {
    TiptapVuetify: () => MAIN_MODULE.then(({ TiptapVuetify }) => TiptapVuetify)
  },
  data: () => ({
    // editorProperties: {
    //   editorProps: {
    //     handleKeyDown (a, b, c) {
    //       console.log('handleKeyDown', a, b, c)
    //     }
    //   }
    // },
    extensions: null,
    nativeExtensions: null,
    content: `
      <h1>Yay Headlines!</h1>
      <img src="https://picsum.photos/seed/test1/100" alt="test image" title="Test Image from picsum">
      <img src="https://picsum.photos/seed/test2/100" alt="test image with highres version" title="Test Image from picsum with highres version on click" data-high-res-src="https://picsum.photos/seed/test2/1000">
      <blockquote>Test quote.</blockquote>
      <p>All these <strong>cool tags</strong> are working now.</p>
      <p>
        There is always something to do. Thankfully, there are checklists for that. Don't forget to call mom.
      </p>
      <ul data-type="todo_list">
        <li data-type="todo_item" data-done="true">
          Buy beer
        </li>
        <li data-type="todo_item" data-done="true">
          Buy meat
        </li>
        <li data-type="todo_item" data-done="true">
          Buy milk
        </li>
        <li data-type="todo_item" data-done="false">
          Call mom
        </li>
      </ul>
      <table>
        <tr>
          <th colspan="3" data-colwidth="100,0,0">Wide header</th>
        </tr>
        <tr>
          <td>One</td>
          <td>Two</td>
          <td>Three</td>
        </tr>
        <tr>
          <td>Four</td>
          <td>Five</td>
          <td>Six</td>
        </tr>
      </table>
    `
  }),
  async created () {
    const {
      Heading, Bold, Italic, Strike, Underline, Code, CodeBlock, Paragraph, BulletList, OrderedList, ListItem,
      Link, Blockquote, HardBreak, HorizontalRule, History, Image, TodoList, TodoItem, Table, TableCell, TableHeader,
      TableRow
    } = await MAIN_MODULE

    this.extensions = [
      MyCustomExtension,
      [Table, {
        options: {
          resizable: true
        }
      }],
      TableCell,
      TableHeader,
      TableRow,
      TodoList,
      [TodoItem, {
        options: {
          nested: true
        }
      }],
      Code,
      [CodeBlock, {
        options: {
          lowlight
        }
      }],
      HorizontalRule,
      Paragraph,
      History,
      HardBreak, // позволяет переносить через Shift + Ctrl + Enter
      Underline,
      Strike,
      Italic,
      ListItem, // если нужно использовать список (BulletList, OrderedList)
      BulletList,
      OrderedList,
      [Image, {
        options: {
          maxFileSize: 1048576,
          filterErrorFunc: (type, file) => { console.log(type, file) }
        }
      }],
      [Heading, {
        // Опции которые попадают в расширение tiptap
        options: {
          levels: [1, 2, 3]
        }
      }],
      // но опции не обязательно указывать если нужно чтобы renderIn: 'toolbar', это по умолчанию.
      [Bold, {
        renderIn: 'toolbar'
      }],
      [Blockquote, {
        renderIn: 'bubbleMenu',
        options: {
          levels: [1, 2, 3]
        }
      }],
      [Link, {
        renderIn: 'bubbleMenu'
      }]
    ]

    this.nativeExtensions = [
      // CodeBlockLowlight.configure({
      //   lowlight
      // })
    ]
  },
  methods: {
    onkeydown (event) {
      // console.log('event', event.key)
    }
  }
}
</script>
