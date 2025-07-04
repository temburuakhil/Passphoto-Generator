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
      const SHEET_HEIGHT_IN = 8;
      // Use a slightly smaller photo size to create space for gaps
      const PHOTO_WIDTH_IN = 1.9;
      const PHOTO_HEIGHT_IN = 1.9; // Keep photos square

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
        // Create an off-screen canvas for a single photo
        const photoCanvas = document.createElement('canvas');
        photoCanvas.width = PHOTO_WIDTH_PX;
        photoCanvas.height = PHOTO_HEIGHT_PX;
        const photoCtx = photoCanvas.getContext('2d');

        if (!photoCtx) {
          onError();
          return;
        }

        // Translate to the center of the canvas, rotate, and then draw the image.
        // This corrects the rotation issue where images appear sideways.
        photoCtx.save();
        photoCtx.translate(PHOTO_WIDTH_PX / 2, PHOTO_HEIGHT_PX / 2);
        photoCtx.rotate(90 * Math.PI / 180); // Rotate 90 degrees clockwise
        
        // Draw the image centered on the new rotated coordinates, stretched to fit.
        photoCtx.drawImage(userImage, -PHOTO_WIDTH_PX / 2, -PHOTO_HEIGHT_PX / 2, PHOTO_WIDTH_PX, PHOTO_HEIGHT_PX);
        photoCtx.restore();

        // Arrange 8 photos (2x4 grid) on the 4x8 sheet with gaps
        const COLS = 2;
        const ROWS = 4;
        
        const totalHorizontalSpace = SHEET_WIDTH_PX - (COLS * PHOTO_WIDTH_PX);
        const horizontalGap = totalHorizontalSpace / (COLS + 1); // Distribute space between photos and as margins
        
        const totalVerticalSpace = SHEET_HEIGHT_PX - (ROWS * PHOTO_HEIGHT_PX);
        const verticalGap = totalVerticalSpace / (ROWS + 1); // Distribute space between photos and as margins

        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const x = horizontalGap + col * (PHOTO_WIDTH_PX + horizontalGap);
            const y = verticalGap + row * (PHOTO_HEIGHT_PX + verticalGap);
            ctx.drawImage(
              photoCanvas,
              x,
              y,
              PHOTO_WIDTH_PX,
              PHOTO_HEIGHT_PX
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
