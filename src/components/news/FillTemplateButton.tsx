import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { DEFAULT_TEMPLATE, type NewsTemplate } from './newsTemplates';

interface FillTemplateButtonProps {
  onFill: (template: NewsTemplate) => void;
  disabled?: boolean;
}

export function FillTemplateButton({ onFill, disabled }: FillTemplateButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
        onClick={() => setShowConfirm(true)}
      >
        <Sparkles className="h-4 w-4" />
        Dùng bài mẫu
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Điền nội dung mẫu?</AlertDialogTitle>
            <AlertDialogDescription>
              Nội dung mẫu sẽ được điền vào form. Nội dung hiện tại trong form sẽ bị thay thế.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onFill(DEFAULT_TEMPLATE)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Điền mẫu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
