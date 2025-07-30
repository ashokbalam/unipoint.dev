import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import TwoColumnLayout from './TwoColumnLayout';
import { getApiUrl } from '../config/api';

// Types for the component
interface BulkUploadProps {
  tenantId: string;
  onComplete?: (result: UploadResult) => void;
  apiUrl?: string;
}

interface UploadOptions {
  duplicateStrategy: 'skip' | 'update' | 'error';
  batchSize: number;
  dryRun: boolean;
}

interface UploadResult {
  success: boolean;
  message: string;
  processed: {
    categories: number;
    questions: number;
  };
  created: {
    categories: number;
    questions: number;
  };
  updated: {
    categories: number;
    questions: number;
  };
  skipped: {
    categories: number;
    questions: number;
  };
  errors: {
    line?: number;
    category?: string;
    question?: string;
    message: string;
  }[];
  dryRun: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
  error?: string;
  data?: any;
}

// Styles
const styles = {
  dropArea: {
    padding: '2rem',
    border: '2px dashed #ccc',
    borderRadius: '0.5rem',
    backgroundColor: 'transparent',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginBottom: '1.5rem',
  },
  dropAreaActive: {
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.08)',
  },
  uploadIcon: {
    fontSize: '2.5rem',
    color: '#FFA500',
    marginBottom: '0.5rem',
  },
  dropText: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
  },
  dropSubtext: {
    fontSize: '0.875rem',
    color: '#666',
  },
  templateButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  },
  buttonHover: {
    borderColor: '#FFA500',
    color: '#FFA500',
  },
  primaryButton: {
    backgroundColor: '#FFA500',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButtonHover: {
    backgroundColor: '#e69500',
    transform: 'scale(1.05)',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    color: '#666',
    cursor: 'not-allowed',
  },
  fileList: {
    marginBottom: '1.5rem',
  },
  fileListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  fileListTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  clearButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    border: '1px solid #eee',
    borderRadius: '0.375rem',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    textAlign: 'left' as const,
    padding: '0.75rem',
    borderBottom: '1px solid #eee',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  tableCell: {
    padding: '0.75rem',
    borderBottom: '1px solid #eee',
    fontSize: '0.875rem',
  },
  fileStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  fileStatusIcon: {
    marginRight: '0.5rem',
    fontSize: '1rem',
  },
  fileStatusSuccess: {
    color: '#28a745',
  },
  fileStatusError: {
    color: '#dc3545',
  },
  removeButton: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    color: '#dc3545',
    fontSize: '1rem',
  },
  previewContainer: {
    marginBottom: '1.5rem',
  },
  previewHeader: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  previewStats: {
    marginBottom: '0.75rem',
    fontSize: '0.875rem',
    color: '#666',
  },
  accordion: {
    border: '1px solid #eee',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  accordionHeader: {
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
  },
  accordionContent: {
    padding: '0.75rem',
    backgroundColor: '#fff',
    maxHeight: '300px',
    overflow: 'auto',
    borderTop: '1px solid #eee',
  },
  previewCode: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap' as const,
    margin: 0,
    padding: '0.75rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '0.25rem',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    border: '1px solid #eee',
    borderRadius: '0.375rem',
    backgroundColor: '#f8f9fa',
  },
  optionsHeader: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  formSelect: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #ddd',
    fontSize: '0.875rem',
  },
  formInput: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #ddd',
    fontSize: '0.875rem',
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: '0.5rem',
    fontSize: '0.875rem',
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  submitContainer: {
    marginTop: '1.5rem',
    textAlign: 'center' as const,
  },
  progressContainer: {
    marginTop: '1.5rem',
  },
  progressLabel: {
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  progressBar: {
    width: '100%',
    height: '0.5rem',
    backgroundColor: '#eee',
    borderRadius: '0.25rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFA500',
    transition: 'width 0.3s',
  },
  progressText: {
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  resultContainer: {
    marginTop: '1.5rem',
    padding: '1rem',
    border: '1px solid #eee',
    borderRadius: '0.375rem',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  resultTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  resultChip: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  resultChipSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  resultChipError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  resultChipInfo: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  alertContainer: {
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
  },
  alertSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  alertError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  alertInfo: {
    backgroundColor: '#cce5ff',
    color: '#004085',
    border: '1px solid #b8daff',
  },
  alertTitle: {
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statsCard: {
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: '0.375rem',
    textAlign: 'center' as const,
  },
  statsNumber: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  statsLabel: {
    fontSize: '0.75rem',
    color: '#666',
  },
  statsNumberPrimary: {
    color: '#0d6efd',
  },
  statsNumberSuccess: {
    color: '#28a745',
  },
  statsNumberInfo: {
    color: '#17a2b8',
  },
  statsNumberWarning: {
    color: '#ffc107',
  },
  errorsTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    border: '1px solid #eee',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    marginTop: '1rem',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  snackbar: {
    position: 'fixed' as const,
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0.75rem 1rem',
    borderRadius: '0.25rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    minWidth: '300px',
    textAlign: 'center' as const,
    fontSize: '0.875rem',
  },
  snackbarSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  snackbarError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  snackbarInfo: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
};

const BulkUploadSimple: React.FC<BulkUploadProps> = ({ 
  tenantId, 
  onComplete,
  apiUrl
}) => {
  // Resolve base API URL – preference: prop > env config helper
  const baseUrl = apiUrl ?? getApiUrl('');
  // File upload state
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Preview state
  const [previewData, setPreviewData] = useState<{
    categories: any[];
    totalCategories: number;
    totalQuestions: number;
  } | null>(null);
  
  // Accordion states
  const [jsonPreviewOpen, setJsonPreviewOpen] = useState(true);
  const [csvPreviewOpen, setCsvPreviewOpen] = useState(true);
  const [errorsOpen, setErrorsOpen] = useState(true);
  
  // Upload options state
  const [uploadOptions, setUploadOptions] = useState<UploadOptions>({
    duplicateStrategy: 'skip',
    batchSize: 50,
    dryRun: false,
  });
  
  // Upload status state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  
  // UI state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'info',
  });
  
  // Button hover states
  const [templateCsvHover, setTemplateCsvHover] = useState(false);
  const [templateJsonHover, setTemplateJsonHover] = useState(false);
  const [clearFilesHover, setClearFilesHover] = useState(false);
  const [submitButtonHover, setSubmitButtonHover] = useState(false);
  const [proceedButtonHover, setProceedButtonHover] = useState(false);
  const [clearResultsHover, setClearResultsHover] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    setIsDragging(true);
  }, []);

  // Validate file type
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const validTypes = ['text/csv', 'application/json'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !['csv', 'json'].includes(fileExtension || '')) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only CSV and JSON files are supported.' 
      };
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { 
        valid: false, 
        error: 'File size exceeds 10MB limit.' 
      };
    }
    
    return { valid: true };
  }, []);

  // Parse file data for preview
  const parseFileData = useCallback(async (file: FileWithPreview): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          if (fileExtension === 'json') {
            // Parse JSON
            const data = JSON.parse(content);
            resolve(data);
          } else if (fileExtension === 'csv') {
            // For CSV, we'll just show a preview of the raw content
            // The actual parsing will happen on the server
            resolve({
              rawContent: content,
              previewLines: content.split('\n').slice(0, 10).join('\n'),
              lineCount: content.split('\n').length,
            });
          } else {
            reject(new Error('Unsupported file type'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }, []);

  // Generate preview data
  const generatePreview = useCallback(async (files: FileWithPreview[]) => {
    if (files.length === 0) {
      setPreviewData(null);
      return;
    }
    
    try {
      const allData: any[] = [];
      let totalCategories = 0;
      let totalQuestions = 0;
      
      for (const file of files) {
        if (!file.data) {
          file.data = await parseFileData(file);
        }
        
        if (file.name.endsWith('.json')) {
          const data = Array.isArray(file.data) ? file.data : [file.data];
          allData.push(...data);
          
          // Count categories and questions
          totalCategories += data.length;
          data.forEach(category => {
            if (category.questions && Array.isArray(category.questions)) {
              totalQuestions += category.questions.length;
            }
          });
        } else if (file.name.endsWith('.csv')) {
          // For CSV, we can't easily preview structured data
          // Just show that we detected the file
          totalCategories += 1; // Placeholder, we don't know actual count
          totalQuestions += file.data.lineCount - 1; // Rough estimate (lines - header)
        }
      }
      
      setPreviewData({
        categories: allData,
        totalCategories,
        totalQuestions,
      });
    } catch (error: unknown) {
      console.error('Error generating preview:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating preview';
      setSnackbar({
        open: true,
        message: `Error generating preview: ${errorMessage}`,
        type: 'error',
      });
    }
  }, [parseFileData]);

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles: FileWithPreview[] = [];
      
      for (const file of droppedFiles) {
        const validation = validateFile(file);
        if (validation.valid) {
          const fileWithPreview = file as FileWithPreview;
          try {
            fileWithPreview.data = await parseFileData(fileWithPreview);
            newFiles.push(fileWithPreview);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
            fileWithPreview.error = `Error parsing file: ${errorMessage}`;
            newFiles.push(fileWithPreview);
          }
        } else {
          const fileWithPreview = file as FileWithPreview;
          fileWithPreview.error = validation.error;
          newFiles.push(fileWithPreview);
        }
      }
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      generatePreview([...files, ...newFiles]);
    }
  }, [files, generatePreview, validateFile, parseFileData]);

  // Handle file selection via button
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles: FileWithPreview[] = [];
      
      for (const file of selectedFiles) {
        const validation = validateFile(file);
        if (validation.valid) {
          const fileWithPreview = file as FileWithPreview;
          try {
            fileWithPreview.data = await parseFileData(fileWithPreview);
            newFiles.push(fileWithPreview);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
            fileWithPreview.error = `Error parsing file: ${errorMessage}`;
            newFiles.push(fileWithPreview);
          }
        } else {
          const fileWithPreview = file as FileWithPreview;
          fileWithPreview.error = validation.error;
          newFiles.push(fileWithPreview);
        }
      }
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      generatePreview([...files, ...newFiles]);
    }
    
    // Reset the input
    if (e.target) {
      e.target.value = '';
    }
  }, [files, generatePreview, validateFile, parseFileData]);

  // Remove a file
  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      generatePreview(newFiles);
      return newFiles;
    });
  }, [generatePreview]);

  // Clear all files
  const handleClearFiles = useCallback(() => {
    setFiles([]);
    setPreviewData(null);
  }, []);

  // Handle option changes
  const handleOptionChange = useCallback((option: keyof UploadOptions, value: any) => {
    setUploadOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  // Download template
  const handleDownloadTemplate = useCallback((format: 'csv' | 'json') => {
    window.location.href = `${baseUrl}/bulk-upload/template?format=${format}`;
  }, [baseUrl]);

  // Submit upload
  const handleSubmit = useCallback(async () => {
    if (files.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one file to upload',
        type: 'error',
      });
      return;
    }
    
    if (!tenantId) {
      setSnackbar({
        open: true,
        message: 'Tenant ID is required',
        type: 'error',
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        if (!file.error) {
          formData.append('files', file);
        }
      });
      
      // Add options
      formData.append('duplicateStrategy', uploadOptions.duplicateStrategy);
      formData.append('batchSize', uploadOptions.batchSize.toString());
      formData.append('dryRun', uploadOptions.dryRun.toString());
      
      const response = await axios.post(
        `${baseUrl}/tenants/${tenantId}/bulk-upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      
      setUploadResult(response.data);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: uploadOptions.dryRun 
            ? 'Validation successful! No data was modified.' 
            : 'Upload completed successfully!',
          type: 'success',
        });
        
        if (onComplete) {
          onComplete(response.data);
        }
        
        if (!uploadOptions.dryRun) {
          // Clear files if not in dry run mode and upload was successful
          setFiles([]);
          setPreviewData(null);
        }
      } else {
        setSnackbar({
          open: true,
          message: `Upload completed with errors. Please check the details.`,
          type: 'error',
        });
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Safely extract possible server error message (Axios-like shape)
      type AxiosErrorLike = { response?: { data?: { message?: string } } };
      const axiosErr = error as AxiosErrorLike;
      const responseMessage: string | null =
        axiosErr?.response?.data?.message ?? null;
      
      setUploadResult({
        success: false,
        message: 'Upload failed',
        processed: { categories: 0, questions: 0 },
        created: { categories: 0, questions: 0 },
        updated: { categories: 0, questions: 0 },
        skipped: { categories: 0, questions: 0 },
        errors: [
          { 
            message: responseMessage || errorMessage || 'Unknown error' 
          }
        ],
        dryRun: uploadOptions.dryRun,
      });
      
      setSnackbar({
        open: true,
        message: `Upload failed: ${responseMessage || errorMessage || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  }, [files, tenantId, uploadOptions, apiUrl, onComplete]);

  // Update preview when files change
  useEffect(() => {
    generatePreview(files);
  }, [files, generatePreview]);

  // Auto-close snackbar after 6 seconds
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Main content for the component
  const content = (
    <>
      {/* File Upload Area */}
      <div
        ref={dropAreaRef}
        style={{
          ...styles.dropArea,
          ...(isDragging ? styles.dropAreaActive : {})
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.json"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <div style={styles.uploadIcon}>⬆️</div>
        <div style={styles.dropText}>
          Drag & Drop Files Here
        </div>
        <div style={styles.dropSubtext}>
          or click to browse
        </div>
        <div style={styles.dropSubtext}>
          Supported formats: CSV, JSON (max 10MB per file)
        </div>
      </div>
      
      {/* Template Download */}
      <div style={styles.templateButtons}>
        <button
          style={{
            ...styles.button,
            ...(templateCsvHover ? styles.buttonHover : {})
          }}
          onMouseEnter={() => setTemplateCsvHover(true)}
          onMouseLeave={() => setTemplateCsvHover(false)}
          onClick={() => handleDownloadTemplate('csv')}
        >
          ⬇️ Download CSV Template
        </button>
        <button
          style={{
            ...styles.button,
            ...(templateJsonHover ? styles.buttonHover : {})
          }}
          onMouseEnter={() => setTemplateJsonHover(true)}
          onMouseLeave={() => setTemplateJsonHover(false)}
          onClick={() => handleDownloadTemplate('json')}
        >
          ⬇️ Download JSON Template
        </button>
      </div>
      
      {/* File List */}
      {files.length > 0 && (
        <div style={styles.fileList}>
          <div style={styles.fileListHeader}>
            <div style={styles.fileListTitle}>
              Selected Files ({files.length})
            </div>
            <button
              style={{
                ...styles.clearButton,
                ...(clearFilesHover ? { borderColor: '#dc3545', color: '#dc3545' } : {})
              }}
              onMouseEnter={() => setClearFilesHover(true)}
              onMouseLeave={() => setClearFilesHover(false)}
              onClick={handleClearFiles}
            >
              🗑️ Clear All
            </button>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>File Name</th>
                <th style={styles.tableHeader}>Type</th>
                <th style={styles.tableHeader}>Size</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader} align="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{file.name}</td>
                  <td style={styles.tableCell}>{file.name.split('.').pop()?.toUpperCase()}</td>
                  <td style={styles.tableCell}>{(file.size / 1024).toFixed(1)} KB</td>
                  <td style={styles.tableCell}>
                    {file.error ? (
                      <div style={{...styles.fileStatus, ...styles.fileStatusError}}>
                        <span style={styles.fileStatusIcon}>❌</span>
                        {file.error}
                      </div>
                    ) : (
                      <div style={{...styles.fileStatus, ...styles.fileStatusSuccess}}>
                        <span style={styles.fileStatusIcon}>✅</span>
                        Valid
                      </div>
                    )}
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'right' as const}}>
                    <button
                      style={styles.removeButton}
                      onClick={() => handleRemoveFile(index)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Data Preview */}
      {previewData && (
        <div style={styles.previewContainer}>
          <h3 style={styles.previewHeader}>
            Data Preview
          </h3>
          
          <div style={styles.previewStats}>
            <div>Total Categories: {previewData.totalCategories}</div>
            <div>Total Questions: {previewData.totalQuestions}</div>
          </div>
          
          {files.some(f => f.name.endsWith('.json')) && (
            <div style={styles.accordion}>
              <div 
                style={styles.accordionHeader}
                onClick={() => setJsonPreviewOpen(!jsonPreviewOpen)}
              >
                <span>JSON Structure Preview</span>
                <span>{jsonPreviewOpen ? '▼' : '▶'}</span>
              </div>
              {jsonPreviewOpen && (
                <div style={styles.accordionContent}>
                  <pre style={styles.previewCode}>
                    {JSON.stringify(previewData.categories, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {files.some(f => f.name.endsWith('.csv')) && (
            <div style={styles.accordion}>
              <div 
                style={styles.accordionHeader}
                onClick={() => setCsvPreviewOpen(!csvPreviewOpen)}
              >
                <span>CSV Content Preview</span>
                <span>{csvPreviewOpen ? '▼' : '▶'}</span>
              </div>
              {csvPreviewOpen && (
                <div style={styles.accordionContent}>
                  <pre style={styles.previewCode}>
                    {files
                      .filter(f => f.name.endsWith('.csv'))
                      .map(f => f.data?.previewLines || '')
                      .join('\n\n')}
                  </pre>
                  <div style={styles.helpText}>
                    Showing first 10 lines of each CSV file
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Upload Options */}
      <div style={styles.optionsContainer}>
        <h3 style={styles.optionsHeader}>
          Upload Options
        </h3>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="duplicateStrategy">
            Duplicate Strategy
          </label>
          <select
            id="duplicateStrategy"
            style={styles.formSelect}
            value={uploadOptions.duplicateStrategy}
            onChange={(e) => handleOptionChange('duplicateStrategy', e.target.value)}
          >
            <option value="skip">Skip (preserve existing)</option>
            <option value="update">Update (overwrite existing)</option>
            <option value="error">Error (fail on duplicates)</option>
          </select>
          <div style={styles.helpText}>
            How to handle duplicate categories and questions
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="batchSize">
            Batch Size
          </label>
          <input
            id="batchSize"
            type="number"
            style={styles.formInput}
            value={uploadOptions.batchSize}
            onChange={(e) => handleOptionChange('batchSize', Math.min(Math.max(parseInt(e.target.value) || 1, 1), 500))}
            min="1"
            max="500"
          />
          <div style={styles.helpText}>
            Number of items to process in each batch (1-500)
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <div style={styles.switchContainer}>
            <input
              id="dryRun"
              type="checkbox"
              checked={uploadOptions.dryRun}
              onChange={(e) => handleOptionChange('dryRun', e.target.checked)}
            />
            <label style={styles.switchLabel} htmlFor="dryRun">
              Dry Run (Validate Only)
            </label>
          </div>
          <div style={styles.helpText}>
            Check this to validate your data without actually uploading it
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div style={styles.submitContainer}>
        <button
          style={{
            ...styles.primaryButton,
            ...(submitButtonHover ? styles.primaryButtonHover : {}),
            ...(isUploading || files.length === 0 || files.every(f => !!f.error) ? styles.disabledButton : {})
          }}
          disabled={isUploading || files.length === 0 || files.every(f => !!f.error)}
          onClick={handleSubmit}
          onMouseEnter={() => setSubmitButtonHover(true)}
          onMouseLeave={() => setSubmitButtonHover(false)}
        >
          {isUploading ? 
            `${uploadProgress < 100 ? 'Uploading...' : 'Processing...'}` : 
            (uploadOptions.dryRun ? 'Validate Data' : 'Upload Data')}
        </button>
      </div>
      
      {/* Upload Progress */}
      {isUploading && (
        <div style={styles.progressContainer}>
          <div style={styles.progressLabel}>
            Upload Progress
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${uploadProgress}%`
              }}
            ></div>
          </div>
          <div style={styles.progressText}>
            {uploadProgress}%
          </div>
        </div>
      )}
      
      {/* Upload Results */}
      {uploadResult && (
        <div style={styles.resultContainer}>
          <div style={styles.resultHeader}>
            <h3 style={styles.resultTitle}>
              Upload Results
            </h3>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              {uploadResult.dryRun && (
                <span style={{...styles.resultChip, ...styles.resultChipInfo}}>
                  Dry Run
                </span>
              )}
              <span style={{
                ...styles.resultChip,
                ...(uploadResult.success ? styles.resultChipSuccess : styles.resultChipError)
              }}>
                {uploadResult.success ? "Success" : "Failed"}
              </span>
            </div>
          </div>
          
          <div style={{
            ...styles.alertContainer,
            ...(uploadResult.success ? styles.alertSuccess : styles.alertError)
          }}>
            <div style={styles.alertTitle}>
              {uploadResult.success ? "Success" : "Error"}
            </div>
            {uploadResult.message}
          </div>
          
          <div style={styles.statsGrid}>
            <div style={styles.statsCard}>
              <div style={{...styles.statsNumber, ...styles.statsNumberPrimary}}>
                {uploadResult.processed.categories}
              </div>
              <div style={styles.statsLabel}>Categories Processed</div>
            </div>
            <div style={styles.statsCard}>
              <div style={{...styles.statsNumber, ...styles.statsNumberSuccess}}>
                {uploadResult.created.categories}
              </div>
              <div style={styles.statsLabel}>Categories Created</div>
            </div>
            <div style={styles.statsCard}>
              <div style={{...styles.statsNumber, ...styles.statsNumberInfo}}>
                {uploadResult.updated.categories}
              </div>
              <div style={styles.statsLabel}>Categories Updated</div>
            </div>
            <div style={styles.statsCard}>
              <div style={{...styles.statsNumber, ...styles.statsNumberWarning}}>
                {uploadResult.skipped.categories}
              </div>
              <div style={styles.statsLabel}>Categories Skipped</div>
            </div>
            
            <div style={styles.statsCard}>
              <div style={{...styles.statsNumber, ...styles.statsNumberPrimary}}>
                {uploadResult.processed.questions}
              </div>
              <div style={styles.statsLabel}>Questions Processed</div>
            </div>
            <div style={styles.statsCard}>
              <div style={{...styles.statsNumber, ...styles.statsNumberSuccess}}>
                {uploadResult.created.questions}
              </div>
              <div style={styles.statsLabel}>Questions Created</div>
            </div>
            <div style={styles.statsCard}>
              <div style={{...styles.statsNumber, ...styles.statsNumberInfo}}>
                {uploadResult.updated.questions}
              </div>
              <div style={styles.statsLabel}>Questions Updated</div>
            </div>
            <div style={styles.statsCard}>
              <div style={{...styles.statsNumber, ...styles.statsNumberWarning}}>
                {uploadResult.skipped.questions}
              </div>
              <div style={styles.statsLabel}>Questions Skipped</div>
            </div>
          </div>
          
          {/* Errors */}
          {uploadResult.errors.length > 0 && (
            <div style={styles.accordion}>
              <div 
                style={styles.accordionHeader}
                onClick={() => setErrorsOpen(!errorsOpen)}
              >
                <span>
                  ❌ Errors ({uploadResult.errors.length})
                </span>
                <span>{errorsOpen ? '▼' : '▶'}</span>
              </div>
              {errorsOpen && (
                <div style={styles.accordionContent}>
                  <table style={styles.errorsTable}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Line</th>
                        <th style={styles.tableHeader}>Category</th>
                        <th style={styles.tableHeader}>Question</th>
                        <th style={styles.tableHeader}>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResult.errors.map((error, index) => (
                        <tr key={index}>
                          <td style={styles.tableCell}>{error.line || '-'}</td>
                          <td style={styles.tableCell}>{error.category || '-'}</td>
                          <td style={styles.tableCell}>{error.question || '-'}</td>
                          <td style={styles.tableCell}>{error.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div style={styles.actionButtons}>
            {uploadResult.dryRun && uploadResult.success && (
              <button
                style={{
                  ...styles.primaryButton,
                  ...(proceedButtonHover ? styles.primaryButtonHover : {}),
                  ...(isUploading ? styles.disabledButton : {})
                }}
                disabled={isUploading}
                onClick={() => {
                  setUploadOptions(prev => ({ ...prev, dryRun: false }));
                  handleSubmit();
                }}
                onMouseEnter={() => setProceedButtonHover(true)}
                onMouseLeave={() => setProceedButtonHover(false)}
              >
                Proceed with Actual Upload
              </button>
            )}
            
            <button
              style={{
                ...styles.button,
                ...(clearResultsHover ? styles.buttonHover : {})
              }}
              onClick={() => setUploadResult(null)}
              onMouseEnter={() => setClearResultsHover(true)}
              onMouseLeave={() => setClearResultsHover(false)}
            >
              🔄 Clear Results
            </button>
          </div>
        </div>
      )}
      
      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div style={{
          ...styles.snackbar,
          ...(snackbar.type === 'success' ? styles.snackbarSuccess :
              snackbar.type === 'error' ? styles.snackbarError :
              styles.snackbarInfo)
        }}>
          {snackbar.message}
        </div>
      )}
    </>
  );

  return (
    <TwoColumnLayout 
      title="Bulk Upload"
      titleAlign="top"
    >
      {content}
    </TwoColumnLayout>
  );
};

export default BulkUploadSimple;
