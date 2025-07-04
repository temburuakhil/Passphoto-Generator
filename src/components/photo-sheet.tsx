"use client";

import { useEffect, useRef } from "react";

interface PhotoSheetProps {
  processedImageUri: string;
  onSheetReady: (dataUri: string) => void;
  onError: () => void;
}

export function PhotoSheet({ processedImageUri, onSheetReady, onError }: PhotoSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!processedImageUri || !canvasRef.current) return;

    const generateSheet = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const DPI = 300;
      const SHEET_WIDTH_IN = 4;
      const SHEET_HEIGHT_IN = 6;
      const PHOTO_WIDTH_IN = 2;
      const PHOTO_HEIGHT_IN = 2;
      const RED_BACKGROUND = "#FF0000";

      const SHEET_WIDTH_PX = SHEET_WIDTH_IN * DPI;
      const SHEET_HEIGHT_PX = SHEET_HEIGHT_IN * DPI;
      const PHOTO_WIDTH_PX = PHOTO_WIDTH_IN * DPI;
      const PHOTO_HEIGHT_PX = PHOTO_HEIGHT_IN * DPI;

      canvas.width = SHEET_WIDTH_PX;
      canvas.height = SHEET_HEIGHT_PX;

      // Fill sheet with a white background for printing
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, SHEET_WIDTH_PX, SHEET_HEIGHT_PX);

      const userImage = new Image();
      userImage.crossOrigin = "anonymous";
      userImage.src = processedImageUri;

      userImage.onload = () => {
        // Create an off-screen canvas for a single photo with red background
        const photoCanvas = document.createElement('canvas');
        photoCanvas.width = PHOTO_WIDTH_PX;
        photoCanvas.height = PHOTO_HEIGHT_PX;
        const photoCtx = photoCanvas.getContext('2d');

        if (!photoCtx) {
          onError();
          return;
        }

        // Add red background
        photoCtx.fillStyle = RED_BACKGROUND;
        photoCtx.fillRect(0, 0, PHOTO_WIDTH_PX, PHOTO_HEIGHT_PX);

        // Draw user image on top of the red background
        // This will scale the image to fit the 2x2 inch square.
        // For passport photos, you'd typically want to preserve aspect ratio and center,
        // but for this implementation, we'll stretch to fit as a default.
        photoCtx.drawImage(userImage, 0, 0, PHOTO_WIDTH_PX, PHOTO_HEIGHT_PX);

        // Arrange 6 photos (2x3 grid) on the 4x6 sheet
        const COLS = 2;
        const ROWS = 3;
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            ctx.drawImage(
              photoCanvas,
              col * PHOTO_WIDTH_PX,
              row * PHOTO_HEIGHT_PX
            );
          }
        }
        
        onSheetReady(canvas.toDataURL("image/png"));
      };

      userImage.onerror = () => {
        console.error("Failed to load processed image for canvas.");
        onError();
      };
    };

    generateSheet();
  }, [processedImageUri, onSheetReady, onError]);

  return <canvas ref={canvasRef} className="hidden" aria-hidden="true" />;
}
