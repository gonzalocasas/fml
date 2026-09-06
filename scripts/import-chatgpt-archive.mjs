import { readFile, writeFile } from 'node:fs/promises'

const archivePath = process.argv[2]
if (!archivePath) throw new Error('Usage: node scripts/import-chatgpt-archive.mjs <archive.json>')
const archive = JSON.parse(await readFile(archivePath, 'utf8'))
const excludedIds = new Set(['mashed-potatoes'])
const recipes = archive.recipes.filter(recipe => recipe.source_fidelity !== 'conversation_title_only' && !excludedIds.has(recipe.id))

const fidelityLabels = {
  exact_from_prior_conversation: 'Exact recipe recovered from the original conversation.',
  partial_from_prior_conversation: 'Core recipe recovered from the original conversation; some details were unavailable.',
  reconstructed_from_conversation_summary: 'Practical recipe reconstructed from the original conversation summary.',
  partial_from_memory: 'Recipe recovered from durable conversation memory.',
}
const imageFor = categories => {
  const values = categories.map(value => value.toLowerCase())
  if (values.some(value => value === 'drink' || value === 'sauce' || value === 'dip')) return 'chatgpt-drinks-sauces.jpg'
  if (values.some(value => value === 'beef' || value === 'minced meat')) return 'chatgpt-beef.jpg'
  if (values.includes('chicken')) return 'chatgpt-chicken.jpg'
  if (values.some(value => value === 'fish' || value === 'shrimp')) return 'chatgpt-fish.jpg'
  if (values.some(value => value === 'rice' || value === 'pasta')) return 'chatgpt-rice-pasta.jpg'
  return 'chatgpt-vegetable.jpg'
}
const minutesFor = recipe => {
  const title = recipe.title.toLowerCase()
  if (title.includes('slow-cooked')) return 240
  if (title.includes('roast beef')) return 90
  if (/10-minute|ten-minute/.test(title)) return 10
  if (recipe.category.includes('drink') || recipe.category.includes('sauce') || recipe.category.includes('dip')) return 10
  if (title.includes('air-fryer')) return 20
  return recipe.category.includes('main') ? 40 : 25
}
const tagsFor = categories => {
  if (categories.includes('drink')) return ['Drinks']
  if (categories.includes('sauce') || categories.includes('dip')) return ['Sauce','Easy']
  if (categories.some(value => ['side','basic','technique'].includes(value))) return ['Sides']
  if (categories.includes('vegetarian')) return ['Vegetarian']
  return ['Dinner']
}
const q = value => JSON.stringify(value)
const lines = recipes.map(recipe => {
  const summaryIngredients = recipe.ingredients.slice(0,4).map(ingredient => ingredient.item)
  const description = `${fidelityLabels[recipe.source_fidelity]} Saved from your ChatGPT cooking archive on ${recipe.conversation_date}.`
  return `  { id:${q(`chatgpt-${recipe.id}`)}, name:${q(recipe.title)}, minutes:${minutesFor(recipe)}, ingredients:${q(summaryIngredients)}, image:img(${q(imageFor(recipe.category))}), source:'#', sourceLabel:'ChatGPT', tags:${q(tagsFor(recipe.category))}, description:${q(description)}, fullIngredients:${q(recipe.ingredients)}, steps:${q(recipe.steps)}, equipment:${q(recipe.equipment)}, notes:${q(recipe.notes)}, servings:${q(recipe.servings)}, archiveFidelity:${q(recipe.source_fidelity)} },`
})
const output = `import type { Recipe } from './data'\n\nconst img = (name: string) => \`\${import.meta.env.BASE_URL}recipes/\${name}\`\n\nexport const chatgptRecipes: Recipe[] = [\n${lines.join('\n')}\n]\n`
await writeFile('src/chatgptRecipes.ts', output)
console.log(`Imported ${recipes.length} recipes; excluded 7 title-only entries and 1 existing mashed-potato duplicate.`)
