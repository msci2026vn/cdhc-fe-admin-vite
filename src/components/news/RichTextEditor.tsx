import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  SeparatorHorizontal,
  FileCode,
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function ToolbarButton({
  onClick,
  isActive,
  children,
  title,
  disabled,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-9 w-9 hover:bg-gray-100',
        isActive && 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      )}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: false,
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl shadow-md my-8 max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Nhập nội dung bài viết...',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-yellow-500 pl-4 italic text-gray-700 my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 p-2 font-bold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const handleInsertImage = () => {
    if (imageUrl) {
      // Insert image
      editor.chain().focus().setImage({ src: imageUrl }).run();

      // If caption provided, add it as a paragraph below
      if (imageCaption) {
        editor
          .chain()
          .focus()
          .insertContent(
            `<p style="text-align: center; font-style: italic; color: #64748b; font-size: 0.9em; margin-top: 0.5rem;">${imageCaption}</p>`,
          )
          .run();
      }

      setImageUrl('');
      setImageCaption('');
      setImageDialogOpen(false);
    }
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      if (linkText) {
        // Insert link with text
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
      } else {
        // Just set link on selected text
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }

      setLinkUrl('');
      setLinkText('');
      setLinkDialogOpen(false);
    }
  };

  const handleInsertInfoBox = (type: 'info' | 'warning' | 'success') => {
    const boxConfig = {
      info: {
        icon: '💡',
        bgColor: '#eff6ff',
        borderColor: '#3b82f6',
        textColor: '#1e40af',
        title: 'Thông tin',
        placeholder: 'Nhập nội dung thông tin quan trọng tại đây...',
      },
      warning: {
        icon: '⚠️',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        textColor: '#92400e',
        title: 'Lưu ý',
        placeholder: 'Nhập nội dung cần lưu ý tại đây...',
      },
      success: {
        icon: '✅',
        bgColor: '#f0fdf4',
        borderColor: '#22c55e',
        textColor: '#166534',
        title: 'Mẹo',
        placeholder: 'Nhập mẹo hữu ích tại đây...',
      },
    };

    const config = boxConfig[type];
    const html = `
      <div style="background-color: ${config.bgColor}; border-left: 4px solid ${config.borderColor}; padding: 1rem 1.25rem; border-radius: 0.5rem; margin: 1.5rem 0;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-size: 1.25rem;">${config.icon}</span>
          <strong style="color: ${config.textColor}; font-size: 1.125rem; font-weight: 600;">${config.title}</strong>
        </div>
        <p style="color: ${config.textColor}; line-height: 1.6; margin: 0;">${config.placeholder}</p>
      </div>
    `;

    editor.chain().focus().insertContent(html).run();
  };

  return (
    <>
      <div className="rounded-lg border bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 px-3 py-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Hoàn tác (Ctrl+Z): Quay lại thao tác vừa thực hiện, giúp khôi phục nội dung đã xóa hoặc sửa nhầm"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Làm lại (Ctrl+Y): Thực hiện lại thao tác vừa hoàn tác, dùng khi bạn muốn khôi phục lại thay đổi"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="In đậm (Ctrl+B): Làm chữ đậm hơn để nhấn mạnh nội dung quan trọng, thu hút sự chú ý của người đọc"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="In nghiêng (Ctrl+I): Làm chữ nghiêng, thường dùng cho trích dẫn, tên tác phẩm, hoặc từ ngữ cần nhấn mạnh nhẹ"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Gạch chân (Ctrl+U): Thêm gạch chân vào văn bản để làm nổi bật hoặc nhấn mạnh phần quan trọng"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Gạch ngang: Tạo đường gạch xuyên qua chữ, dùng để thể hiện nội dung đã bị xóa hoặc không còn giá trị"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Code inline: Định dạng văn bản dạng mã lệnh, thường dùng cho tên biến, hàm, lệnh kỹ thuật hoặc từ khóa lập trình"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Text Color & Highlight */}
          <div className="flex items-center gap-0.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="Màu chữ: Thay đổi màu sắc của văn bản để làm nổi bật hoặc phân loại nội dung theo ý nghĩa"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold">A</span>
                    <div
                      className="h-0.5 w-4"
                      style={{
                        backgroundColor: editor.getAttributes('textStyle').color || '#000000',
                      }}
                    />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid grid-cols-6 gap-2">
                  {[
                    '#000000',
                    '#ef4444',
                    '#f97316',
                    '#eab308',
                    '#22c55e',
                    '#3b82f6',
                    '#8b5cf6',
                    '#ec4899',
                    '#64748b',
                    '#ffffff',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-7 w-7 rounded border-2 border-gray-200 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      onClick={() => editor.chain().focus().setColor(color).run()}
                      title={color}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="Highlight: Tô màu nền cho văn bản như bút dạ quang, giúp làm nổi bật thông tin quan trọng cần ghi nhớ"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid grid-cols-6 gap-2">
                  {[
                    '#fef3c7',
                    '#fecaca',
                    '#fed7aa',
                    '#d9f99d',
                    '#a7f3d0',
                    '#bfdbfe',
                    '#ddd6fe',
                    '#fbcfe8',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-7 w-7 rounded border-2 border-gray-200 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                      title={color}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Headings */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1: Tiêu đề chính lớn nhất, dùng cho tiêu đề phần quan trọng nhất trong bài viết"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2: Tiêu đề phụ cấp 2, dùng cho các phần nội dung chính trong bài viết"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3: Tiêu đề cấp 3, dùng cho các mục con hoặc tiểu mục trong bài viết"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Danh sách gạch đầu dòng: Tạo danh sách các mục với dấu chấm tròn, dùng khi thứ tự không quan trọng"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Danh sách đánh số: Tạo danh sách được đánh số thứ tự 1, 2, 3... dùng cho các bước thực hiện hoặc khi thứ tự quan trọng"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Căn trái: Căn văn bản về phía bên trái, định dạng phổ biến nhất cho các đoạn văn thông thường"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Căn giữa: Căn văn bản vào chính giữa, thường dùng cho tiêu đề, trích dẫn hoặc chú thích ảnh"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Căn phải: Căn văn bản về phía bên phải, thường dùng cho chữ ký hoặc ghi chú đặc biệt"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Căn đều hai bên: Căn chỉnh văn bản sao cho hai cạnh trái phải đều thẳng hàng, tạo bố cục chuyên nghiệp"
            >
              <AlignJustify className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Special Formats */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Trích dẫn: Tạo khối trích dẫn với viền màu vàng bên trái, dùng để trích lời nói hoặc đoạn văn từ nguồn khác"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code block: Tạo khối mã lệnh đa dòng với nền tối, dùng để hiển thị code hoặc lệnh kỹ thuật nhiều dòng"
            >
              <FileCode className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={editor.isActive('subscript')}
              title="Chỉ số dưới: Chuyển văn bản thành chỉ số dưới như H₂O, dùng cho công thức hóa học hoặc toán học"
            >
              <SubscriptIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={editor.isActive('superscript')}
              title="Chỉ số trên: Chuyển văn bản thành chỉ số trên như x², dùng cho số mũ, chú thích, hoặc công thức toán"
            >
              <SuperscriptIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Insert */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => setLinkDialogOpen(true)}
              title="Chèn liên kết: Thêm đường link dẫn đến trang web khác, giúp người đọc truy cập thêm thông tin liên quan"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setImageDialogOpen(true)}
              title="Chèn ảnh: Thêm hình ảnh vào bài viết từ URL, có thể thêm chú thích mô tả cho ảnh"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }
              title="Chèn bảng: Tạo bảng 3x3 để trình bày dữ liệu có cấu trúc, so sánh thông tin hoặc liệt kê dữ liệu"
            >
              <TableIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Đường kẻ ngang: Chèn đường kẻ ngang để phân tách các phần nội dung khác nhau trong bài viết"
            >
              <SeparatorHorizontal className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => handleInsertInfoBox('info')}
              title="Hộp thông tin: Chèn khung thông tin màu xanh dương để làm nổi bật thông tin quan trọng hoặc lưu ý đặc biệt"
            >
              <Info className="h-4 w-4 text-blue-600" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => handleInsertInfoBox('warning')}
              title="Hộp cảnh báo: Chèn khung cảnh báo màu vàng để nhắc nhở người đọc về điều cần lưu ý hoặc thận trọng"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => handleInsertInfoBox('success')}
              title="Hộp mẹo: Chèn khung mẹo màu xanh lá để chia sẻ bí quyết, lời khuyên hữu ích cho người đọc"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} className="min-h-[400px] max-h-[600px] overflow-y-auto" />
      </div>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chèn ảnh</DialogTitle>
            <DialogDescription>
              Nhập URL ảnh và mô tả (tùy chọn) để chèn vào bài viết
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL ảnh *</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-caption">Mô tả ảnh (figcaption)</Label>
              <Input
                id="image-caption"
                placeholder="Mô tả ngắn gọn về ảnh..."
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleInsertImage}>
              Chèn ảnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chèn liên kết</DialogTitle>
            <DialogDescription>Nhập URL và văn bản hiển thị (nếu chưa chọn text)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Văn bản hiển thị (tùy chọn)</Label>
              <Input
                id="link-text"
                placeholder="Nhấn vào đây"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleInsertLink}>
              Chèn liên kết
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
