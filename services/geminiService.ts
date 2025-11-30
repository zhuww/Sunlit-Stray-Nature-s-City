import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateHotelStory = async (hotelName: string, region: string): Promise<string> => {
  if (!ai) return "The hotel owner welcomes you warmly. 'Pay your rent on time!' he grumbles.";

  try {
    const prompt = `
      You are the narrator of a game. The player just pressed a button outside a hotel named "${hotelName}" in the ${region} region.
      Write a 2-sentence intriguing short story or rumor about this hotel.
      Maybe it's haunted, maybe a celebrity stays there, or maybe the owner is a secret agent.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "A strange chill runs down your spine as you approach the door.";
  }
};
