"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

type BlendMode = "normal" | "multiply" | "darken";

type DepthField = {
  width: number;
  height: number;
  values: Float32Array;
};

type TattooDesign = {
  id: string;
  name: string;
  category: string;
  src: string;
};

type TattooItem = {
  id: string;
  designId: string;
  name: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  flipped: boolean;
  blendMode: BlendMode;
  curveX: number;
  curveY: number;
  skewX: number;
};

const tattooDesigns: TattooDesign[] = [
  {
    id: "butterfly",
    name: "Butterfly",
    category: "Animals",
    src: "/tattoos/butterfly.png",
  },
];

const categories = [
  "All",
  "Animals",
  "Flowers",
  "Skulls",
  "Swords",
  "Lettering",
  "Others",
];

function createTattoo(design: TattooDesign): TattooItem {
  return {
    id: `${design.id}-${Date.now()}-${Math.random()}`,
    designId: design.id,
    name: design.name,
    src: design.src,
    x: 50,
    y: 50,
    size: 28,
    rotation: 0,
    opacity: 72,
    flipped: false,
    blendMode: "multiply",
    curveX: 0,
    curveY: 0,
    skewX: 0,
  };
}

export default function TryOn() {
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tattoos, setTattoos] = useState<TattooItem[]>([]);
  const [selectedTattooId, setSelectedTattooId] = useState<string | null>(
    null
  );
  const [draggingTattooId, setDraggingTattooId] = useState<string | null>(
    null
  );

  const previewRef = useRef<HTMLDivElement | null>(null);
  const bodyImageRef = useRef<HTMLImageElement | null>(null);
  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [alignmentPoints, setAlignmentPoints] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [isSelectingLimbMask, setIsSelectingLimbMask] =
    useState(false);
  const [limbMaskPoints, setLimbMaskPoints] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [limbMaskMessage, setLimbMaskMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [isAnalyzingDepth, setIsAnalyzingDepth] = useState(false);
  const [depthMapUrl, setDepthMapUrl] = useState<string | null>(null);
  const [showDepthPreview, setShowDepthPreview] = useState(false);
  const [depthField, setDepthField] = useState<DepthField | null>(null);
  const [depthMessage, setDepthMessage] = useState("");
  const depthEstimatorRef = useRef<any>(null);

  const selectedTattoo =
    tattoos.find((tattoo) => tattoo.id === selectedTattooId) ?? null;

  const visibleDesigns =
    selectedCategory === "All"
      ? tattooDesigns
      : tattooDesigns.filter(
          (design) => design.category === selectedCategory
        );

  function handleBodyImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setBodyImage(imageUrl);
    setAlignmentPoints([]);
    setIsSelectingArea(false);
    setIsSelectingLimbMask(false);
    setLimbMaskPoints([]);
    setLimbMaskMessage("");
    setAiMessage("");
    setDepthMapUrl(null);
    setShowDepthPreview(false);
    setDepthField(null);
    setDepthMessage("");
  }

  function addTattoo(design: TattooDesign) {
    const newTattoo = createTattoo(design);
    setTattoos((current) => [...current, newTattoo]);
    setSelectedTattooId(newTattoo.id);
  }

  function updateSelectedTattoo(
    changes: Partial<Omit<TattooItem, "id" | "designId" | "src" | "name">>
  ) {
    if (!selectedTattooId) return;

    setTattoos((current) =>
      current.map((tattoo) =>
        tattoo.id === selectedTattooId
          ? { ...tattoo, ...changes }
          : tattoo
      )
    );
  }

  function moveTattoo(
    tattooId: string,
    clientX: number,
    clientY: number
  ) {
    const preview = previewRef.current;
    if (!preview) return;

    const rect = preview.getBoundingClientRect();

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setTattoos((current) =>
      current.map((tattoo) =>
        tattoo.id === tattooId
          ? {
              ...tattoo,
              x: Math.max(0, Math.min(100, x)),
              y: Math.max(0, Math.min(100, y)),
            }
          : tattoo
      )
    );
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (!draggingTattooId) return;

    moveTattoo(
      draggingTattooId,
      event.clientX,
      event.clientY
    );
  }

  function stopDragging() {
    setDraggingTattooId(null);
  }

  function getRenderedImageRect() {
    const preview = previewRef.current;
    const image = bodyImageRef.current;

    if (!preview || !image || !image.naturalWidth || !image.naturalHeight) {
      return null;
    }

    const previewWidth = preview.clientWidth;
    const previewHeight = preview.clientHeight;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const previewRatio = previewWidth / previewHeight;

    let width = previewWidth;
    let height = previewHeight;
    let left = 0;
    let top = 0;

    if (imageRatio > previewRatio) {
      height = previewWidth / imageRatio;
      top = (previewHeight - height) / 2;
    } else {
      width = previewHeight * imageRatio;
      left = (previewWidth - width) / 2;
    }

    return {
      left,
      top,
      width,
      height,
      previewWidth,
      previewHeight,
    };
  }

  function startAreaSelection() {
    if (!bodyImageRef.current) {
      setAiMessage("Upload a body photo first.");
      return;
    }

    if (!selectedTattooId) {
      setAiMessage("Select a tattoo first.");
      return;
    }

    setAlignmentPoints([]);
    setIsSelectingArea(true);
    setAiMessage(
      "Click two points along the arm or leg: first near the top, then near the bottom."
    );
  }

  function handleAreaSelection(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (!isSelectingArea) return;

    const rect = getRenderedImageRect();
    const preview = previewRef.current;

    if (!rect || !preview) return;

    const previewBox = preview.getBoundingClientRect();
    const clickX = event.clientX - previewBox.left;
    const clickY = event.clientY - previewBox.top;

    const normalizedX = (clickX - rect.left) / rect.width;
    const normalizedY = (clickY - rect.top) / rect.height;

    if (
      normalizedX < 0 ||
      normalizedX > 1 ||
      normalizedY < 0 ||
      normalizedY > 1
    ) {
      setAiMessage("Click directly on the visible body photo.");
      return;
    }

    const point = {
      x:
        ((rect.left + normalizedX * rect.width) /
          rect.previewWidth) *
        100,
      y:
        ((rect.top + normalizedY * rect.height) /
          rect.previewHeight) *
        100,
    };

    if (alignmentPoints.length === 0) {
      setAlignmentPoints([point]);
      setAiMessage(
        "First point set. Now click a second point farther down the same arm or leg."
      );
      return;
    }

    const firstPoint = alignmentPoints[0];
    const secondPoint = point;

    const deltaX = secondPoint.x - firstPoint.x;
    const deltaY = secondPoint.y - firstPoint.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < 5) {
      setAiMessage(
        "The two points are too close. Click the second point farther away."
      );
      return;
    }

    const centerX = (firstPoint.x + secondPoint.x) / 2;
    const centerY = (firstPoint.y + secondPoint.y) / 2;

    const directionAngle =
      (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

    // Tattoo artwork is normally upright, so align its vertical axis
    // with the line between the two selected points.
    let rotation = directionAngle - 90;

    while (rotation > 90) rotation -= 180;
    while (rotation < -90) rotation += 180;

    rotation = Math.max(-60, Math.min(60, rotation));

    // Use the selected line length as a conservative sizing guide.
    const suggestedSize = Math.max(
      12,
      Math.min(32, distance * 0.52)
    );

    // Stronger curve for shorter/thicker-looking sections, gentler
    // curve for a long arm or leg segment.
    const suggestedCurve = Math.max(
      24,
      Math.min(44, 48 - distance * 0.35)
    );

    updateSelectedTattoo({
      x: centerX,
      y: centerY,
      rotation,
      size: suggestedSize,
      curveX: suggestedCurve,
      curveY: 0,
      skewX: 0,
    });

    setAlignmentPoints([firstPoint, secondPoint]);
    setIsSelectingArea(false);
    setAiMessage(
      "Two-point fit applied. Adjust Size and Horizontal curve if needed."
    );
  }

  function clearSelectedArea() {
    setAlignmentPoints([]);
    setIsSelectingArea(false);
    setAiMessage("");
  }



  function startLimbMaskSelection() {
    if (!bodyImageRef.current) {
      setLimbMaskMessage("Upload a body photo first.");
      return;
    }

    setIsSelectingArea(false);
    setAlignmentPoints([]);
    setLimbMaskPoints([]);
    setIsSelectingLimbMask(true);
    setLimbMaskMessage(
      "Tap four corners around the arm or leg: top-left, top-right, bottom-right, then bottom-left."
    );
  }

  function handleLimbMaskSelection(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (!isSelectingLimbMask) return;

    const preview = previewRef.current;
    const rect = getRenderedImageRect();
    if (!preview || !rect) return;

    const previewBox = preview.getBoundingClientRect();
    const clickX = event.clientX - previewBox.left;
    const clickY = event.clientY - previewBox.top;

    const normalizedX = (clickX - rect.left) / rect.width;
    const normalizedY = (clickY - rect.top) / rect.height;

    if (
      normalizedX < 0 ||
      normalizedX > 1 ||
      normalizedY < 0 ||
      normalizedY > 1
    ) {
      setLimbMaskMessage("Click directly on the body photo.");
      return;
    }

    const point = {
      x: (clickX / rect.previewWidth) * 100,
      y: (clickY / rect.previewHeight) * 100,
    };

    const nextPoints = [...limbMaskPoints, point];
    setLimbMaskPoints(nextPoints);

    const messages = [
      "First corner set. Tap the top-right corner.",
      "Second corner set. Tap the bottom-right corner.",
      "Third corner set. Tap the bottom-left corner.",
    ];

    if (nextPoints.length < 4) {
      setLimbMaskMessage(messages[nextPoints.length - 1]);
      return;
    }

    setIsSelectingLimbMask(false);

    if (selectedTattoo && Math.abs(selectedTattoo.curveX) < 5) {
      updateSelectedTattoo({ curveX: 32 });
    }

    setLimbMaskMessage(
      "Body area saved. The tattoo will stay inside the selected arm or leg area."
    );
  }

  function clearLimbMask() {
    setIsSelectingLimbMask(false);
    setLimbMaskPoints([]);
    setLimbMaskMessage("");
  }

  function getLimbClipPath() {
    if (limbMaskPoints.length !== 4) return undefined;

    return `polygon(${limbMaskPoints
      .map((point) => `${point.x}% ${point.y}%`)
      .join(", ")})`;
  }

  async function getDepthEstimator() {
    if (depthEstimatorRef.current) {
      return depthEstimatorRef.current;
    }

    const { pipeline, env } = await import("@huggingface/transformers");

    env.allowLocalModels = false;
    env.useBrowserCache = true;

    const supportsWebGPU =
      typeof navigator !== "undefined" && "gpu" in navigator;

    const options: Record<string, unknown> = {
      dtype: "q8",
    };

    if (supportsWebGPU) {
      options.device = "webgpu";
    }

    depthEstimatorRef.current = await pipeline(
      "depth-estimation",
      "onnx-community/depth-anything-v2-small",
      options
    );

    return depthEstimatorRef.current;
  }

  function depthToDataUrl(depth: any) {
    const width = Number(depth?.width ?? 0);
    const height = Number(depth?.height ?? 0);
    const sourceData = depth?.data;

    if (!width || !height || !sourceData) {
      throw new Error("Depth output did not contain image data.");
    }

    const values = Array.from(sourceData as ArrayLike<number>);
    let minimum = Infinity;
    let maximum = -Infinity;

    for (const value of values) {
      if (!Number.isFinite(value)) continue;
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }

    const range = Math.max(0.000001, maximum - minimum);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");

    const imageData = context.createImageData(width, height);

    for (let index = 0; index < width * height; index += 1) {
      const rawValue = Number(values[index] ?? minimum);
      const normalized = (rawValue - minimum) / range;
      const shade = Math.max(
        0,
        Math.min(255, Math.round(normalized * 255))
      );

      const pixelIndex = index * 4;
      imageData.data[pixelIndex] = shade;
      imageData.data[pixelIndex + 1] = shade;
      imageData.data[pixelIndex + 2] = shade;
      imageData.data[pixelIndex + 3] = 220;
    }

    context.putImageData(imageData, 0, 0);

    return {
      url: canvas.toDataURL("image/png"),
      field: {
        width,
        height,
        values: Float32Array.from(
          values,
          (value) => (Number(value) - minimum) / range
        ),
      } satisfies DepthField,
    };
  }

  async function analyzeDepth() {
    if (!bodyImage) {
      setDepthMessage("Upload a body photo first.");
      return;
    }

    setIsAnalyzingDepth(true);
    setDepthMessage(
      "Preparing body-shape analysis. The first use may take a little longer."
    );

    try {
      const estimator = await getDepthEstimator();
      setDepthMessage("Analyzing the body shape in your photo...");

      const result = await estimator(bodyImage);
      const depth = result?.depth ?? result?.predicted_depth ?? result;

      const depthResult = depthToDataUrl(depth);
      setDepthMapUrl(depthResult.url);
      setShowDepthPreview(false);
      setDepthField(depthResult.field);
      setDepthMessage(
        "Body-shape analysis is complete. The tattoo now follows the photographed surface more naturally."
      );
    } catch (error) {
      console.error("Depth analysis failed:", error);
      setDepthMessage(
        "Body-shape analysis could not be completed. Please try another clear, well-lit photo."
      );
    } finally {
      setIsAnalyzingDepth(false);
    }
  }

  function clearDepthMap() {
    setDepthMapUrl(null);
    setShowDepthPreview(false);
    setDepthField(null);
    setDepthMessage("");
  }


  function sampleDepth(
    field: DepthField,
    normalizedX: number,
    normalizedY: number
  ) {
    const x = Math.max(
      0,
      Math.min(field.width - 1, normalizedX * (field.width - 1))
    );
    const y = Math.max(
      0,
      Math.min(field.height - 1, normalizedY * (field.height - 1))
    );

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(field.width - 1, x0 + 1);
    const y1 = Math.min(field.height - 1, y0 + 1);
    const tx = x - x0;
    const ty = y - y0;

    const top =
      field.values[y0 * field.width + x0] * (1 - tx) +
      field.values[y0 * field.width + x1] * tx;
    const bottom =
      field.values[y1 * field.width + x0] * (1 - tx) +
      field.values[y1 * field.width + x1] * tx;

    return top * (1 - ty) + bottom * ty;
  }

  function buildDepthGrid(
    tattoo: TattooItem,
    columns = 30,
    rows = 30
  ) {
    if (!depthField) return null;

    const rect = getRenderedImageRect();
    if (!rect) return null;

    const radians = (tattoo.rotation * Math.PI) / 180;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    // Use a square sampling footprint. The renderer later adapts this
    // grid to the tattoo artwork's actual aspect ratio.
    const footprintWidth = tattoo.size;
    const footprintHeight = tattoo.size;

    const grid: number[][] = [];

    for (let row = 0; row <= rows; row += 1) {
      const values: number[] = [];
      const localY = (row / rows - 0.5) * footprintHeight;

      for (let column = 0; column <= columns; column += 1) {
        const localX =
          (column / columns - 0.5) * footprintWidth;

        const rotatedX =
          localX * cosine - localY * sine;
        const rotatedY =
          localX * sine + localY * cosine;

        const previewPercentX = tattoo.x + rotatedX;
        const previewPercentY = tattoo.y + rotatedY;

        const previewPixelX =
          (previewPercentX / 100) * rect.previewWidth;
        const previewPixelY =
          (previewPercentY / 100) * rect.previewHeight;

        const imageX =
          (previewPixelX - rect.left) / rect.width;
        const imageY =
          (previewPixelY - rect.top) / rect.height;

        values.push(
          sampleDepth(depthField, imageX, imageY)
        );
      }

      grid.push(values);
    }

    // Small blur removes noisy pixel-to-pixel depth changes.
    const smoothed = grid.map((line) => [...line]);

    for (let row = 1; row < rows; row += 1) {
      for (let column = 1; column < columns; column += 1) {
        let total = 0;
        let count = 0;

        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            total += grid[row + offsetY][column + offsetX];
            count += 1;
          }
        }

        smoothed[row][column] = total / count;
      }
    }

    return smoothed;
  }

  function deleteSelectedTattoo() {
    if (!selectedTattooId) return;

    setTattoos((current) =>
      current.filter((tattoo) => tattoo.id !== selectedTattooId)
    );
    setSelectedTattooId(null);
  }

  function resetSelectedTattoo() {
    if (!selectedTattooId) return;

    updateSelectedTattoo({
      x: 50,
      y: 50,
      size: 28,
      rotation: 0,
      opacity: 72,
      flipped: false,
      blendMode: "multiply",
      curveX: 0,
      curveY: 0,
      skewX: 0,
    });
  }

  function clearAllTattoos() {
    setTattoos([]);
    setSelectedTattooId(null);
  }

  return (
    <section
      id="try-on"
      className="tryon-workspace"
      style={{
        width: "100%",
        maxWidth: "1440px",
        height: "calc(100dvh - 90px)",
        minHeight: "680px",
        margin: "0 auto",
        padding: "12px 18px 18px",
        color: "#ffffff",
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <style>{`
        .tryon-guide {
          flex: 0 0 auto;
          display: grid;
          grid-template-columns: minmax(210px, 1.2fr) repeat(3, minmax(150px, 1fr));
          gap: 10px;
          padding: 13px 15px;
          border: 1px solid #303030;
          border-radius: 16px;
          background: #101010;
        }

        .tryon-guide-intro h1 {
          margin: 0;
          font-size: 20px;
          line-height: 1.2;
        }

        .tryon-guide-intro p,
        .tryon-guide-step p {
          margin: 5px 0 0;
          color: #969696;
          font-size: 12px;
          line-height: 1.45;
        }

        .tryon-guide-step {
          padding-left: 12px;
          border-left: 1px solid #303030;
        }

        .tryon-guide-step strong {
          display: block;
          font-size: 13px;
        }

        .tryon-layout {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
          gap: 18px;
          height: 100%;
          min-height: 0;
          align-items: stretch;
        }

        .tryon-sidebar {
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding-right: 7px;
          scrollbar-width: thin;
          scrollbar-color: #4a4a4a transparent;
        }

        .tryon-sidebar::-webkit-scrollbar {
          width: 7px;
        }

        .tryon-sidebar::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 999px;
        }

        .tryon-preview-column {
          min-width: 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .tryon-preview {
          flex: 1;
          min-height: 0;
        }

        @media (max-width: 820px) {
          .tryon-workspace {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            padding: 12px !important;
          }

          .tryon-guide {
            grid-template-columns: 1fr;
          }

          .tryon-guide-step {
            padding: 10px 0 0;
            border-left: 0;
            border-top: 1px solid #303030;
          }

          .tryon-layout {
            grid-template-columns: 1fr;
            height: auto;
          }

          .tryon-sidebar {
            overflow: visible;
            padding-right: 0;
          }

          .tryon-preview-column {
            min-height: 520px;
          }

          .tryon-preview {
            min-height: 520px !important;
          }
        }
      `}</style>

      <div className="tryon-guide">
        <div className="tryon-guide-intro">
          <h1>Preview Your Tattoo</h1>
          <p>
            Use a clear, well-lit photo taken straight toward the body area
            for the most realistic result.
          </p>
        </div>

        <div className="tryon-guide-step">
          <strong>1. Upload Your Photo</strong>
          <p>Choose a clear photo of the area you want tattooed.</p>
        </div>

        <div className="tryon-guide-step">
          <strong>2. Choose a Tattoo</strong>
          <p>Select a design, then drag it directly on your photo.</p>
        </div>

        <div className="tryon-guide-step">
          <strong>3. Adjust the Preview</strong>
          <p>Change the size, angle, darkness, and realistic body fit.</p>
        </div>
      </div>

      <div className="tryon-layout">
        <aside
          className="tryon-sidebar"
          style={{
            display: "grid",
            alignContent: "start",
            gap: "12px",
          }}
        >
          <Panel title="Step 1 · Upload Your Photo">
            <input
              type="file"
              accept="image/*"
              onChange={handleBodyImage}
              style={{ width: "100%" }}
            />
          </Panel>

          <Panel title="Step 2 · Choose a Tattoo">
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    border:
                      selectedCategory === category
                        ? "1px solid #ffffff"
                        : "1px solid #444444",
                    background:
                      selectedCategory === category
                        ? "#ffffff"
                        : "#171717",
                    color:
                      selectedCategory === category
                        ? "#111111"
                        : "#ffffff",
                    borderRadius: "999px",
                    padding: "7px 11px",
                    cursor: "pointer",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              {visibleDesigns.map((design) => (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => addTattoo(design)}
                  style={{
                    minHeight: "96px",
                    border: "1px solid #3c3c3c",
                    borderRadius: "14px",
                    background: "#141414",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={design.src}
                    alt={design.name}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "54px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                  <span style={{ display: "block", marginTop: "6px" }}>
                    {design.name}
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Step 3 · Adjust Your Tattoo">
            {!selectedTattoo ? (
              <p style={{ margin: 0, color: "#888888" }}>
                Choose a tattoo from the library to begin adjusting it.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                <RangeControl
                  label={`Tattoo size: ${selectedTattoo.size}%`}
                  min={8}
                  max={80}
                  value={selectedTattoo.size}
                  onChange={(value) =>
                    updateSelectedTattoo({ size: value })
                  }
                />

                <RangeControl
                  label={`Angle: ${selectedTattoo.rotation}°`}
                  min={-180}
                  max={180}
                  value={selectedTattoo.rotation}
                  onChange={(value) =>
                    updateSelectedTattoo({ rotation: value })
                  }
                />

                <RangeControl
                  label={`Ink darkness: ${selectedTattoo.opacity}%`}
                  min={15}
                  max={100}
                  value={selectedTattoo.opacity}
                  onChange={(value) =>
                    updateSelectedTattoo({ opacity: value })
                  }
                />

                <div
                  style={{
                    borderTop: "1px solid #333333",
                    paddingTop: "16px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <div>
                    <strong>Advanced Realistic Fit</strong>
                    <p
                      style={{
                        margin: "6px 0 4px",
                        color: "#888888",
                        fontSize: "12px",
                        lineHeight: 1.45,
                      }}
                    >
                      Optional tools for curved areas such as arms and legs.
                    </p>
                  </div>

                  <strong style={{ fontSize: "14px" }}>Fit to Arm or Leg</strong>

                  <ActionButton onClick={startLimbMaskSelection}>
                    {isSelectingLimbMask
                      ? `Select point ${limbMaskPoints.length + 1} of 4`
                      : "Define Body Area"}
                  </ActionButton>

                  {limbMaskPoints.length > 0 && (
                    <ActionButton onClick={clearLimbMask}>
                      Reset Body Area
                    </ActionButton>
                  )}

                  {limbMaskMessage && (
                    <p
                      style={{
                        margin: 0,
                        color: "#9a9a9a",
                        fontSize: "13px",
                        lineHeight: 1.45,
                      }}
                    >
                      {limbMaskMessage}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    borderTop: "1px solid #333333",
                    paddingTop: "16px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <strong>Create a More Realistic Preview</strong>

                  <ActionButton
                    onClick={analyzeDepth}
                    disabled={isAnalyzingDepth}
                  >
                    {isAnalyzingDepth
                      ? "Analyzing body shape..."
                      : "Analyze Body Shape"}
                  </ActionButton>

                  {depthMapUrl && (
                    <>
                      <ActionButton
                        onClick={() =>
                          setShowDepthPreview((current) => !current)
                        }
                      >
                        {showDepthPreview
                          ? "Hide Analysis Preview"
                          : "Show Analysis Preview"}
                      </ActionButton>

                      <ActionButton onClick={clearDepthMap}>
                        Reset Body Analysis
                      </ActionButton>
                    </>
                  )}

                  {depthMessage && (
                    <p
                      style={{
                        margin: 0,
                        color: "#9a9a9a",
                        fontSize: "13px",
                        lineHeight: 1.45,
                      }}
                    >
                      {depthMessage}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    borderTop: "1px solid #333333",
                    paddingTop: "16px",
                    display: "grid",
                    gap: "16px",
                  }}
                >
                  <div>
                    <strong>Fine-Tune Body Fit</strong>
                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#888888",
                        fontSize: "13px",
                        lineHeight: 1.4,
                      }}
                    >
                      Fine-tune how the tattoo wraps around the body and matches the camera angle.
                    </p>
                  </div>

                  <RangeControl
                    label={`Wrap around body: ${selectedTattoo.curveX}°`}
                    min={-55}
                    max={55}
                    value={selectedTattoo.curveX}
                    onChange={(value) =>
                      updateSelectedTattoo({ curveX: value })
                    }
                  />

                  <RangeControl
                    label={`Up / down curve: ${selectedTattoo.curveY}°`}
                    min={-40}
                    max={40}
                    value={selectedTattoo.curveY}
                    onChange={(value) =>
                      updateSelectedTattoo({ curveY: value })
                    }
                  />

                  <RangeControl
                    label={`Camera angle: ${selectedTattoo.skewX}°`}
                    min={-30}
                    max={30}
                    value={selectedTattoo.skewX}
                    onChange={(value) =>
                      updateSelectedTattoo({ skewX: value })
                    }
                  />
                </div>

                <div
                  style={{
                    padding: "11px 12px",
                    border: "1px solid #303030",
                    borderRadius: "10px",
                    background: "#151515",
                    color: "#8f8f8f",
                    fontSize: "12px",
                    lineHeight: 1.45,
                  }}
                >
                  Natural skin blending is applied automatically.
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <ActionButton
                    onClick={() =>
                      updateSelectedTattoo({
                        flipped: !selectedTattoo.flipped,
                      })
                    }
                  >
                    Flip
                  </ActionButton>

                  <ActionButton onClick={resetSelectedTattoo}>
                    Reset
                  </ActionButton>

                  <ActionButton
                    onClick={deleteSelectedTattoo}
                    danger
                  >
                    Delete
                  </ActionButton>

                  <ActionButton
                    onClick={clearAllTattoos}
                    disabled={tattoos.length === 0}
                  >
                    Clear all
                  </ActionButton>
                </div>
              </div>
            )}
          </Panel>
        </aside>

        <div className="tryon-preview-column">
          <div
            ref={previewRef}
            className="tryon-preview"
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onPointerLeave={stopDragging}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: 0,
              border: "1px solid #343434",
              borderRadius: "18px",
              overflow: "hidden",
              background: "#101010",
              touchAction: "none",
            }}
          >
            {!bodyImage ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  padding: "30px",
                  textAlign: "center",
                  color: "#777777",
                }}
              >
                Upload a body photo to begin.
              </div>
            ) : (
              <img
                ref={bodyImageRef}
                src={bodyImage}
                alt="Uploaded body preview"
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 0,
                  objectFit: "contain",
                  display: "block",
                  background: "#0b0b0b",
                  userSelect: "none",
                }}
              />
            )}

            {bodyImage && depthMapUrl && showDepthPreview && (
              <img
                src={depthMapUrl}
                alt="Estimated depth map"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  zIndex: 6,
                  opacity: 0.72,
                  pointerEvents: "none",
                  mixBlendMode: "screen",
                }}
              />
            )}

            {bodyImage && isSelectingLimbMask && limbMaskPoints.length >= 2 && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 19,
                  pointerEvents: "none",
                }}
              >
                <polyline
                  points={[
                    ...limbMaskPoints,
                    ...(limbMaskPoints.length === 4
                      ? [limbMaskPoints[0]]
                      : []),
                  ]
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill={
                    limbMaskPoints.length === 4
                      ? "rgba(22,135,255,0.08)"
                      : "none"
                  }
                  stroke="#1687ff"
                  strokeWidth="0.45"
                  strokeDasharray="1.4 1"
                />
              </svg>
            )}

            {bodyImage &&
              isSelectingLimbMask &&
              limbMaskPoints.map((point, index) => (
                <div
                  key={`limb-mask-point-${index}`}
                  style={{
                    position: "absolute",
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    width: "15px",
                    height: "15px",
                    borderRadius: "50%",
                    border: "2px solid #ffffff",
                    background: "#1687ff",
                    transform: "translate(-50%, -50%)",
                    zIndex: 21,
                    pointerEvents: "none",
                    boxShadow:
                      "0 0 0 3px rgba(22,135,255,0.25)",
                  }}
                />
              ))}

            {bodyImage &&
              isSelectingArea &&
              alignmentPoints.map((point, index) => (
                <div
                  key={`fit-point-${index}`}
                  style={{
                    position: "absolute",
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: "2px solid #ffffff",
                    background: "#1687ff",
                    transform: "translate(-50%, -50%)",
                    zIndex: 18,
                    pointerEvents: "none",
                    boxShadow: "0 0 0 3px rgba(22, 135, 255, 0.25)",
                  }}
                />
              ))}

            {bodyImage && isSelectingArea && alignmentPoints.length === 2 && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 17,
                  pointerEvents: "none",
                }}
              >
                <line
                  x1={alignmentPoints[0].x}
                  y1={alignmentPoints[0].y}
                  x2={alignmentPoints[1].x}
                  y2={alignmentPoints[1].y}
                  stroke="#1687ff"
                  strokeWidth="0.45"
                  strokeDasharray="1.5 1"
                />
              </svg>
            )}

            {bodyImage && isSelectingLimbMask && (
              <div
                onPointerDown={handleLimbMaskSelection}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 25,
                  cursor: "crosshair",
                  background: "rgba(30,150,255,0.02)",
                  touchAction: "none",
                }}
              />
            )}

            {bodyImage && isSelectingArea && (
              <div
                onPointerDown={handleAreaSelection}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 20,
                  cursor: "crosshair",
                  background: "rgba(30, 150, 255, 0.025)",
                  touchAction: "none",
                }}
              />
            )}

            {bodyImage &&
              tattoos.map((tattoo) => {
                const isSelected = tattoo.id === selectedTattooId;

                return (
                  <div
                    key={tattoo.id}
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: isSelected ? 12 : 8,
                      clipPath: getLimbClipPath(),
                      WebkitClipPath: getLimbClipPath(),
                      pointerEvents: "none",
                      isolation: "isolate",
                    }}
                  >
                  <button
                    type="button"
                    aria-label={`Select ${tattoo.name}`}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(
                        event.pointerId
                      );
                      setSelectedTattooId(tattoo.id);
                      setDraggingTattooId(tattoo.id);
                    }}
                    onClick={() => setSelectedTattooId(tattoo.id)}
                    style={{
                      position: "absolute",
                      zIndex: 8,
                      pointerEvents: "auto",
                      left: `${tattoo.x}%`,
                      top: `${tattoo.y}%`,
                      width: `${tattoo.size}%`,
                      padding: 0,
                      border: isSelected
                        ? "1px dashed rgba(255,255,255,0.8)"
                        : "1px solid transparent",
                      background: "transparent",
                      overflow: "visible",
                      isolation: "isolate",
                      display: "block",
                      lineHeight: 0,
                      transform: `translate(-50%, -50%) perspective(700px) rotate(${tattoo.rotation}deg) rotateX(${tattoo.curveY}deg) skewX(${tattoo.skewX}deg) ${
                        tattoo.flipped ? "scaleX(-1)" : ""
                      }`,
                      transformStyle: "preserve-3d",
                      transformOrigin: "center center",
                      opacity: 1,
                      mixBlendMode: tattoo.blendMode,
                      cursor:
                        draggingTattooId === tattoo.id
                          ? "grabbing"
                          : "grab",
                      touchAction: "none",
                    }}
                  >
                    <DepthWarpTattooCanvas
                      src={tattoo.src}
                      curve={tattoo.curveX}
                      opacity={tattoo.opacity}
                      depthGrid={buildDepthGrid(tattoo)}
                    />
                  </button>
                  </div>
                );
              })}
          </div>

          <p
            style={{
              textAlign: "center",
              margin: "12px 0 0",
              color: "#777777",
              fontSize: "14px",
            }}
          >
            Drag the tattoo to move it. Select it anytime to adjust the size, angle, and body fit.
          </p>
          <p
            style={{
              textAlign: "center",
              margin: "5px 0 0",
              color: "#666666",
              fontSize: "11px",
              lineHeight: 1.4,
            }}
          >
            This preview is for visualization only. Actual tattoo results may
            vary with placement, skin tone, body contours, lighting, healing,
            and tattoo technique.
          </p>
        </div>
      </div>
    </section>
  );
}


