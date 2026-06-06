import { useRef, useState } from "react";
import type { AppState } from "../../App";
import { Minus } from "lucide-react";
import "./searchWindow.css"

interface SearchWindowProps {
    state: AppState;
    zIndex: number;
    onFocus: () => void;
    setPromptWindowState: (state: AppState) => void;
    createAppFromPrompt: (prompt: string) => Promise<void>;
}

export default function SearchWindow({ state, zIndex, onFocus, setPromptWindowState, createAppFromPrompt }: SearchWindowProps) {
    const dragRef = useRef(false);

    const [position, setPosition] = useState({
        x: window.innerWidth / 2 - 400,
        y: window.innerHeight / 2 - 250,
    });

    const [size] = useState({ width: 700, height: 'fit-content', });
    const dragOffset = useRef({ x: 0, y: 0, });

    const handleMouseDown = (
        e: React.MouseEvent
    ) => {
        dragRef.current = true;
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };

        const handleMouseMove = (
            moveEvent: MouseEvent
        ) => {
            if (!dragRef.current) return;

            setPosition({
                x: moveEvent.clientX - dragOffset.current.x,
                y: moveEvent.clientY - dragOffset.current.y,
            });
        };

        const handleMouseUp = () => {
            dragRef.current = false;
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const onMinimize = () => {
        setPromptWindowState("minimized");
    }

    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);

    const handleCreateApp = async () => {
        console.log(state);
        setGenerating(true);
        await createAppFromPrompt(prompt);
        setGenerating(false);
    };

    return (
        <div className="search-window"
            onMouseDown={onFocus}
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                zIndex,
                visibility: state === 'minimized' ? 'hidden' : 'visible',
            }}>
            <div className="search-window-header" onMouseDown={handleMouseDown} >
                <div className="search-window-title"> AI App Builder </div>

                <div className="search-window-actions">
                    <button className="search-window-action-btn" onClick={onMinimize} >
                        <Minus size={16} />
                    </button>
                </div>
            </div>

            <div className="search-window-content">
                <div className="prompt-window">
                    <div className="prompt-header">
                        <div>
                            <h2>Create App</h2>
                            <p> Describe the application you want to generate.</p>
                        </div>
                    </div>

                    <div className="prompt-editor">
                        <textarea value={prompt}
                            className="prompt-input"
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Examples:
                            • Build a modern calculator
                            • Create a To Do App"
                        />
                    </div>

                    <div className="prompt-actions">
                        <button className="win-btn"
                            onClick={() => setPromptWindowState("minimized")}>
                            Cancel
                        </button>

                        <button type="button"
                            className="win-btn win-btn-primary"
                            disabled={generating || !prompt.trim()}
                            onClick={handleCreateApp}>
                            {generating ? "Generating..." : "✨ Generate App"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}