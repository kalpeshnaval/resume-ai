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
const ROW_SCAN_ALPHA_THRESHOLD = 24;

function findNaturalPageBreak(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  preferredRow: number,
  minRow: number,
  maxRow: number,
) {
  const startRow = Math.max(minRow, preferredRow - 140);
  const endRow = Math.min(maxRow, preferredRow + 140);
  let bestRow = preferredRow;
  let bestInkScore = Number.POSITIVE_INFINITY;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let row = startRow; row <= endRow; row += 1) {
    const rowData = context.getImageData(0, row, canvasWidth, 1).data;
    let inkScore = 0;

    for (let index = 3; index < rowData.length; index += 4) {
      if (rowData[index] > ROW_SCAN_ALPHA_THRESHOLD) {
        inkScore += 1;
      }
    }

    const distance = Math.abs(preferredRow - row);
    if (inkScore < bestInkScore || (inkScore === bestInkScore && distance < bestDistance)) {
      bestInkScore = inkScore;
      bestDistance = distance;
      bestRow = row;

      if (inkScore === 0 && distance <= 8) {
        break;
      }
    }
  }

  return Math.max(minRow, Math.min(bestRow, maxRow));
}

export async function exportElementToPdf({ element, fileName }: ExportPdfOptions) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1.5, 2);
  const baseWidth = element.scrollWidth || element.clientWidth;

  const clone = element.cloneNode(true) as HTMLElement;
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${baseWidth}px`;
  wrapper.style.background = "#ffffff";
  wrapper.style.padding = "0";
  wrapper.style.margin = "0";
  wrapper.style.zIndex = "-1";
  wrapper.style.overflow = "visible";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";
  clone.style.width = `${baseWidth}px`;
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const sourceNodes = [element, ...Array.from(element.querySelectorAll<HTMLElement>("*"))];
    const cloneNodes = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];

    sourceNodes.forEach((sourceNode, index) => {
      const cloneNode = cloneNodes[index];

      if (!cloneNode) {
        return;
      }

      const computed = window.getComputedStyle(sourceNode);
      const hidesOverflow =
        computed.overflow === "hidden" ||
        computed.overflow === "clip" ||
        computed.overflowX === "hidden" ||
        computed.overflowX === "clip" ||
        computed.overflowY === "hidden" ||
        computed.overflowY === "clip";

      if (index === 0 || hidesOverflow || sourceNode.scrollHeight > sourceNode.clientHeight + 1) {
        cloneNode.style.overflow = "visible";
        cloneNode.style.height = "auto";
        cloneNode.style.maxHeight = "none";
      }

      if (index === 0) {
        cloneNode.style.minHeight = `${sourceNode.clientHeight}px`;
      }
    });

    const width = clone.scrollWidth || clone.clientWidth || baseWidth;
    const height = clone.scrollHeight || clone.clientHeight;

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
        boxShadow: "none",
        border: "none",
        borderRadius: "0",
        height: "auto",
        maxHeight: "none",
        overflow: "visible",
      },
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const sourceSliceHeight = Math.floor((canvas.width * A4_HEIGHT_MM) / A4_WIDTH_MM);
    const canvasContext = canvas.getContext("2d");

    if (!canvasContext) {
      throw new Error("Unable to read rendered PDF canvas.");
    }

    let offsetY = 0;
    let pageIndex = 0;

    while (offsetY < canvas.height) {
      const remainingHeight = canvas.height - offsetY;
      let currentSliceHeight = Math.min(sourceSliceHeight, remainingHeight);

      if (remainingHeight > sourceSliceHeight) {
        const preferredBreak = offsetY + currentSliceHeight;
        const minBreak = Math.max(offsetY + Math.floor(sourceSliceHeight * 0.82), offsetY + 120);
        const maxBreak = Math.min(offsetY + Math.floor(sourceSliceHeight * 0.98), canvas.height - 1);
        const adjustedBreak = findNaturalPageBreak(
          canvasContext,
          canvas.width,
          preferredBreak,
          minBreak,
          maxBreak,
        );

        currentSliceHeight = adjustedBreak - offsetY;
      }

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
      const renderedHeight = (currentSliceHeight * A4_WIDTH_MM) / canvas.width;

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(pageDataUrl, "PNG", 0, 0, A4_WIDTH_MM, renderedHeight, undefined, "FAST");
      offsetY += currentSliceHeight;
      pageIndex += 1;
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(wrapper);
  }
}

export function exportTextToPdf({ text, fileName }: ExportTextPdfOptions) {
  const pdf = new jsPDF("p", "mm", "a4");
  const horizontalMargin = 18;
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
