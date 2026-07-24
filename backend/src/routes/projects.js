import { Router } from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import GeneratedImage from "../models/GeneratedImage.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/projects - list current user's projects, most recently updated first
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ user: req.userId }).sort({ updatedAt: -1 });
    res.json({ projects: projects.map((p) => p.toSafeObject()) });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to load projects" });
  }
});

// POST /api/projects - create a new project
router.post("/", async (req, res) => {
  try {
    const name = (req.body?.name || "New Project").trim() || "New Project";
    const project = await Project.create({ user: req.userId, name });
    res.status(201).json({ project: project.toSafeObject() });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// GET /api/projects/:id - fetch a single project (owner only)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(404).json({ error: "Project not found" });

    const project = await Project.findOne({ _id: id, user: req.userId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json({ project: project.toSafeObject() });
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Failed to load project" });
  }
});

// PUT /api/projects/:id - update name / canvas data / thumbnail
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(404).json({ error: "Project not found" });

    const { name, canvas_data, thumbnail } = req.body;
    const update = {};
    if (typeof name === "string") update.name = name;
    if (typeof canvas_data === "string") update.canvasData = canvas_data;
    if (typeof thumbnail === "string") update.thumbnail = thumbnail;

    const project = await Project.findOneAndUpdate(
      { _id: id, user: req.userId },
      update,
      { new: true }
    );
    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json({ project: project.toSafeObject() });
  } catch (err) {
    console.error("Error saving project:", err);
    res.status(500).json({ error: "Failed to save project" });
  }
});

// DELETE /api/projects/:id - delete a project and its generated images
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(404).json({ error: "Project not found" });

    const project = await Project.findOneAndDelete({ _id: id, user: req.userId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    await GeneratedImage.deleteMany({ project: id });

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
