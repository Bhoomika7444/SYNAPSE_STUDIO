/**
 * AI image generation provider.
 *
 * Primary: Google's Gemini / Imagen image-generation model when a valid GEMINI_API_KEY is configured.
 * Fallback: Free high-quality Pollinations AI service when GEMINI_API_KEY is invalid/missing/gsk key.
 */

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildEnhancedPrompt(prompt, actionType, hasCanvasImage) {
  const referenceNote = hasCanvasImage
    ? "Use the provided sketch ONLY as a rough concept/idea reference. Do NOT copy the rough lines or shaky strokes. Instead, create a completely new, professionally designed image inspired by the general concept shown. "
    : "";

  switch (actionType) {
    case "logo":
      return `${referenceNote}Create a professional, modern, clean logo design: ${prompt}. The logo must be crisp, sharp, vector-quality with perfect lines and shapes. Minimalist, memorable, suitable for branding. Clean solid background. No rough edges or sketchy lines.`;
    case "enhance":
      return `${referenceNote}Create a polished, professional version of this concept: ${prompt}. Transform into a refined, high-quality design with clean lines, perfect shapes, and professional aesthetics. Remove all roughness and imperfections.`;
    case "3d":
      return `${referenceNote}Create a stunning professional 3D render: ${prompt}. High-quality 3D visualization with realistic lighting, clean geometry, smooth surfaces, and dramatic shadows. Professional quality.`;
    case "animation":
      return `${referenceNote}Create a professional animation-ready frame: ${prompt}. Clean vector-style art with smooth lines, vibrant colors, and professional animation quality. No rough sketchy elements.`;
    default:
      return `${referenceNote}Create a beautiful, professional, clean image: ${prompt}. High quality with crisp details, smooth lines, and polished finish. Transform any rough concepts into refined artwork.`;
  }
}

function parseDataUrl(dataUrl) {
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

async function generateWithPollinations(prompt, actionType) {
  const enhancedPrompt = buildEnhancedPrompt(prompt, actionType, false);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=768&height=768&nologo=true&seed=${seed}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AI generation service error: ${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const contentType = res.headers.get("content-type") || "image/jpeg";

  return {
    imageUrl: `data:${contentType};base64,${base64}`,
    description: `Generated AI ${actionType || "image"} for "${prompt}"`,
  };
}

/**
 * @param {Object} opts
 * @param {string} opts.prompt - user's text description
 * @param {string} [opts.canvasImage] - base64 data URL of the canvas sketch
 * @param {string} opts.actionType - "logo" | "enhance" | "3d" | "animation" | "default"
 * @returns {Promise<{ imageUrl: string, description: string }>}
 */
export async function generateImage({ prompt, canvasImage, actionType }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Check if API key is present and looks like a valid Google AI Studio key (starts with AIza...)
  const isValidGeminiKey = apiKey && apiKey.startsWith("AIza");

  if (!isValidGeminiKey) {
    console.log("Using free AI image generation fallback (Pollinations AI)...");
    try {
      return await generateWithPollinations(prompt, actionType);
    } catch (pollinationsErr) {
      console.error("Pollinations AI error:", pollinationsErr);
    }
  }

  const enhancedPrompt = buildEnhancedPrompt(prompt, actionType, !!canvasImage);
  const parts = [];

  if (canvasImage) {
    const parsed = parseDataUrl(canvasImage);
    parts.push({
      text: `I'm providing a rough sketch as inspiration ONLY. Do not replicate the messy/shaky lines. Instead, understand the general concept/idea and create a completely NEW, professionally designed image. ${enhancedPrompt}`,
    });
    if (parsed) {
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data,
        },
      });
    }
  } else {
    parts.push({ text: enhancedPrompt });
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Gemini API error status:", response.status, errorText);

      // If invalid API key or bad request error, fallback to free AI provider automatically
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        console.log("Gemini API key rejected, falling back to free AI provider...");
        return await generateWithPollinations(prompt, actionType);
      }

      let providerMessage = "";
      try {
        providerMessage = JSON.parse(errorText)?.error?.message || "";
      } catch {}

      if (response.status === 429) {
        const err = new Error("Rate limit exceeded. Please try again in a moment.");
        err.status = 429;
        throw err;
      }

      throw new Error(providerMessage || `AI provider error: ${response.status}`);
    }

    const data = await response.json();
    const responseParts = data?.candidates?.[0]?.content?.parts || [];

    const imagePart = responseParts.find((p) => p.inlineData);
    const textPart = responseParts.find((p) => p.text);

    if (!imagePart) {
      console.log("No image in Gemini response, falling back to free AI provider...");
      return await generateWithPollinations(prompt, actionType);
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return {
      imageUrl,
      description: textPart?.text || "Image generated successfully",
    };
  } catch (err) {
    console.warn("Gemini API attempt failed, using free AI provider fallback:", err.message);
    return await generateWithPollinations(prompt, actionType);
  }
}
