import { defaultValueCtx, Editor, rootCtx, editorViewOptionsCtx } from '@milkdown/kit/core';
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { commonmark } from '@milkdown/kit/preset/commonmark';
import pkg from 'milkdown-plugin-placeholder';
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import '@/styles/milkdown.css'
interface MdEditorProps {
  value: string,
  setValue: (arg: string) => void,
  placeholder?: string
}

const MilkdownEditor = ({ value, setValue, placeholder }: MdEditorProps) => {
  useEditor((root) => {
    const placeholderCtx = pkg.placeholderCtx
    const placeholderPlugin = pkg.placeholder
    const editor = Editor
      .make()
      .config(ctx => {
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          attributes: { class: 'milkdown-editor dark:prose-invert prose prose-sm prose-slate max-w-none min-h-24 p-2 border rounded mb-2 dark:bg-slate-600 dark:border-slate-500', spellcheck: 'false' },
        }))
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, value)
        ctx.set(placeholderCtx, placeholder || '')
        const listener = ctx.get(listenerCtx);

        listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
          if (markdown !== prevMarkdown) {
            setValue(markdown);
          }
        })
      })
      .use(listener)
      .use(commonmark)
      .use(placeholderPlugin)
    return editor
  }, [])

  return <Milkdown />
}

export default function MdEditor(props: MdEditorProps) {
  return (
    <MilkdownProvider>
      <MilkdownEditor {...props} />
    </MilkdownProvider>
  );
};
