"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, RotateCcw } from "lucide-react";
import { removeBackground } from "@/ai/flows/background-removal";
import { ImageUploader } from "@/components/image-uploader";
import { PhotoSheet } from "@/components/photo-sheet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Step = "upload" | "loading" | "preview" | "error";

export function RedSnapEditor() {
  const [step, setStep] = useState<Step>("upload");
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [finalSheet, setFinalSheet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (dataUri: string) => {
    setStep("loading");
    setError(null);
    setProcessedImage(null);
    setFinalSheet(null);
    try {
      const result = await removeBackground({ photoDataUri: dataUri });
      if (!result?.processedPhotoDataUri) {
        throw new Error("AI processing failed to return an image.");
      }
      setProcessedImage(result.processedPhotoDataUri);
    } catch (e) {
      console.error(e);
      setError("Failed to remove background. Please try another photo.");
      setStep("error");
    }
  };

  const handleSheetReady = (dataUri: string) => {
    setFinalSheet(dataUri);
    setStep("preview");
  };
  
  const handleStartOver = () => {
    setStep("upload");
    setProcessedImage(null);
    setFinalSheet(null);
    setError(null);
  };

  const renderStep = () => {
    switch (step) {
      case "upload":
        return <ImageUploader onUpload={handleUpload} />;
      
      case "loading":
        return (
          <Card className="w-full max-w-md text-center animate-pulse">
            <CardHeader>
              <CardTitle>Processing Your Photo</CardTitle>
              <CardDescription>Our AI is removing the background. Please wait a moment...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        );
        
      case "preview":
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Your Photos are Ready!</CardTitle>
              <CardDescription>Download the 4x6 sheet below and print it.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {finalSheet && (
                <Image
                  src={finalSheet}
                  alt="Printable sheet of passport photos"
                  width={400}
                  height={600}
                  className="rounded-md border shadow-lg"
                  style={{ width: 'auto', height: 'auto', maxHeight: '400px' }}
                />
              )}
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2">
              <a href={finalSheet!} download="redsnap-passport-photos.png" className="w-full sm:w-auto">
                <Button className="w-full">
                  <Download className="mr-2" /> Download PNG
                </Button>
              </a>
              <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto">
                <RotateCcw className="mr-2" /> Start Over
              </Button>
            </CardFooter>
          </Card>
        );

      case "error":
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>An Error Occurred</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTitle>Processing Failed</AlertTitle>
                        <AlertDescription>{error || 'An unknown error occurred.'}</AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={handleStartOver} className="w-full">
                        <RotateCcw className="mr-2" /> Try Again
                    </Button>
                </CardFooter>
            </Card>
        );
    }
  };

  return (
    <>
      {processedImage && !finalSheet && (
        <PhotoSheet processedImageUri={processedImage} onSheetReady={handleSheetReady} onError={() => {
            setError("Failed to generate the photo sheet.");
            setStep("error");
        }} />
      )}
      {renderStep()}
    </>
  );
}
