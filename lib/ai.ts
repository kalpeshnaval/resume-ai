import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ResumeData } from "@/app/builder/page";

// Access your API key as an environment variable
// Make sure to add this to your .env or .env.local file
const apiKey = process.env.GEMINI_API_KEY || "";

// Initialize the Google Generative AI with the API key
export const genAI = new GoogleGenerativeAI(apiKey);
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type ResumeReferenceFile = {
  name: string;
  type: string;
  data: string;
};

type CoverLetterInput = {
  companyName: string;
  companyAddress?: string;
  userContext?: string;
  resumeFile?: ResumeReferenceFile | null;
};

function getTextModel() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  return genAI.getGenerativeModel({ model: modelName });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Gemini error.";
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI did not return a valid JSON object.");
  }

  return text.slice(start, end + 1);
}

function normalizeResumeData(data: ResumeData) {
  return {
    personalInfo: {
      fullName: data.personalInfo?.fullName ?? "",
      email: data.personalInfo?.email ?? "",
      phone: data.personalInfo?.phone ?? "",
      location: data.personalInfo?.location ?? "",
      summary: data.personalInfo?.summary ?? "",
    },
    experience: (data.experience ?? []).map((item, index) => ({
      id: item.id?.trim() || `exp-${index + 1}`,
      title: item.title ?? "",
      company: item.company ?? "",
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
      description: item.description ?? "",
    })),
    education: (data.education ?? []).map((item, index) => ({
      id: item.id?.trim() || `edu-${index + 1}`,
      degree: item.degree ?? "",
      school: item.school ?? "",
      year: item.year ?? "",
    })),
    skills: data.skills ?? "",
  } satisfies ResumeData;
}

/**
 * Utility to generate a cover letter using Gemini's API.
 */
export async function generateCoverLetter({
  companyName,
  companyAddress,
  userContext,
  resumeFile,
}: CoverLetterInput) {
  const model = getTextModel();

  const promptParts: Array<
    | string
    | {
        inlineData: {
          mimeType: string;
          data: string;
        };
      }
  > = [
    `You are an expert career coach and professional copywriter.

Write a polished, realistic cover letter for a candidate applying to ${companyName}${companyAddress ? `, located at ${companyAddress}` : ""}.

Candidate notes:
${userContext?.trim() || "A highly motivated professional looking to add direct value."}

Instructions:
- Use the uploaded resume as the primary source of truth when it is provided.
- Infer the strongest achievements, skills, and domain fit from the resume instead of inventing random facts.
- Keep the letter natural, specific, and modern.
- Avoid placeholders like [Your Name], [Company], or generic filler.
- Never output bracketed placeholders such as [Current Date], [Hiring Manager], [Company Address], or similar.
- If a detail like company address is unknown, omit it naturally instead of writing a placeholder.
- Keep it to roughly 220-320 words so it fits on a single polished cover-letter page.
- Return plain text only with normal paragraph breaks. No markdown, no bullet points, no code fences.`,
  ];

  if (resumeFile?.data && resumeFile.type) {
    promptParts.push({
      inlineData: {
        mimeType: resumeFile.type,
        data: resumeFile.data,
      },
    });
  }

  try {
    const result = await model.generateContent(promptParts);
    return result.response.text();
  } catch (error) {
    throw new Error(`Gemini cover letter request failed with model "${modelName}": ${getErrorMessage(error)}`);
  }
}

/**
 * Utility to enhance a resume bullet point using Gemini.
 */
export async function enhanceResumeBullet(bulletPoint: string) {
  const model = getTextModel();
  
  const prompt = `
  Enhance the following resume bullet point to make it more impactful, metric-driven, and professional. 
  Original: "${bulletPoint}"
  
  Respond with ONLY the enhanced bullet point text, nothing else.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    throw new Error(`Gemini bullet enhancement failed with model "${modelName}": ${getErrorMessage(error)}`);
  }
}

/**
 * Chat with AI to suggest improvements or draft new content based on user instructions.
 */
export async function chatWithAI(instructions: string, currentResumeData: ResumeData) {
  const model = getTextModel();
  
  const prompt = `
  You are an expert resume assistant. Update the resume JSON directly based on the user's instructions.
  User Instructions: "${instructions}"
  Current Resume Data (JSON): ${JSON.stringify(currentResumeData)}

  Return valid JSON only with this exact shape:
  {
    "message": "short human-readable summary of what you changed",
    "updatedData": {
      "personalInfo": {
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "summary": "string"
      },
      "experience": [
        {
          "id": "string",
          "title": "string",
          "company": "string",
          "startDate": "string",
          "endDate": "string",
          "description": "string"
        }
      ],
      "education": [
        {
          "id": "string",
          "degree": "string",
          "school": "string",
          "year": "string"
        }
      ],
      "skills": "string"
    }
  }

  Rules:
  - Always return the full updatedData object, not partial fields.
  - Preserve existing information unless the user asked to replace it.
  - If the user asks to add content, write the new content into updatedData.
  - If the request is not resume-edit related, keep updatedData unchanged and explain that briefly in message.
  - Do not wrap the JSON in markdown fences.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const parsed = JSON.parse(extractJsonObject(text)) as {
      message: string;
      updatedData: ResumeData;
    };

    return {
      message: parsed.message,
      updatedData: normalizeResumeData(parsed.updatedData),
    };
  } catch (error) {
    throw new Error(`Gemini chat request failed with model "${modelName}": ${getErrorMessage(error)}`);
  }
}

export async function extractResumeDataFromFile(resumeFile: ResumeReferenceFile) {
  const model = getTextModel();

  const promptParts: Array<
    | string
    | {
        inlineData: {
          mimeType: string;
          data: string;
        };
      }
  > = [
    `You are an expert resume parser and career assistant.

Extract the candidate information from the uploaded resume and return valid JSON only with this exact shape:
{
  "message": "short human-readable summary of what you extracted",
  "updatedData": {
    "personalInfo": {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "summary": "string"
    },
    "experience": [
      {
        "id": "string",
        "title": "string",
        "company": "string",
        "startDate": "string",
        "endDate": "string",
        "description": "string"
      }
    ],
    "education": [
      {
        "id": "string",
        "degree": "string",
        "school": "string",
        "year": "string"
      }
    ],
    "skills": "comma separated skill list"
  }
}

Rules:
- Use the uploaded resume as the source of truth.
- Keep the content professional and concise.
- If a field is missing, return an empty string.
- Merge repeated bullet points for the same role into a readable description paragraph.
- Skills must be returned as a comma-separated string.
- Give stable ids like exp-1, exp-2, edu-1, edu-2.
- Return JSON only. Do not wrap it in markdown fences.`,
    {
      inlineData: {
        mimeType: resumeFile.type,
        data: resumeFile.data,
      },
    },
  ];

  try {
    const result = await model.generateContent(promptParts);
    const text = result.response.text().trim();
    const parsed = JSON.parse(extractJsonObject(text)) as {
      message: string;
      updatedData: ResumeData;
    };

    return {
      message: parsed.message,
      updatedData: normalizeResumeData(parsed.updatedData),
    };
  } catch (error) {
    throw new Error(`Gemini resume extraction failed with model "${modelName}": ${getErrorMessage(error)}`);
  }
}
