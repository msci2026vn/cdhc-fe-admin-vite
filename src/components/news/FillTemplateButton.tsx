import { useState } from 'react';
import { FileText } from 'lucide-react';
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
        className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
        onClick={() => setShowConfirm(true)}
      >
        <FileText className="h-4 w-4" />
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Điền mẫu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
