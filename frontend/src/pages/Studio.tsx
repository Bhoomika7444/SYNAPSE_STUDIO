import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ArrowLeft,
  Pencil,
  Eraser,
  Square,
  Circle,
  Triangle,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Upload,
  Wand2,
  Layers,
  Zap,
  Image as ImageIcon,
  Loader2,
  Save,
} from "lucide-react";

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  action_type: string;
  created_at: string;
}

const COLORS = [
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#000000",
];

const Studio = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState("New Project");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedTool, setSelectedTool] = useState<"pencil" | "eraser" | "square" | "circle" | "triangle">("pencil");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    fetchProject();
    fetchGeneratedImages();
    initCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill with dark background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    saveToHistory();
  };

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      const project = data.project;

      setProjectName(project.name);

      // Load canvas data if exists
      if (project.canvas_data) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            saveToHistory();
          };
          img.src = project.canvas_data;
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error(getErrorMessage(error, "Failed to load project"));
      navigate("/");
    }
  };

  const fetchGeneratedImages = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/images`);
      setGeneratedImages(data.images || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const undo = () => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    if (selectedTool === "pencil") {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (selectedTool === "eraser") {
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const drawShape = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== "square" && selectedTool !== "circle" && selectedTool !== "triangle") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    const size = brushSize * 10;

    ctx.fillStyle = selectedColor;
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 2;

    if (selectedTool === "square") {
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    } else if (selectedTool === "circle") {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (selectedTool === "triangle") {
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.closePath();
      ctx.fill();
    }

    saveToHistory();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "square" || selectedTool === "circle" || selectedTool === "triangle") {
      drawShape(e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        // Scale image to fit canvas
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        saveToHistory();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getCanvasDataURL = () => {
    const canvas = canvasRef.current;
    return canvas?.toDataURL("image/png") || "";
  };

  const generateImage = async (actionType: string) => {
    if (!prompt.trim() && actionType !== "enhance") {
      toast.error("Please enter a prompt describing what you want to create");
      return;
    }

    setGenerating(true);

    try {
      const canvasImage = getCanvasDataURL();

      const { data } = await api.post(`/projects/${projectId}/images/generate`, {
        prompt: prompt || "Enhance and polish this design",
        canvasImage,
        actionType,
      });

      setGeneratedImages([data.image, ...generatedImages]);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(getErrorMessage(error, "Failed to generate image"));
    } finally {
      setGenerating(false);
    }
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      const canvasData = getCanvasDataURL();

      await api.put(`/projects/${projectId}`, {
        name: projectName,
        canvas_data: canvasData,
        thumbnail: canvasData,
      });

      toast.success("Project saved!");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(getErrorMessage(error, "Failed to save project"));
    } finally {
      setSaving(false);
    }
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `synapse-${Date.now()}.png`;
    link.click();
  };

  const applyToCanvas = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;

      ctx.drawImage(img, x, y, w, h);
      saveToHistory();
      toast.success("Applied to canvas!");
    };
    img.src = imageUrl;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-none text-lg font-semibold w-48 focus-visible:ring-0"
            />
          </div>
        </div>
        <Button onClick={saveProject} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools */}
        <div className="w-16 border-r border-border p-2 flex flex-col gap-2">
          <Button
            variant={selectedTool === "pencil" ? "default" : "ghost"}
            size="icon"
            onClick={() => setSelectedTool("pencil")}
            title="Pencil"
          >
            <Pencil className="w-5 h-5" />
          </Button>
          <Button
            variant={selectedTool === "eraser" ? "default" : "ghost"}
            size="icon"
            onClick={() => setSelectedTool("eraser")}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </Button>
          <Button
            variant={selectedTool === "square" ? "default" : "ghost"}
            size="icon"
            onClick={() => setSelectedTool("square")}
            title="Rectangle"
          >
            <Square className="w-5 h-5" />
          </Button>
          <Button
            variant={selectedTool === "circle" ? "default" : "ghost"}
            size="icon"
            onClick={() => setSelectedTool("circle")}
            title="Circle"
          >
            <Circle className="w-5 h-5" />
          </Button>
          <Button
            variant={selectedTool === "triangle" ? "default" : "ghost"}
            size="icon"
            onClick={() => setSelectedTool("triangle")}
            title="Triangle"
          >
            <Triangle className="w-5 h-5" />
          </Button>

          <div className="border-t border-border my-2" />

          <Button variant="ghost" size="icon" onClick={undo} title="Undo">
            <Undo2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} title="Redo">
            <Redo2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={clearCanvas} title="Clear">
            <Trash2 className="w-5 h-5" />
          </Button>

          <div className="border-t border-border my-2" />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
          >
            <Upload className="w-5 h-5" />
          </Button>

          <div className="border-t border-border my-2" />

          {/* Brush Size */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{brushSize}</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-12 h-1 -rotate-90 mt-6 mb-6"
            />
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-1 mt-auto">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  selectedColor === color ? "border-primary scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 canvas-container relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onClick={handleCanvasClick}
            />
          </div>
        </div>

        {/* Right Panel - Prompt & Results */}
        <div className="w-80 border-l border-border flex flex-col">
          {/* Prompt Panel */}
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold mb-3">AI Prompt</h3>
            <Textarea
              placeholder="Describe what you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-secondary border-border resize-none mb-3"
              rows={3}
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => generateImage("logo")}
                disabled={generating}
                className="gap-1"
              >
                <Sparkles className="w-4 h-4" />
                Logo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => generateImage("enhance")}
                disabled={generating}
                className="gap-1"
              >
                <Wand2 className="w-4 h-4" />
                Enhance
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => generateImage("3d")}
                disabled={generating}
                className="gap-1"
              >
                <Layers className="w-4 h-4" />
                3D
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => generateImage("animation")}
                disabled={generating}
                className="gap-1"
              >
                <Zap className="w-4 h-4" />
                Animation
              </Button>
            </div>

            <Button
              className="w-full mt-3 gap-2"
              onClick={() => generateImage("default")}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {/* Results Gallery */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold mb-3">Generated Images</h3>
            {generatedImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No images generated yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedImages.map((img) => (
                  <div key={img.id} className="glass rounded-lg overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={img.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {img.prompt}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => downloadImage(img.image_url)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => applyToCanvas(img.image_url)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;
