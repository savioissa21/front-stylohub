"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload, X, ZoomIn, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ImageUploaderWidgetProps {
  onUpload: (blob: Blob) => Promise<void>;
  currentImageUrl?: string;
  className?: string;
}

export function ImageUploaderWidget({
  onUpload,
  currentImageUrl,
  className,
}: ImageUploaderWidgetProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  function onSelectFile(files: File[]) {
    if (files && files.length > 0) {
      setCrop(undefined); // Reset crop when new image is selected
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(files[0]);
      setIsModalOpen(true);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onSelectFile,
    accept: { "image/*": [] },
    multiple: false,
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  }

  async function getCroppedImg(
    image: HTMLImageElement,
    pixelCrop: PixelCrop
  ): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Set canvas size to the desired output size (e.g., 400x400 for thumbnails)
    canvas.width = 400;
    canvas.height = 400;

    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      400,
      400
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.85 // Quality optimization
      );
    });
  }

  const handleConfirmCrop = async () => {
    if (imgRef.current && completedCrop) {
      setIsUploading(true);
      try {
        const blob = await getCroppedImg(imgRef.current, completedCrop);
        await onUpload(blob);
        setIsModalOpen(false);
        setImgSrc("");
      } catch (e) {
        console.error("Error cropping image:", e);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[140px]",
          isDragActive
            ? "border-stylo-gold bg-stylo-gold/10 scale-[1.02]"
            : "border-border hover:border-stylo-gold/50 bg-muted/30"
        )}
      >
        <input {...getInputProps()} />

        {currentImageUrl ? (
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="text-stylo-gold" size={24} />
              <span className="text-white text-xs font-bold uppercase tracking-widest">Trocar imagem</span>
            </div>
          </div>
        ) : (
          <>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
              isDragActive ? "bg-stylo-gold text-black" : "bg-muted text-muted-foreground group-hover:bg-stylo-gold/20 group-hover:text-stylo-gold"
            )}>
              <Upload size={20} />
            </div>
            <p className="text-sm font-medium text-foreground text-center px-4">
              {isDragActive ? "Solte a imagem agora" : "Arraste ou clique para enviar"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tight">JPG, PNG ou WEBP (Max 2MB)</p>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => !isUploading && setIsModalOpen(open)}>
        <DialogContent className="max-w-lg sm:rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="text-stylo-gold" size={20} />
              Ajustar miniatura
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-6 gap-6">
            <div className="relative w-full aspect-square max-w-[320px] overflow-hidden rounded-xl bg-muted/30 border border-border flex items-center justify-center">
              {imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop={false}
                  className="max-h-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{ transform: `scale(${scale})` }}
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[320px]"
                  />
                </ReactCrop>
              )}
            </div>

            <div className="w-full max-w-[320px] space-y-4">
              <div className="flex items-center gap-3">
                <ZoomIn size={16} className="text-muted-foreground" />
                <Slider
                  value={[scale]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={([val]) => setScale(val)}
                  className="flex-1"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Arraste o quadrado para escolher a melhor área da foto.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isUploading}
              className="flex-1 sm:flex-none border-border"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmCrop}
              disabled={isUploading || !completedCrop}
              className="flex-1 sm:flex-none bg-stylo-gold hover:bg-stylo-gold-hover text-black font-bold gap-2"
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Check size={16} />
              )}
              Confirmar Corte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
