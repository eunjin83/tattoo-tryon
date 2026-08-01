"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";

const tattooDesigns = [
  {
    id: "butterfly",
    name: "Butterfly",
    src: "/tattoos/butterfly.png",
  },
];

export default function TryOn() {
  const [bodyImage, setBodyImage] = useState<string | null>(null);

  const [selectedTattoo, setSelectedTattoo] = useState(
    tattooDesigns[0].src
  );

  const [position, setPosition] = useState({
    x: 50,
    y: 55,
  });

  const [size, setSize] = useState(24);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(80);
  const [flipped, setFlipped] = useState(false);

  const [blendMode, setBlendMode] = useState<
    "normal" | "multiply"
  >("multiply");

  const [isDragging, setIsDragging] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);

  function handleBodyImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setBodyImage(URL.createObjectURL(file));
  }

  function moveTattoo(clientX: number, clientY: number) {
    if (!isDragging || !previewRef.current) {
      return;
    }

    const previewBox =
      previewRef.current.getBoundingClientRect();

    const x =
      ((clientX - previewBox.left) / previewBox.width) * 100;

    const y =
      ((clientY - previewBox.top) / previewBox.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  function handlePointerMove(
    event: PointerEvent<HTMLDivElement>
  ) {
    moveTattoo(event.clientX, event.clientY);
  }

  function resetTattoo() {
    setPosition({
      x: 50,
      y: 55,
    });

    setSize(24);
    setRotation(0);
    setOpacity(80);
    setFlipped(false);
    setBlendMode("multiply");
  }

  return (
    <section>
      {/* Part 2와 Part 3에서 화면 코드를 넣습니다. */}
    </section>
  );
}