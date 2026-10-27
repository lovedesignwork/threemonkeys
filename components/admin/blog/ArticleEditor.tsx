"use client";
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
    };
  },
});
export default function ArticleEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (v: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
      }),
      ArticleImage,
      TableKit,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  useEffect(() => {
    if (editor && editor.getHTML() !== content)
      editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, content]);
  if (!editor) return <p>Loading editor…</p>;
  const actions: [string, () => void][] = [
    ["Paragraph", () => editor.chain().focus().setParagraph().run()],
    ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
    ["H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run()],
    ["Bold", () => editor.chain().focus().toggleBold().run()],
    ["Italic", () => editor.chain().focus().toggleItalic().run()],
    ["List", () => editor.chain().focus().toggleBulletList().run()],
    ["Numbered list", () => editor.chain().focus().toggleOrderedList().run()],
    [
      "Link",
      () => {
        const href = prompt(
          "Link destination",
          editor.getAttributes("link").href || "",
        );
        if (href) editor.chain().focus().setLink({ href }).run();
      },
    ],
    [
      "Table",
      () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    ],
    ["Add row", () => editor.chain().focus().addRowAfter().run()],
    ["Delete table", () => editor.chain().focus().deleteTable().run()],
    ["Undo", () => editor.chain().focus().undo().run()],
  ];
  return (
    <div className="rounded-xl border border-slate-300 bg-white text-slate-800">
      <div className="flex flex-wrap gap-1 border-b bg-slate-50 p-3">
        {actions.map(([label, action]) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className="rounded border border-slate-200 px-3 py-2 text-sm hover:bg-slate-200"
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="article-edit p-5" />
      <style jsx global>{`
        .article-edit .tiptap {
          min-height: 420px;
          outline: none;
          line-height: 1.8;
        }
        .article-edit p {
          margin: 12px 0;
        }
        .article-edit h2 {
          font-size: 26px;
          margin: 25px 0 10px;
          text-transform: none;
        }
        .article-edit h3 {
          font-size: 21px;
          margin: 20px 0 10px;
        }
        .article-edit ul {
          list-style: disc;
          padding-left: 24px;
        }
        .article-edit ol {
          list-style: decimal;
          padding-left: 24px;
        }
        .article-edit img {
          max-height: 300px;
          width: auto;
          margin: 20px 0;
        }
        .article-edit td,
        .article-edit th {
          border: 1px solid #bbb;
          padding: 12px;
        }
        .article-edit table {
          border-collapse: collapse;
          width: 100%;
        }
        .article-edit a {
          color: #345a14;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
