"use client";

import { toCanvas } from "html-to-image";
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

export async function exportElementToPdf({ element, fileName }: ExportPdfOptions) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1.5, 2);
  const width = element.scrollWidth;
  const height = element.scrollHeight;
  const horizontalMargin = DEFAULT_PAGE_MARGIN_MM;
  const topMargin = 16;
  const bottomMargin = 16;
  const innerWidthMm = A4_WIDTH_MM - horizontalMargin * 2;
  const innerHeightMm = A4_HEIGHT_MM - topMargin - bottomMargin;

  const clone = element.cloneNode(true) as HTMLElement;
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${width}px`;
  wrapper.style.background = "#ffffff";
  wrapper.style.padding = "0";
  wrapper.style.margin = "0";
  wrapper.style.zIndex = "-1";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const canvas = await toCanvas(clone, {
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
  document.body.removeChild(wrapper);

  const pdf = new jsPDF("p", "mm", "a4");
  const sourceSliceHeight = Math.floor((canvas.width * innerHeightMm) / innerWidthMm);

  let offsetY = 0;
  let pageIndex = 0;

  while (offsetY < canvas.height) {
    const remainingHeight = canvas.height - offsetY;
    const currentSliceHeight = Math.min(sourceSliceHeight, remainingHeight);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = currentSliceHeight;

    const context = pageCanvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to create PDF page canvas.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(
      canvas,
      0,
      offsetY,
      canvas.width,
      currentSliceHeight,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height,
    );

    const pageDataUrl = pageCanvas.toDataURL("image/png");
    const renderedHeight = (currentSliceHeight * innerWidthMm) / canvas.width;

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(pageDataUrl, "PNG", horizontalMargin, topMargin, innerWidthMm, renderedHeight, undefined, "FAST");
    offsetY += currentSliceHeight;
    pageIndex += 1;
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
