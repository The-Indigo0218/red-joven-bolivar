import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 15000;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

// Cliente del modelo gratuito de Gemini (Google AI Studio) vía API REST.
// Si no hay GEMINI_API_KEY configurada, isEnabled() es false y los hooks de IA
// caen a su heurística por reglas. El front nunca llama aquí — pasa por el back.
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GEMINI_API_KEY')?.trim() || undefined;
    this.model = config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    if (this.apiKey) {
      this.logger.log(`Gemini habilitado (modelo: ${this.model}).`);
    } else {
      this.logger.log('Gemini deshabilitado: usando heurística por reglas.');
    }
  }

  isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  // Pide a Gemini una respuesta y la devuelve como JSON parseado del tipo T.
  // Lanza si algo falla (el llamador debe capturar y caer a la heurística).
  async generateJson<T>(prompt: string): Promise<T> {
    const raw = await this.generateText(prompt, true);
    return JSON.parse(this.stripFences(raw)) as T;
  }

  async generateText(prompt: string, jsonMode = false): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY no configurada');
    }

    const url = `${BASE_URL}/${this.model}:generateContent?key=${this.apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Gemini HTTP ${res.status}: ${detail.slice(0, 200)}`);
    }

    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || text.length === 0) {
      throw new Error('Respuesta de Gemini vacía o sin texto');
    }
    return text;
  }

  // Quita las vallas ```json ... ``` que el modelo a veces agrega.
  private stripFences(text: string): string {
    return text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }
}
