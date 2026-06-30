import OpenAI from 'openai';
import logger from '../utils/logger.js';

class DeepSeekService {
  constructor() {
    // Initialize OpenAI client pointing to DeepSeek API
    // Check if key exists to avoid crash on instantiation
    if (process.env.DEEPSEEK_API_KEY) {
        this.client = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.DEEPSEEK_API_KEY
        });
    } else {
        logger.warn('DEEPSEEK_API_KEY is missing. AI features will be disabled.');
        this.client = null;
    }
  }

  async generateAdCopy(productName, category) {
    if (!this.client) {
      logger.warn('DeepSeek Client not initialized. Skipping ad generation.');
      return null;
    }

    try {
      const prompt = `
        You are an expert marketing copywriter for a smart shopping cart system.
        Product: "${productName}"
        Category: "${category}"

        Generate a compelling, short ad copy (max 100 chars) to display on the cart screen when this product is scanned.
        Also suggest a cross-sell product category or item.

        Return ONLY a raw JSON object with the following format:
        {
          "ad_copy": "string",
          "cross_sell": "string"
        }
      `;

      const completion = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "deepseek-chat", // or "deepseek-coder" depending on availability, assuming 'deepseek-chat' is standard
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      return JSON.parse(content);

    } catch (error) {
      logger.error('DeepSeek AI Error:', error);
      return null;
    }
  }

  async generateContextualAd(cartItems, scannedItem) {
    if (!this.client) {
      logger.warn('DeepSeek Client not initialized. Skipping contextual ad generation.');
      return null;
    }

    try {
      const cartContext = cartItems && cartItems.length > 0 ? cartItems.join(', ') : "Empty Cart";

      const prompt = `
        User has [${cartContext}]. They just scanned [${scannedItem}]. Suggest a recipe-based cross-sell ad.
        Return ONLY a raw JSON object with the following format:
        { "ad_headline": "string", "ad_body": "string", "discount_code": "string" }
      `;

      const completion = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "deepseek-chat",
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      return JSON.parse(content);

    } catch (error) {
      logger.error('DeepSeek AI Contextual Ad Error:', error);
      return null;
    }
  }
}

export default new DeepSeekService();
