import { useRef } from "react";
import type { GeneratedApp } from "../../App";
import "./appRuntime.css";

interface AppRuntimeProps {
    app: GeneratedApp;
    hide: boolean;
    setAppSize: (height: number, width: number) => void;
}

export default function AppRuntime({ app, hide, setAppSize }: AppRuntimeProps) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const handleLoad = () => {
        const doc = iframeRef.current!.contentDocument!;
        const height = Math.max(
            doc.body.scrollHeight,
            doc.documentElement.scrollHeight
        );
        const width = Math.max(
            doc.body.scrollWidth,
            doc.documentElement.scrollWidth
        );

        setAppSize(height < 350 ? 350 : height, width < 500 ? 500 : width);
    }
    
    return (
        <iframe
            ref={iframeRef}
            title={app.name}
            sandbox="allow-scripts allow-same-origin"
            srcDoc={app.files[0].content}
            onLoad={handleLoad}
            style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: hide ? 'none' : 'block'
            }}
        />
    );
}