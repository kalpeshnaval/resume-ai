"use client";

import { toPng } from "html-to-image";
import jsPDF from "jspdf";

type ExportPdfOptions = {
  element: HTMLElement;
  fileName: string;
};

type ExportTextPdfOptions = {
  text: string;
  fileName: string;
};

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const DEFAULT_PAGE_MARGIN_MM = 18;

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

export function exportTextToPdf({ text, fileName }: ExportTextPdfOptions) {
  const pdf = new jsPDF("p", "mm", "a4");
  const horizontalMargin = DEFAULT_PAGE_MARGIN_MM;
  const topMargin = 20;
  const bottomMargin = 20;
  const maxWidth = A4_WIDTH_MM - horizontalMargin * 2;
  const maxY = A4_HEIGHT_MM - bottomMargin;
  const lineHeight = 7;

  pdf.setFont("times", "normal");
  pdf.setFontSize(13);

  let cursorY = topMargin;
  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{2,}/);

  for (const paragraph of paragraphs) {
    const content = paragraph.trim();

    if (!content) {
      cursorY += lineHeight;
      continue;
    }

    const lines = pdf.splitTextToSize(content, maxWidth) as string[];

    for (const line of lines) {
      if (cursorY + lineHeight > maxY) {
        pdf.addPage();
        cursorY = topMargin;
      }

      pdf.text(line, horizontalMargin, cursorY);
      cursorY += lineHeight;
    }

    cursorY += lineHeight * 0.8;
  }

  pdf.save(fileName);
}
