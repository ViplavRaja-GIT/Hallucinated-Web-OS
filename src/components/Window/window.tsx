import "./Window.css";
import React, { useEffect, useRef, useState } from "react";
import { Expand, Minimize, Minus, RotateCcw, SaveIcon, Trash } from "lucide-react";
import type { GeneratedApp } from "../../App";
import AppRuntime from "../AppRuntime/appRuntime";

interface WindowProps {
  app: GeneratedApp;
  onUpdate: (updatedPrompt: string, id: string) => Promise<void>;
  onFocus: () => void;
  onSave: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function Window({
  app,
  onUpdate,
  onFocus,
  onSave,
  onMinimize,
  onMaximize,
  onClose,
}: WindowProps) {
  const dragRef = useRef(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [suggestionPrompt, setSuggestionPrompt] = useState("");
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 400, y: window.innerHeight / 2 - 250,
  });
  const [size, setSize] = useState<{ width: number | string, height: number | string }>
    ({ width: 'max-content', height: 'max-content', });
  const dragOffset = useRef({ x: 0, y: 0, });
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [framePosition, setFramePosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (app.state === "maximized") return;
    dragRef.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;

      setPosition({
        x: moveEvent.clientX - dragOffset.current.x,
        y: moveEvent.clientY - dragOffset.current.y,
      });

      setFramePosition({
        x: moveEvent.clientX - dragOffset.current.x,
        y: moveEvent.clientY - dragOffset.current.y,
      })
    };

    const handleMouseUp = () => {
      dragRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const setAppSize = (height: number, width: number) => {
    const newHeight = height + 42 + 24; // height + header + padding
    const newWidth = width + 24; // width + padding
    setSize({ width: newWidth, height: newHeight })
    setFrameSize({ width: newWidth, height: newHeight });
    setPosition({
      x: (window.innerWidth - newWidth) / 2,
      y: (window.innerHeight - newHeight) / 2,
    });
    setFramePosition({
      x: (window.innerWidth - newWidth) / 2,
      y: (window.innerHeight - newHeight) / 2,
    });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    await onUpdate(suggestionPrompt, app.id);
    setUpdating(false);
    setShowUpdate(false);
  }

  useEffect(() => {
    if (app.state === "maximized") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize({ width: window.innerWidth, height: window.innerHeight - 80 });
      setPosition({ x: 0, y: 0 });
    } else if (app.state === "normal") {
      setSize(frameSize);
      setPosition(framePosition);
    }
  }, [app.state, frameSize, framePosition]);

  return (
    <div
      className="window"
      onMouseDown={onFocus}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        visibility: app.state === 'minimized' ? 'hidden' : 'visible',
        zIndex: app.zIndex
      }}>
      <div className="window-header" style={{ cursor: app.state === "maximized" ? "default" : "move" }} onMouseDown={handleMouseDown} >
        <div className="window-title"> {app.name} </div>

        <div className="window-actions">
          <button className="window-action-btn" onClick={() => setShowUpdate(prev => !prev)}>
            <RotateCcw size={16} />
          </button>

          <button className="window-action-btn" onClick={onSave}>
            <SaveIcon size={16} />
          </button>

          <button className="window-action-btn" onClick={onMinimize} >
            <Minus size={16} />
          </button>

          <button className="window-action-btn" onClick={onMaximize} >
            {app.state === 'normal' ? <Expand size={16} /> : <Minimize size={16} />}
          </button>

          <button className="window-action-btn window-close-btn" onClick={onClose} >
            <Trash size={16} />
          </button>
        </div>
      </div>

      <div className="window-content">
        <AppRuntime hide={showUpdate} app={app} setAppSize={setAppSize} />
        { showUpdate && <div className="suggestion-prompt-window">
          <div className="suggestion-prompt-header">
            <div>
              <h2>Update App</h2>
              <p>Describe the suggestion for the app.</p>
            </div>
          </div>

          <div className="suggestion-prompt-editor">
            <textarea value={suggestionPrompt}
              className="suggestion-prompt-input"
              onChange={(e) => setSuggestionPrompt(e.target.value)}
              placeholder="Examples:
                • Update theme
                • Change UI Styling"/>
          </div>

          <div className="suggestion-prompt-actions">
            <button className="win-btn"
              onClick={() => setShowUpdate(prev => !prev)}>
              Cancel
            </button>

            <button type="button"
              className="win-btn win-btn-primary"
              disabled={updating || !suggestionPrompt.trim()}
              onClick={handleUpdate}>
              {updating ? "Updating..." : "✨ Update App"}
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}