const tattooSourceCache = new Map<string, Promise<HTMLCanvasElement>>();

function isNearWhitePixel(
  data: Uint8ClampedArray,
  pixelIndex: number
) {
  const offset = pixelIndex * 4;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const alpha = data[offset + 3];
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);

  return (
    alpha >= 210 &&
    minimum >= 242 &&
    maximum - minimum <= 14
  );
}

function removeEdgeConnectedWhiteBackground(
  imageData: ImageData,
  width: number,
  height: number
) {
  const data = imageData.data;
  const edgeSamples: number[] = [];

  for (let x = 0; x < width; x += 1) {
    edgeSamples.push(x, (height - 1) * width + x);
  }

  for (let y = 1; y < height - 1; y += 1) {
    edgeSamples.push(y * width, y * width + width - 1);
  }

  const whiteEdgeCount = edgeSamples.reduce(
    (count, index) => count + (isNearWhitePixel(data, index) ? 1 : 0),
    0
  );

  // Only remove white when it behaves like a real background touching
  // most of the image perimeter. Internal white tattoo details remain.
  if (whiteEdgeCount / Math.max(1, edgeSamples.length) < 0.55) {
    return;
  }

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let queueStart = 0;
  let queueEnd = 0;

  for (const index of edgeSamples) {
    if (!visited[index] && isNearWhitePixel(data, index)) {
      visited[index] = 1;
      queue[queueEnd] = index;
      queueEnd += 1;
    }
  }

  while (queueStart < queueEnd) {
    const index = queue[queueStart];
    queueStart += 1;

    const x = index % width;
    const y = Math.floor(index / width);
    const offset = index * 4;

    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 0;

    const neighbors = [
      x > 0 ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      y > 0 ? index - width : -1,
      y < height - 1 ? index + width : -1,
    ];

    for (const nextIndex of neighbors) {
      if (
        nextIndex >= 0 &&
        !visited[nextIndex] &&
        isNearWhitePixel(data, nextIndex)
      ) {
        visited[nextIndex] = 1;
        queue[queueEnd] = nextIndex;
        queueEnd += 1;
      }
    }
  }
}

