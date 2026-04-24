'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  FileSpreadsheet, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedData {
  success: boolean;
  message: string;
  filename: string;
  row_count: number;
  column_count: number;
  columns: string[];
  data: Record<string, any>[];
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadType: 'products' | 'influencers';
  onUploadComplete?: (data: UploadedData) => void;
}

export default function FileUploadModal({ 
  isOpen, 
  onClose, 
  uploadType,
  onUploadComplete 
}: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = uploadType === 'products' ? '上传电商数据' : '上传达人数据';
  const acceptTypes = '.csv,.xls,.xlsx';
  const apiEndpoint = uploadType === 'products' 
    ? '/api/file-upload/upload/products' 
    : '/api/file-upload/upload/influencers';
  const templateName = uploadType === 'products' 
    ? '电商数据模板' 
    : '小红书达人数据模板';

  const resetState = useCallback(() => {
    setFile(null);
    setUploadResult(null);
    setError(null);
    setIsUploading(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile.name)) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('请上传 CSV、XLS 或 XLSX 格式的文件');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile.name)) {
      setFile(selectedFile);
      setError(null);
    } else if (selectedFile) {
      setError('请上传 CSV、XLS 或 XLSX 格式的文件');
    }
  };

  const isValidFileType = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ['csv', 'xls', 'xlsx'].includes(ext || '');
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'csv') return FileText;
    return FileSpreadsheet;
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '上传失败');
      }

      const data: UploadedData = await response.json();
      setUploadResult(data);
      onUploadComplete?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-800">{title}</h2>
              <p className="text-sm text-secondary-500">支持 CSV、XLS、XLSX 格式</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!uploadResult ? (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200",
                  isDragging 
                    ? "border-primary-400 bg-primary-50" 
                    : file 
                    ? "border-primary-300 bg-primary-50/50" 
                    : "border-secondary-300 hover:border-primary-400 hover:bg-secondary-50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptTypes}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-primary-100 rounded-xl flex items-center justify-center">
                      {(() => {
                        const FileIcon = getFileIcon(file.name);
                        return <FileIcon className="w-8 h-8 text-primary-600" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-800">{file.name}</p>
                      <p className="text-sm text-secondary-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      移除文件
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-xl flex items-center justify-center">
                      <Upload className="w-8 h-8 text-secondary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-700">
                        拖放文件到此处，或点击选择
                      </p>
                      <p className="text-sm text-secondary-500 mt-1">
                        支持 CSV、XLS、XLSX 格式
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-secondary-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-secondary-600">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>没有数据模板？</span>
                  </div>
                  <button 
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    onClick={() => {
                      alert('请从项目目录 data-template 文件夹中获取模板文件:\n- 电商数据模板.csv\n- 电商数据模板.xlsx\n- 小红书达人数据模板.csv\n- 小红书达人数据模板.xlsx');
                    }}
                  >
                    <Download className="w-4 h-4" />
                    下载{templateName}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-lg text-secondary-600 hover:bg-secondary-100 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className={cn(
                    "px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
                    file && !isUploading
                      ? "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700"
                      : "bg-secondary-200 text-secondary-400 cursor-not-allowed"
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      上传
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">上传成功！</p>
                  <p className="text-sm text-green-600 mt-1">
                    成功读取 {uploadResult.row_count} 条数据，共 {uploadResult.column_count} 列
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-secondary-800 mb-3">数据预览</h3>
                <div className="overflow-x-auto rounded-xl border border-secondary-200">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary-50">
                      <tr>
                        {uploadResult.columns.slice(0, 6).map((col, idx) => (
                          <th 
                            key={idx} 
                            className="px-4 py-3 text-left font-medium text-secondary-700 border-b border-secondary-200"
                          >
                            {col}
                          </th>
                        ))}
                        {uploadResult.columns.length > 6 && (
                          <th className="px-4 py-3 text-left font-medium text-secondary-700 border-b border-secondary-200">
                            ...
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResult.data.slice(0, 5).map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-secondary-100 last:border-0">
                          {uploadResult.columns.slice(0, 6).map((col, colIdx) => (
                            <td key={colIdx} className="px-4 py-3 text-secondary-600">
                              {String(row[col] ?? '-')}
                            </td>
                          ))}
                          {uploadResult.columns.length > 6 && (
                            <td className="px-4 py-3 text-secondary-400">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {uploadResult.data.length > 5 && (
                  <p className="text-sm text-secondary-500 mt-2 text-center">
                    还有 {uploadResult.data.length - 5} 条数据未显示
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
                <button
                  onClick={() => {
                    resetState();
                  }}
                  className="px-5 py-2.5 rounded-lg text-secondary-600 hover:bg-secondary-100 font-medium transition-colors"
                >
                  继续上传
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 font-medium transition-colors"
                >
                  完成
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
