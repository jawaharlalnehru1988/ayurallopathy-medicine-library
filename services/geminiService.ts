
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMedicineInfo = async (medicineName: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide detailed medical information for the following ${category} medicine: ${medicineName}. 
      Include a short description, common ingredients, standard dosage (mentioning "as per doctor advice" if applicable), side effects, and primary benefits.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            ingredients: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            dosageInstructions: { type: Type.STRING, description: "Recommended dosage as per clinical standards or doctor advice" },
            sideEffects: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            benefits: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["description", "ingredients", "dosageInstructions", "sideEffects", "benefits"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const getDiseaseInfo = async (diseaseName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide clinical data for the condition: ${diseaseName}.
      Include symptoms, diagnosing methods, root cause analysis, primary solutions/therapies, 
      and the recommended medical specialist to approach.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            diagnosingMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
            rootCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            solutions: { type: Type.ARRAY, items: { type: Type.STRING } },
            specialist: { type: Type.STRING }
          },
          required: ["name", "symptoms", "diagnosingMethods", "rootCauses", "solutions", "specialist"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Disease Info Error:", error);
    return null;
  }
};