function removeTransparentWhiteHalo(imageData: ImageData) {
  const data = imageData.data;

  for (let offset = 0; offset < data.length; offset += 4) {
    const alphaByte = data[offset + 3];

    if (alphaByte <= 2) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
      continue;
    }

    if (alphaByte >= 254) continue;

    // Undo a common white matte on semi-transparent PNG edge pixels.
    const alpha = alphaByte / 255;

    data[offset] = Math.max(
      0,
      Math.min(255, Math.round((data[offset] - 255 * (1 - alpha)) / alpha))
    );
    data[offset + 1] = Math.max(
      0,
      Math.min(
        255,
        Math.round((data[offset + 1] - 255 * (1 - alpha)) / alpha)
      )
    );
    data[offset + 2] = Math.max(
      0,
      Math.min(
        255,
        Math.round((data[offset + 2] - 255 * (1 - alpha)) / alpha)
      )
    );
  }
}

function loadAlphaSafeTattooSource(src: string) {
  const cached = tattooSourceCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLCanvasElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const width = Math.max(1, image.naturalWidth);
      const height = Math.max(1, image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d", { alpha: true });

      if (!context) {
        reject(new Error("Canvas is unavailable."));
        return;
      }

      // Preserve the PNG exactly as supplied. Do not attempt to remove
      // bright pixels: white and light-gray details may be part of the tattoo.
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";
      context.drawImage(image, 0, 0, width, height);

      resolve(canvas);
    };

    image.onerror = () => reject(new Error(`Unable to load tattoo: ${src}`));
    image.src = src;
  });

  tattooSourceCache.set(src, promise);
  return promise;
}


function createWebGLShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message =
      gl.getShaderInfoLog(shader) ?? "Unknown shader compile error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createWebGLProgram(gl: WebGLRenderingContext) {
  const vertexShader = createWebGLShader(
    gl,
    gl.VERTEX_SHADER,
    `
      attribute vec2 a_position;
      attribute vec2 a_uv;
      attribute float a_light;
      attribute float a_visibility;

      varying vec2 v_uv;
      varying float v_light;
      varying float v_visibility;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_uv = a_uv;
        v_light = a_light;
        v_visibility = a_visibility;
      }
    `
  );

  const fragmentShader = createWebGLShader(
    gl,
    gl.FRAGMENT_SHADER,
    `
      precision mediump float;

      uniform sampler2D u_texture;
      uniform float u_opacity;

      varying vec2 v_uv;
      varying float v_light;
      varying float v_visibility;

      void main() {
        vec4 color = texture2D(u_texture, v_uv);

        if (color.a < 0.002) {
          discard;
        }

        color.rgb *= v_light;
        color.a *= u_opacity * v_visibility;
        gl_FragColor = color;
      }
    `
  );

  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program.");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message =
      gl.getProgramInfoLog(program) ?? "Unknown WebGL link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

type WebGLTattooResources = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  positionBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  lightBuffer: WebGLBuffer;
  visibilityBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  texture: WebGLTexture;
  positionLocation: number;
  uvLocation: number;
  lightLocation: number;
  visibilityLocation: number;
  opacityLocation: WebGLUniformLocation;
  textureLocation: WebGLUniformLocation;
};

