export class AIValidatorService {

    async validateProvider(
        provider: string,
        apiKey: string,
        model: string
    ) {
        try {
            switch (provider) {
                case "gemini":
                    return await this.validateGemini(
                        apiKey,
                        model
                    );

                case "openai":
                    // return await validateOpenAI(
                    //   apiKey,
                    //   model
                    // );
                    return false;

                case "anthropic":
                    // return await validateClaude(
                    //   apiKey,
                    //   model
                    // );
                    return false;

                default:
                    return false;
            }
        } catch {
            return false;
        }
    }

    private async validateGemini(apiKey: string, model: string) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: "hello",
                                },
                            ],
                        },
                    ],
                }),
            }
        );
        return response.ok;
    }
}