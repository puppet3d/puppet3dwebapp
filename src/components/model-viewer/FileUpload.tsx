import React, { useCallback, useRef, useState } from "react";
import { CloudUpload, Zap } from "lucide-react";

interface VRMFileUploadProps {
  onFileSelect: (file: File) => void;
  onSampleModelSelect?: () => void;
  isLoading?: boolean;
  error?: Error;
}

export const FileUpload: React.FC<VRMFileUploadProps> = ({
  onFileSelect,
  onSampleModelSelect,
  isLoading = false,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file.name.toLowerCase().endsWith(".vrm")) {
        onFileSelect(file);
      } else {
        alert("Please select a VRM file");
      }
    },
    [onFileSelect],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSampleModelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSampleModelSelect && !isLoading) {
        onSampleModelSelect();
      }
    },
    [onSampleModelSelect, isLoading],
  );

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${isLoading ? "cursor-not-allowed opacity-50" : ""} `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".vrm"
          onChange={handleFileInputChange}
          disabled={isLoading}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <CloudUpload className="h-12 w-12 text-gray-400" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              {isLoading ? "Loading..." : "Drop your VRM file here"}
            </p>
            <p className="mt-1 text-sm text-gray-500">or click to browse</p>
          </div>
        </div>
      </div>

      {onSampleModelSelect && (
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-100 px-2 text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleSampleModelClick}
            disabled={isLoading}
            className={`mt-4 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 font-medium text-blue-700 transition-all duration-200 ${
              isLoading
                ? "cursor-not-allowed opacity-50"
                : "hover:border-blue-300 hover:bg-blue-100"
            } `}
          >
            <div className="flex items-center justify-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Try with Sample Model</span>
            </div>
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}
    </div>
  );
};
