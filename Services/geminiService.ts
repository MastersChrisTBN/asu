
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, Resolution } from "../types";

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Menginisialisasi AI client baru setiap kali dipanggil 
   * untuk memastikan mendapatkan API Key terbaru dari dialog.
   */
  private getAIClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Menghasilkan gambar gratis menggunakan Gemini 2.5 Flash Image
   */
  public async generateImage(prompt: string): Promise<string> {
    const ai = this.getAIClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Data = "";
      // Iterasi parts untuk mencari inlineData (gambar)
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Data) throw new Error("AI tidak memberikan data gambar.");
      return `data:image/png;base64,${base64Data}`;
    } catch (error: any) {
      console.error("Image Gen Error:", error);
      throw error;
    }
  }

  public async generateVideoFromImage(
    imageBase64: string,
    prompt: string,
    aspectRatio: AspectRatio = AspectRatio.LANDSCAPE,
    resolution: Resolution = Resolution.R720P,
    onProgress: (msg: string) => void
  ): Promise<string> {
    const ai = this.getAIClient();
    
    onProgress("Mengunggah data ke server...");

    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Buat animasi sinematik yang mengalir mulus dari foto ini',
        image: {
          imageBytes: cleanBase64,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: resolution,
          aspectRatio: aspectRatio
        }
      });

      const reassuranceMessages = [
        "Menganalisis elemen gambar...",
        "Menghitung pergerakan 3D...",
        "Menambahkan efek pencahayaan...",
        "Menyempurnakan setiap frame...",
        "Hampir selesai...",
        "Melakukan render akhir..."
      ];

      let msgIndex = 0;
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        if (msgIndex < reassuranceMessages.length) {
          onProgress(reassuranceMessages[msgIndex]);
          msgIndex++;
        }

        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      onProgress("Mengunduh hasil video...");
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!downloadLink) {
        throw new Error("Gagal mendapatkan link video.");
      }

      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) {
        throw new Error("Gagal mengunduh berkas video.");
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (error: any) {
      console.error("Gemini Video Error:", error);
      
      const errorStr = JSON.stringify(error);
      if (errorStr.includes("Requested entity was not found") || errorStr.includes("404")) {
        throw new Error("RESELECT_KEY");
      }
      
      throw error;
    }
  }
}
