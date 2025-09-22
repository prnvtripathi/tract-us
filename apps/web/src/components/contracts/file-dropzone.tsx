import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FileDropzone({ file, setFile }: { file: File | null; setFile: (file: File | null) => void }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        const pdfFile = droppedFiles.find(f => f.type === 'application/pdf');

        if (pdfFile) {
            setFile(pdfFile);
        } else if (droppedFiles.length > 0) {
            toast.error("Please upload a PDF file only");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else if (selectedFile) {
            toast.error("Please upload a PDF file only");
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">AI Contract Analysis (Optional)</p>
                <p>Upload a PDF contract to automatically analyze and detect its content using AI. This will provide insights into contract terms, clauses, and potential issues.</p>
                <p className="text-xs">If no file is uploaded, the contract will be saved without AI analysis.</p>
            </div>

            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragOver
                    ? 'border-primary bg-primary/5'
                    : file
                        ? 'border-green-500 bg-green-50'
                        : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {file ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center">
                            <FileText className="h-12 w-12 text-green-500" />
                        </div>
                        <div>
                            <p className="font-medium text-green-700">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                            }}
                            className="mt-2"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center">
                            <Upload className={`h-12 w-12 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                            <p className="font-medium">
                                {isDragOver ? 'Drop PDF here' : 'Drag & drop PDF here'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                or click to browse files
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Supports PDF files up to 10MB
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}