function createWebGLTattooResources(
  canvas: HTMLCanvasElement
): WebGLTattooResources {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  });

  if (!gl) {
    throw new Error("WebGL is unavailable in this browser.");
  }

  const program = createWebGLProgram(gl);

  const positionBuffer = gl.createBuffer();
  const uvBuffer = gl.createBuffer();
  const lightBuffer = gl.createBuffer();
  const visibilityBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  const texture = gl.createTexture();

  if (
    !positionBuffer ||
    !uvBuffer ||
    !lightBuffer ||
    !visibilityBuffer ||
    !indexBuffer ||
    !texture
  ) {
    throw new Error("Unable to allocate WebGL resources.");
  }

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const uvLocation = gl.getAttribLocation(program, "a_uv");
  const lightLocation = gl.getAttribLocation(program, "a_light");
  const visibilityLocation = gl.getAttribLocation(
    program,
    "a_visibility"
  );
  const opacityLocation = gl.getUniformLocation(program, "u_opacity");
  const textureLocation = gl.getUniformLocation(program, "u_texture");

  if (!opacityLocation || !textureLocation) {
    throw new Error("Unable to locate WebGL uniforms.");
  }

  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    gl.CLAMP_TO_EDGE
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    gl.CLAMP_TO_EDGE
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(textureLocation, 0);

  return {
    gl,
    program,
    positionBuffer,
    uvBuffer,
    lightBuffer,
    visibilityBuffer,
    indexBuffer,
    texture,
    positionLocation,
    uvLocation,
    lightLocation,
    visibilityLocation,
    opacityLocation,
    textureLocation,
  };
}

