"use client";

import { useState, useRef, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onUpload: (dataUri: string) => void;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload a JPG or PNG image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onUpload(e.target?.result as string);
    };
    reader.onerror = () => {
      setError("Could not read the file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Create Your Passport Photos</CardTitle>
        <CardDescription>Upload a photo to get started. We'll handle the rest.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_FILE_TYPES.join(",")}
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="h-12 w-12" />
            <p className="font-semibold">Click or drag file to this area to upload</p>
            <p className="text-xs">Supports: PNG, JPG, JPEG up to {MAX_FILE_SIZE_MB}MB</p>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive text-center">{error}</p>}
      </CardContent>
    </Card>
  );
}
