import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { parseTestCasesFromExcel } from '@/lib/excel';
import { FileIcon, UploadIcon } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [folderId, setFolderId] = useState<string>('');
  const [overwrite, setOverwrite] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Get folders for dropdown
  const { data: folders } = useQuery({
    queryKey: ['/api/folders'],
    enabled: isOpen
  });
  
  // Import test cases mutation
  const importTestCasesMutation = useMutation({
    mutationFn: async (testCases: any[]) => {
      // Create each test case
      for (const testCase of testCases) {
        const { folder, ...testCaseData } = testCase;
        const folderIdToUse = folderId || (folder ? folders?.find((f: any) => f.name === folder)?.id : null);
        
        // Create test case
        const response = await apiRequest('POST', '/api/testcases', testCaseData);
        const newTestCase = await response.json();
        
        // If folder ID is provided, assign test case to folder
        if (folderIdToUse) {
          await apiRequest('POST', `/api/testcases/${newTestCase.id}/folders`, { folderId: folderIdToUse });
        }
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Test cases imported successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/testcases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      onClose();
      setSelectedFile(null);
      setFolderId('');
      setOverwrite(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to import test cases: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: 'Warning',
        description: 'Please select a file to import',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const testCases = await parseTestCasesFromExcel(selectedFile);
      importTestCasesMutation.mutate(testCases);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">Import Test Cases</DialogTitle>
          <DialogDescription className="text-neutral-400 dark:text-neutral-500">
            Import test cases from an Excel file
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            onClick={triggerFileInput}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".xlsx,.xls" 
              className="hidden" 
            />
            
            <div className="text-neutral-400 dark:text-neutral-500 mb-3">
              {selectedFile ? (
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                  <span className="text-neutral-700 dark:text-neutral-300">{selectedFile.name}</span>
                </div>
              ) : (
                <UploadIcon className="h-10 w-10" />
              )}
            </div>
            
            <p className="text-sm text-neutral-500 text-center mb-3 dark:text-neutral-400">
              {selectedFile 
                ? 'Click to change file or drop a new file here' 
                : 'Drag and drop your Excel file here, or click to select file'}
            </p>
            
            <Button 
              type="button" 
              variant={selectedFile ? "outline" : "default"}
              size="sm"
              className={selectedFile 
                ? "border-primary-200 dark:border-primary-800" 
                : "bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600"
              }
            >
              {selectedFile ? 'Change File' : 'Select File'}
            </Button>
            
            <p className="text-xs text-neutral-400 mt-3 dark:text-neutral-500">Only .xlsx or .xls files supported</p>
          </div>
          
          <div>
            <Label htmlFor="import-folder" className="block text-sm font-medium text-neutral-500 mb-1 dark:text-neutral-400">
              Import to Folder
            </Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger id="import-folder" className="w-full">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {folders?.map((folder: any) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="overwrite" 
              checked={overwrite}
              onCheckedChange={(checked) => setOverwrite(checked === true)}
            />
            <Label htmlFor="overwrite" className="text-sm text-neutral-500 dark:text-neutral-400">
              Overwrite existing test cases with the same title
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="mt-3 sm:mt-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isUploading || importTestCasesMutation.isPending}
            className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            {isUploading || importTestCasesMutation.isPending ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
