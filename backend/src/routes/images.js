import { Router } from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import GeneratedImage from "../models/GeneratedImage.js";
import { requireAuth } from "../middleware/auth.js";
import { generateImage } from "../utils/generateImage.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

async function assertProjectOwnership(projectId, userId) {
  if (!isValidId(projectId)) return null;
  return Project.findOne({ _id: projectId, user: userId });
}

// GET /api/projects/:projectId/images - list generated images for a project
router.get("/", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await assertProjectOwnership(projectId, req.userId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const images = await GeneratedImage.find({ project: projectId }).sort({ createdAt: -1 });
    res.json({ images: images.map((i) => i.toSafeObject()) });
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ error: "Failed to load images" });
  }
});

// POST /api/projects/:projectId/images/generate - run AI generation and save result
router.post("/generate", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await assertProjectOwnership(projectId, req.userId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { prompt, canvasImage, actionType } = req.body;

    if (!prompt?.trim() && actionType !== "enhance") {
      return res
        .status(400)
        .json({ error: "Please enter a prompt describing what you want to create" });
    }

    const finalPrompt = prompt?.trim() || "Enhance and polish this design";

    const { imageUrl } = await generateImage({
      prompt: finalPrompt,
      canvasImage,
      actionType,
    });

    const savedImage = await GeneratedImage.create({
      project: projectId,
      prompt: finalPrompt,
      imageUrl,
      actionType,
      canvasSnapshot: canvasImage || null,
    });

    res.status(201).json({ image: savedImage.toSafeObject() });
  } catch (err) {
    console.error("Error generating image:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to generate image" });
  }
});

// DELETE /api/projects/:projectId/images/:imageId
router.delete("/:imageId", async (req, res) => {
  try {
    const { projectId, imageId } = req.params;
    if (!isValidId(imageId)) return res.status(404).json({ error: "Image not found" });

    const project = await assertProjectOwnership(projectId, req.userId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const image = await GeneratedImage.findOneAndDelete({ _id: imageId, project: projectId });
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;
