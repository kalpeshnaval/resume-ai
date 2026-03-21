"use client";

import { toPng } from "html-to-image";
import jsPDF from "jspdf";

type ExportPdfOptions = {
  element: HTMLElement;
  fileName: string;
};

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

async function loadImageDimensions(dataUrl: string) {
  const image = new Image();
  image.src = dataUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load generated preview image."));
  });

  return {
    width: image.width,
    height: image.height,
  };
}

export async function exportElementToPdf({ element, fileName }: ExportPdfOptions) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1.5, 2);
  const width = element.scrollWidth;
  const height = element.scrollHeight;

  const dataUrl = await toPng(element, {
    backgroundColor: "#ffffff",
    cacheBust: true,
    pixelRatio,
    skipAutoScale: true,
    width,
    height,
    canvasWidth: width * pixelRatio,
    canvasHeight: height * pixelRatio,
    style: {
      transform: "none",
      transformOrigin: "top left",
    },
  });

  const image = await loadImageDimensions(dataUrl);
  const pdf = new jsPDF("p", "mm", "a4");
  const renderedHeight = (image.height * A4_WIDTH_MM) / image.width;

  let remainingHeight = renderedHeight;
  let offsetY = 0;

  pdf.addImage(dataUrl, "PNG", 0, offsetY, A4_WIDTH_MM, renderedHeight, undefined, "FAST");
  remainingHeight -= A4_HEIGHT_MM;

  while (remainingHeight > 0) {
    offsetY = remainingHeight - renderedHeight;
    pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, offsetY, A4_WIDTH_MM, renderedHeight, undefined, "FAST");
    remainingHeight -= A4_HEIGHT_MM;
  }

  pdf.save(fileName);
}
