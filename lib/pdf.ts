"use client";

import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";

type ExportPdfOptions = {
  element: HTMLElement;
  fileName: string;
  backgroundColor?: string;
};

type ExportTextPdfOptions = {
  text: string;
  fileName: string;
};

type CoverLetterTemplate = "classic" | "modern" | "minimal" | "executive" | "editorial" | "midnight";

type ExportCoverLetterPdfOptions = {
  text: string;
  fileName: string;
  template: CoverLetterTemplate;
  companyName?: string;
  companyAddress?: string;
  letterDate?: string;
};

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const ROW_SCAN_ALPHA_THRESHOLD = 24;
const CONTINUED_PAGE_TOP_MM = 12;
const SPLIT_PAGE_BOTTOM_MM = 12;
const PAGE_BREAK_TOLERANCE_PX = 8;

function findNaturalPageBreak(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  preferredRow: number,
  minRow: number,
  maxRow: number,
) {
  const startRow = Math.max(minRow, preferredRow - 140);
  const endRow = Math.min(maxRow, preferredRow + 140);
  const bandRadius = 4;
  let bestRow = preferredRow;
  let bestInkScore = Number.POSITIVE_INFINITY;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let row = startRow; row <= endRow; row += 1) {
    let inkScore = 0;

    for (let sampleRow = Math.max(minRow, row - bandRadius); sampleRow <= Math.min(maxRow, row + bandRadius); sampleRow += 1) {
      const rowData = context.getImageData(0, sampleRow, canvasWidth, 1).data;

      for (let index = 3; index < rowData.length; index += 4) {
        if (rowData[index] > ROW_SCAN_ALPHA_THRESHOLD) {
          inkScore += 1;
        }
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

export async function exportElementToPdf({ element, fileName, backgroundColor = "#ffffff" }: ExportPdfOptions) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1.5, 2);
  const baseWidth = element.scrollWidth || element.clientWidth;
  const backgroundRgb = hexToRgb(backgroundColor);

  const clone = element.cloneNode(true) as HTMLElement;
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${baseWidth}px`;
  wrapper.style.background = backgroundColor;
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
      backgroundColor,
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
    const fullPageSliceHeight = Math.floor((canvas.width * A4_HEIGHT_MM) / A4_WIDTH_MM);
    const canvasContext = canvas.getContext("2d");
    const usesSplitPadding = canvas.height > fullPageSliceHeight + PAGE_BREAK_TOLERANCE_PX;

    if (!canvasContext) {
      throw new Error("Unable to read rendered PDF canvas.");
    }

    let offsetY = 0;
    let pageIndex = 0;

    while (offsetY < canvas.height - PAGE_BREAK_TOLERANCE_PX) {
      const topMarginMm = usesSplitPadding && pageIndex > 0 ? CONTINUED_PAGE_TOP_MM : 0;
      const bottomMarginMm = usesSplitPadding ? SPLIT_PAGE_BOTTOM_MM : 0;
      const usablePageHeightMm = A4_HEIGHT_MM - topMarginMm - bottomMarginMm;
      const sourceSliceHeight = Math.floor((canvas.width * usablePageHeightMm) / A4_WIDTH_MM);
      const remainingHeight = canvas.height - offsetY;
      let currentSliceHeight = Math.min(sourceSliceHeight, remainingHeight);

      if (remainingHeight <= PAGE_BREAK_TOLERANCE_PX) {
        break;
      }

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
      context.fillStyle = backgroundColor;
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

      pdf.setFillColor(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);
      pdf.rect(0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, "F");
      pdf.addImage(pageDataUrl, "PNG", 0, topMarginMm, A4_WIDTH_MM, renderedHeight, undefined, "FAST");
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

function hexToRgb(color: string) {
  const normalized = color.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : normalized;

  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

function getCoverLetterTheme(template: CoverLetterTemplate) {
  switch (template) {
    case "classic":
      return {
        background: "#fffdfa",
        text: "#292524",
        font: "times" as const,
      };
    case "modern":
      return {
        background: "#f8fafc",
        text: "#1e293b",
        font: "helvetica" as const,
      };
    case "minimal":
      return {
        background: "#ffffff",
        text: "#18181b",
        font: "times" as const,
      };
    case "executive":
      return {
        background: "#fcfbf7",
        text: "#0f172a",
        font: "times" as const,
      };
    case "editorial":
      return {
        background: "#fffaf2",
        text: "#78350f",
        font: "times" as const,
      };
    default:
      return {
        background: "#f7f8fb",
        text: "#1e293b",
        font: "helvetica" as const,
      };
  }
}

export function exportCoverLetterToPdf({
  text,
  fileName,
  template,
  companyName,
  companyAddress,
  letterDate,
}: ExportCoverLetterPdfOptions) {
  const pdf = new jsPDF("p", "mm", "a4");
  const horizontalMargin = 18;
  const topMargin = 20;
  const bottomMargin = 20;
  const lineHeight = 7;
  const paragraphGap = 5;
  const maxWidth = A4_WIDTH_MM - horizontalMargin * 2;
  const maxY = A4_HEIGHT_MM - bottomMargin;
  const theme = getCoverLetterTheme(template);
  const backgroundRgb = hexToRgb(theme.background);
  const textRgb = hexToRgb(theme.text);
  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{2,}/);

  const paintPageBackground = () => {
    pdf.setFillColor(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);
    pdf.rect(0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, "F");
    pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setFont(theme.font, "normal");
    pdf.setFontSize(13);
  };

  paintPageBackground();

  let cursorY = topMargin;
  if (letterDate?.trim()) {
    pdf.text(letterDate.trim(), A4_WIDTH_MM - horizontalMargin, cursorY, { align: "right" });
    cursorY += lineHeight + paragraphGap;
  }

  const recipientLines = [companyName?.trim(), companyAddress?.trim()].filter(Boolean) as string[];

  for (const line of recipientLines) {
    pdf.text(line, horizontalMargin, cursorY);
    cursorY += lineHeight;
  }

  if (recipientLines.length > 0) {
    cursorY += paragraphGap;
  }

  for (const paragraph of paragraphs) {
    const content = paragraph.trim();

    if (!content) {
      cursorY += paragraphGap;
      continue;
    }

    const lines = pdf.splitTextToSize(content, maxWidth) as string[];
    const paragraphHeight = lines.length * lineHeight;

    if (cursorY + paragraphHeight > maxY) {
      pdf.addPage();
      paintPageBackground();
      cursorY = topMargin;
    }

    for (const line of lines) {
      pdf.text(line, horizontalMargin, cursorY);
      cursorY += lineHeight;
    }

    cursorY += paragraphGap;
  }

  pdf.save(fileName);
}
