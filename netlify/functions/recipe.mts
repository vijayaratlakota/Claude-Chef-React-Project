import Anthropic from "@anthropic-ai/sdk"
import type { Config } from "@netlify/functions"

const SYSTEM_PROMPT = `
You receive a list of ingredients and suggest a recipe using some or all of them.
You may include a few additional ingredients. Format the response as markdown.
`

export default async (request: Request) => {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 })
    }

    try {
        const { ingredients } = await request.json()

        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return Response.json({ error: "Add at least one ingredient" }, { status: 400 })
        }

        const apiKey = Netlify.env.get("ANTHROPIC_API_KEY")
        if (!apiKey) {
            return Response.json({ error: "Recipe service is not configured" }, { status: 503 })
        }

        const anthropic = new Anthropic({ apiKey })
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [{
                role: "user",
                content: `I have ${ingredients.join(", ")}. Please recommend a recipe.`,
            }],
        })
        const recipe = message.content.find((block) => block.type === "text")?.text

        if (!recipe) {
            throw new Error("The recipe response was empty")
        }

        return Response.json({ recipe })
    } catch (error) {
        console.error("Recipe generation failed", error)
        return Response.json({ error: "Unable to generate a recipe" }, { status: 500 })
    }
}

export const config: Config = {
    path: "/api/recipe",
}
