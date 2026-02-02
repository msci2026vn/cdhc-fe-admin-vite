import { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NEWS_TEMPLATES, TEMPLATE_CATEGORIES, type NewsTemplate } from './newsTemplates';

interface FillTemplateButtonProps {
  onFill: (template: NewsTemplate) => void;
  disabled?: boolean;
}

export function FillTemplateButton({ onFill, disabled }: FillTemplateButtonProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<{
    template: NewsTemplate;
    categoryName: string;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelect = (categorySlug: string, categoryName: string) => {
    const template = NEWS_TEMPLATES[categorySlug];
    if (template) {
      setSelectedTemplate({ template, categoryName });
      setShowConfirm(true);
    }
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onFill(selectedTemplate.template);
    }
    setShowConfirm(false);
    setSelectedTemplate(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Sparkles className="h-4 w-4" />
            Dien noi dung mau
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Chon loai tin bai</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TEMPLATE_CATEGORIES.map((cat) => (
            <DropdownMenuItem
              key={cat.slug}
              onClick={() => handleSelect(cat.slug, cat.name)}
              className="cursor-pointer"
            >
              {cat.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dien noi dung mau?</AlertDialogTitle>
            <AlertDialogDescription>
              Noi dung mau <strong>&quot;{selectedTemplate?.categoryName}&quot;</strong> se duoc dien vao form.
              Noi dung hien tai trong form se bi thay the.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Dien mau
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
