export async function getRecipeFromChefClaude(ingredientsArr) {
    const response = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientsArr }),
    })

    if (!response.ok) {
        const { error } = await response.json().catch(() => ({}))
        throw new Error(error || "Unable to generate a recipe")
    }

    const { recipe } = await response.json()
    return recipe
}
