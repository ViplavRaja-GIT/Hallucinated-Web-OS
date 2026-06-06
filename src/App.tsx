import { Search } from "lucide-react";
import osLogo from "./assets/os-logo.svg";
import Window from "./components/Window/window";
import './App.css'
import { useEffect, useState } from "react";
import { GeminiService } from "./services/aiService";
import AISettingsWindow from "./components/AISettingsWindow/AISettingsWindow";
import SearchWindow from "./components/SearchWindow/searchWindow";


export type AppState = "normal" | "minimized" | "maximized";

export type GeneratedApp = {
  id: string;
  icon: string;
  name: string;
  state: AppState;
  zIndex: number;
  files: {
    path: string;
    content: string;
  }[];
};

const INITIAL_Z_INDEX = 10;

const getSavedApps = (): GeneratedApp[] => {
  const loadedApps: GeneratedApp[] = [];
  let index = 1;
  Object.keys(localStorage)
    .forEach(key => {
      if (key.startsWith("app-")) {
        const appStr = localStorage.getItem(key);
        if (appStr) {
          const app: GeneratedApp = JSON.parse(appStr);
          app.state = "minimized";
          app.zIndex = INITIAL_Z_INDEX + index;
          loadedApps.push(app);
          index++;
        }
      }
    });
  return loadedApps;
}

const removeSavedApps = () => {
  Object.keys(localStorage)
    .forEach(key => {
      if (key.startsWith("app-")) {
        localStorage.removeItem(key);
      }
    });
}

const dateFormat: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export default function App() {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [promptWindowState, setPromptWindowState] = useState<AppState>("minimized"); //minimized
  const [promptWindowZIndex, setPromptWindowZIndex] = useState(100);
  const [apps, setApps] = useState<GeneratedApp[]>(getSavedApps);
  const [hasAISettings, setHasAISettings] = useState<boolean>(
    localStorage.getItem("ai_settings") === null ? false : true
  );

  const [dateTime, setDateTime] = useState(new Date().toLocaleString([], dateFormat));

  setInterval(() => {
    setDateTime(new Date().toLocaleString([], dateFormat));
  }, 100);

  const geiminiKey = () => localStorage.getItem("gemini_api_key") as string;

  const createAppFromPrompt = async (prompt: string) => {
    try {
      const service = new GeminiService(geiminiKey());
      const artifact = await service.generateApp(prompt);
      const app: GeneratedApp = { ...artifact, state: "normal", id: crypto.randomUUID(), zIndex: INITIAL_Z_INDEX + apps.length + 1 }
      setApps(prev => [...prev, app]);
      setPromptWindowState("minimized");
    } catch (error) {
      setPromptWindowState("minimized");
      console.error(error);
      alert("Failed to generate app. Please check the console for more details.");
    }
  }

  const setAppState = (id: string, state: AppState) => {
    setApps(prev =>
      prev.map(a =>
        a.id === id
          ? {
            ...a,
            state,
          }
          : a
      )
    );
  }

  const handleOnSave = (success: boolean) => {
    setHasAISettings(success);
  }

  const handleOnAppSave = (app: GeneratedApp) => {
    localStorage.setItem(`app-${app.id}`, JSON.stringify(app));
  }

  const handlePromptWindowFocus = () => {
    const maxZ = Math.max(...apps.map(a => a.zIndex), 10);
    setPromptWindowZIndex(maxZ + 1);
  }

  const handleOnUpdate = async (prompt: string, id: string) => {
    try {
      const existingApp = apps.find(a => a.id === id)!;
      const service = new GeminiService(geiminiKey());
      const artifact = await service.generateApp(prompt + "\n\n\n Existing code : \n" + existingApp.files[0].content);
      setApps(prev =>
        prev.map(a =>
          a.id === id
            ? {
              ...a,
              files: artifact.files,
              icon: artifact.icon,
              name: artifact.name,
            }
            : a
        )
      );
      if (localStorage.getItem(`app-${id}`)) {
        const app = apps.find(a => a.id === id);
        if (app)
          handleOnAppSave({
            ...app,
            files: artifact.files,
            icon: artifact.icon,
            name: artifact.name,
          });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate app. Please check the console for more details.");
    }
  }

  const bringToFront = (id: string) => {
    setApps(prev => {
      const maxZ = Math.max(
        ...prev.map(a => a.zIndex),
        0
      );

      return prev.map(app =>
        app.id === id
          ? {
            ...app,
            zIndex: maxZ + 1,
          }
          : app
      );
    });
  };

  useEffect(() => {
    const handler = () => setShowStartMenu(false);

    if (showStartMenu)
      document.addEventListener("click", handler);

    return () => document.removeEventListener("click", handler);
  }, [showStartMenu]);

  return (
    <div className="desktop">
      {!hasAISettings && <AISettingsWindow onSave={handleOnSave} />}
      <div className="desktop-overlay" />

      {promptWindowState !== "minimized" &&
        <SearchWindow state={promptWindowState}
          onFocus={handlePromptWindowFocus}
          zIndex={promptWindowZIndex}
          setPromptWindowState={setPromptWindowState}
          createAppFromPrompt={createAppFromPrompt}
        />}

      {apps.map(app => (
        <Window key={app.id} app={app}
          onSave={() => handleOnAppSave(app)}
          onUpdate={handleOnUpdate}
          onFocus={() => bringToFront(app.id)}
          onClose={() => setApps(prev => prev.filter(a => a.id !== app.id))}
          onMinimize={() => setAppState(app.id, "minimized")}
          onMaximize={() => setAppState(app.id, app.state === "maximized" ? "normal" : "maximized")}>
        </Window>
      ))}

      <div className="taskbar">
        <button className="taskbar-button" onClick={(e) => { setShowStartMenu(prev => !prev); e.stopPropagation(); }}>
          <img src={osLogo} alt="Windows" className="taskbar-os-icon" />
        </button>

        <button className={`taskbar-button
          ${promptWindowState !== "minimized" ? "taskbar-button-active" : ""}`}
          onClick={() => {
            if (promptWindowState === 'minimized') {
              handlePromptWindowFocus();
            }
            setPromptWindowState(promptWindowState === "normal" ? 'minimized' : 'normal');
          }}>
          <Search size={20} />
        </button>

        {apps.map(app => (
          <button key={app.id} className={`taskbar-button ${app.state !== "minimized" ? "taskbar-button-active" : ""}`}
            onClick={() => {
              setAppState(app.id, app.state !== 'minimized' ? "minimized" : "normal");
              bringToFront(app.id);
            }}>
            <img src={"data:image/svg+xml;charset=utf-8," + encodeURIComponent(app.icon)}
              alt="App Icon" className="taskbar-icon" />
          </button>
        ))}

        {showStartMenu && (
          <div className="start-menu" onClick={e => e.stopPropagation()}>
            <button className="start-menu-item"
              onClick={() => { setApps(getSavedApps()); setShowStartMenu(false); }}>
              🔄 Reload Saved Apps
            </button>

            <button className="start-menu-item"
              onClick={() => {
                if (confirm("Delete all saved apps?")) {
                  removeSavedApps();
                  setApps([]);
                }
                setShowStartMenu(false);
              }}>
              🗑️ Clear Saved Apps
            </button>

            <div className="start-menu-divider" />

            <button className="start-menu-item danger"
              onClick={() => {
                localStorage.removeItem("ai_settings");
                window.location.reload();
              }}>
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="system-tray">
        {/* <Wifi size={18} />
        <Volume2 size={18} />
        <Battery size={18} /> */}
        <div className="system-tray-time"> {dateTime} </div>
      </div>
    </div>
  );
}