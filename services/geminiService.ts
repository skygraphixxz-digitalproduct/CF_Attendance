import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractStudentData = async (imageFile: File): Promise<Partial<Student>> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing. Please check your environment variables.");
  }

  try {
    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          imagePart,
          { text: "Extract the Student ID, Full Name, and Department from this ID card image. If the gender is explicitly stated, extract it, otherwise guess based on the name. Return in JSON format." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            department: { type: Type.STRING },
            gender: { type: Type.STRING, enum: ['Male', 'Female', 'Other'] }
          },
          required: ['id', 'name']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data;
    }
    
    throw new Error("No data returned from AI");

  } catch (error) {
    console.error("Error extracting data:", error);
    throw error;
  }
};