function DepthWarpTattooCanvas({
  src,
  curve,
  opacity,
  depthGrid,
}: {
  src: string;
  curve: number;
  opacity: number;
  depthGrid: number[][] | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resourcesRef = useRef<WebGLTattooResources | null>(null);
  const frameRef = useRef<number | null>(null);
  const textureSourceRef = useRef<string | null>(null);

  const [layout, setLayout] = useState({
    aspectRatio: 1,
    widthScale: 1,
    heightScale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const render = async () => {
      try {
        const sourceCanvas = await loadAlphaSafeTattooSource(src);
        if (cancelled) return;

        const naturalWidth = Math.max(1, sourceCanvas.width);
        const naturalHeight = Math.max(1, sourceCanvas.height);
        const renderWidth = Math.min(700, naturalWidth);
        const renderHeight = Math.max(
          1,
          Math.round(renderWidth * (naturalHeight / naturalWidth))
        );

        const paddingX = renderWidth * 0.2;
        const paddingY = renderHeight * 0.12;
        const outputWidth = renderWidth + paddingX * 2;
        const outputHeight = renderHeight + paddingY * 2;

        setLayout({
          aspectRatio: renderWidth / renderHeight,
          widthScale: outputWidth / renderWidth,
          heightScale: outputHeight / renderHeight,
          offsetX: paddingX / renderWidth,
          offsetY: paddingY / renderHeight,
        });

        const deviceScale = Math.min(
          2,
          typeof window === "undefined"
            ? 1
            : window.devicePixelRatio || 1
        );

        const pixelWidth = Math.max(
          1,
          Math.round(outputWidth * deviceScale)
        );
        const pixelHeight = Math.max(
          1,
          Math.round(outputHeight * deviceScale)
        );

        if (
          canvas.width !== pixelWidth ||
          canvas.height !== pixelHeight
        ) {
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
        }

        canvas.style.aspectRatio = `${outputWidth} / ${outputHeight}`;

        let resources = resourcesRef.current;

        if (!resources) {
          resources = createWebGLTattooResources(canvas);
          resourcesRef.current = resources;
        }

        const { gl } = resources;
        gl.viewport(0, 0, pixelWidth, pixelHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(resources.program);

        if (textureSourceRef.current !== src) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, resources.texture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            sourceCanvas
          );
          textureSourceRef.current = src;
        }

        const hasDepthGrid = Boolean(
          depthGrid &&
            depthGrid.length >= 2 &&
            depthGrid[0]?.length >= 2
        );

        const activeDepthGrid = hasDepthGrid
          ? depthGrid!
          : Array.from({ length: 31 }, () =>
              Array.from({ length: 31 }, () => 0.5)
            );

        const rows = activeDepthGrid.length - 1;
        const columns = activeDepthGrid[0].length - 1;
        const vertexCount = (rows + 1) * (columns + 1);

        if (vertexCount > 65535) {
          throw new Error("Tattoo mesh is too dense for WebGL 1.");
        }

        let minimum = Infinity;
        let maximum = -Infinity;
        let average = 0;
        let valueCount = 0;

        for (const row of activeDepthGrid) {
          for (const value of row) {
            minimum = Math.min(minimum, value);
            maximum = Math.max(maximum, value);
            average += value;
            valueCount += 1;
          }
        }

        average /= Math.max(1, valueCount);
        const localRange = Math.max(0.025, maximum - minimum);
        const manualStrength = Math.min(1, Math.abs(curve) / 55);
        const direction = curve >= 0 ? 1 : -1;

        const positions = new Float32Array(vertexCount * 2);
        const uvs = new Float32Array(vertexCount * 2);
        const lights = new Float32Array(vertexCount);
        const visibilities = new Float32Array(vertexCount);

        let vertexOffset = 0;

        for (let row = 0; row <= rows; row += 1) {
          for (let column = 0; column <= columns; column += 1) {
            const u = column / columns;
            const v = row / rows;
            const depth = activeDepthGrid[row][column];
            const relativeDepth = (depth - average) / localRange;
            const signedX = u * 2 - 1;
            const edge = Math.abs(signedX);

            const maxAngle = manualStrength * Math.PI * 0.46;
            const sineAtEdge = Math.sin(maxAngle);
            const cylindricalX =
              manualStrength < 0.001 ||
              Math.abs(sineAtEdge) < 0.0001
                ? signedX
                : Math.sin(signedX * maxAngle) / sineAtEdge;

            const centeredX = cylindricalX * (renderWidth / 2);

            const surfaceDepth =
              manualStrength < 0.001
                ? 0
                : (1 - Math.cos(signedX * maxAngle)) /
                  Math.max(0.0001, 1 - Math.cos(maxAngle));

            const depthX =
              relativeDepth * renderWidth * 0.075 * (0.35 + edge);
            const depthY = relativeDepth * renderHeight * 0.075;
            const cylinderY =
              surfaceDepth * renderHeight * 0.13 * manualStrength;

            const farSide = Math.max(0, -relativeDepth);
            const edgeOcclusion = Math.max(
              0,
              (edge - 0.52) / 0.48
            );

            const visibility = Math.max(
              0.04,
              1 -
                farSide *
                  edgeOcclusion *
                  (0.72 + manualStrength * 0.5)
            );

            const pixelX =
              paddingX +
              renderWidth / 2 +
              centeredX +
              depthX * direction;
            const pixelY =
              paddingY +
              v * renderHeight +
              cylinderY +
              depthY;

            const clipX = (pixelX / outputWidth) * 2 - 1;
            const clipY = 1 - (pixelY / outputHeight) * 2;

            positions[vertexOffset * 2] = clipX;
            positions[vertexOffset * 2 + 1] = clipY;
            uvs[vertexOffset * 2] = u;
            uvs[vertexOffset * 2 + 1] = v;
            lights[vertexOffset] = Math.max(
              0.8,
              Math.min(1, 0.94 + relativeDepth * 0.09)
            );
            visibilities[vertexOffset] = visibility;

            vertexOffset += 1;
          }
        }

        const indices = new Uint16Array(rows * columns * 6);
        let indexOffset = 0;

        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const topLeft = row * (columns + 1) + column;
            const topRight = topLeft + 1;
            const bottomLeft = (row + 1) * (columns + 1) + column;
            const bottomRight = bottomLeft + 1;

            indices[indexOffset++] = topLeft;
            indices[indexOffset++] = topRight;
            indices[indexOffset++] = bottomLeft;

            indices[indexOffset++] = topRight;
            indices[indexOffset++] = bottomRight;
            indices[indexOffset++] = bottomLeft;
          }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, resources.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(resources.positionLocation);
        gl.vertexAttribPointer(
          resources.positionLocation,
          2,
          gl.FLOAT,
          false,
          0,
          0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, resources.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(resources.uvLocation);
        gl.vertexAttribPointer(
          resources.uvLocation,
          2,
          gl.FLOAT,
          false,
          0,
          0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, resources.lightBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, lights, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(resources.lightLocation);
        gl.vertexAttribPointer(
          resources.lightLocation,
          1,
          gl.FLOAT,
          false,
          0,
          0
        );

        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          resources.visibilityBuffer
        );
        gl.bufferData(
          gl.ARRAY_BUFFER,
          visibilities,
          gl.DYNAMIC_DRAW
        );
        gl.enableVertexAttribArray(resources.visibilityLocation);
        gl.vertexAttribPointer(
          resources.visibilityLocation,
          1,
          gl.FLOAT,
          false,
          0,
          0
        );

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, resources.indexBuffer);
        gl.bufferData(
          gl.ELEMENT_ARRAY_BUFFER,
          indices,
          gl.DYNAMIC_DRAW
        );

        gl.uniform1f(
          resources.opacityLocation,
          Math.max(0, Math.min(1, opacity / 100))
        );

        gl.drawElements(
          gl.TRIANGLES,
          indices.length,
          gl.UNSIGNED_SHORT,
          0
        );
      } catch (error) {
        console.error("WebGL tattoo render failed:", error);
      }
    };

    frameRef.current = window.requestAnimationFrame(() => {
      void render();
    });

    return () => {
      cancelled = true;

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [src, curve, opacity, depthGrid]);

  useEffect(() => {
    return () => {
      const resources = resourcesRef.current;
      if (!resources) return;

      const { gl } = resources;
      gl.deleteBuffer(resources.positionBuffer);
      gl.deleteBuffer(resources.uvBuffer);
      gl.deleteBuffer(resources.lightBuffer);
      gl.deleteBuffer(resources.visibilityBuffer);
      gl.deleteBuffer(resources.indexBuffer);
      gl.deleteTexture(resources.texture);
      gl.deleteProgram(resources.program);
      resourcesRef.current = null;
    };
  }, []);

  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        aspectRatio: String(layout.aspectRatio),
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: `${-layout.offsetX * 100}%`,
          top: `${-layout.offsetY * 100}%`,
          width: `${layout.widthScale * 100}%`,
          height: `${layout.heightScale * 100}%`,
          display: "block",
          background: "transparent",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </span>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #333333",
        borderRadius: "16px",
        background: "#111111",
        padding: "14px",
      }}
    >
      <h3 style={{ margin: "0 0 16px", fontSize: "18px" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function RangeControl({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={{ display: "grid", gap: "8px" }}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: "100%" }}
      />
    </label>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: danger
          ? "1px solid #7a3333"
          : "1px solid #444444",
        background: danger ? "#311616" : "#1b1b1b",
        color: "#ffffff",
        borderRadius: "10px",
        padding: "10px 12px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {children}
    </button>
  );
}
