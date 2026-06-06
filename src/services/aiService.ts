export interface GeneratedArtifact {
  name: string;
  icon: string;
  files: {
    path: string;
    content: string;
  }[];
}

export class GeminiService {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateApp(prompt: string): Promise<GeneratedArtifact> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an expert web application generator.

Return ONLY valid JSON.

{
  "name": "",
  "icon": "",
  "files": [
    {
      "path": "index.html",
      "content": ""
    }
  ]
}

Rules:

- Generate a COMPLETE standalone HTML application.
- Use TailwindCSS CDN:
  <script src="https://cdn.tailwindcss.com"></script>

UI Requirements:
- icon should be svg string of size 20x20
- Modern UI
- TailwindCSS
- Responsive
- Rounded corners
- Nice spacing
- Professional design

Technical Requirements:

- Use vanilla JavaScript.
- No external API calls
- Do not use React.
- Do not use npm packages.
- Do not use external dependencies.
- No imports
- No modules
- Everything must be inside index.html.
- Application must be fully functional.
- Return ONLY JSON.

User Request:
${prompt}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response");
    }

    return JSON.parse(
      text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );
  }
}