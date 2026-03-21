import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ResumeData } from "@/app/builder/page";

// Access your API key as an environment variable
// Make sure to add this to your .env or .env.local file
const apiKey = process.env.GEMINI_API_KEY || "";

// Initialize the Google Generative AI with the API key
export const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Utility to generate a cover letter using Gemini's API.
 */
export async function generateCoverLetter(companyName: string, companyAddress?: string, userContext?: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Use the recommended model for text generation
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  You are an expert career coach and professional copywriter. 
  Write a compelling cover letter for a candidate applying to ${companyName} ${companyAddress ? `located at ${companyAddress}` : ""}.
  
  The candidate's core background / context (if any):
  ${userContext || "A highly motivated professional looking to add direct value."}

  Requirements:
  - Keep it professional, modern, and engaging.
  - Tailor it specifically reflecting insights common for ${companyName}'s industry.
  - Exclude placeholder brackets like [Your Name] as much as possible, keep it readable and fluid.
  - Do NOT output extra markdown around the response like \`\`\`markdown, just the raw text of the letter formatted with appropriate line breaks.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Utility to enhance a resume bullet point using Gemini.
 */
export async function enhanceResumeBullet(bulletPoint: string) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
  Enhance the following resume bullet point to make it more impactful, metric-driven, and professional. 
  Original: "${bulletPoint}"
  
  Respond with ONLY the enhanced bullet point text, nothing else.
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Chat with AI to suggest improvements or draft new content based on user instructions.
 */
export async function chatWithAI(instructions: string, currentResumeData: ResumeData) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
  You are an expert resume assistant. The user wants to modify or add to their resume.
  User Instructions: "${instructions}"
  Current Resume Data (JSON): ${JSON.stringify(currentResumeData)}
  
  Provide a helpful response. If you are suggesting content for a new role or a summary, format it clearly so the user can copy it.
  Keep your response professional and encouraging. 
  Respond briefly and directly to the user's request.
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
