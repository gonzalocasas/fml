import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import path from 'node:path'

const exportRoot = process.argv[2]
if (!exportRoot) throw new Error('Usage: node scripts/import-instagram-export.mjs <instagram-export-directory>')

const savedPath = path.join(exportRoot, 'your_instagram_activity/saved/saved_collections.json')
const collections = JSON.parse(await readFile(savedPath, 'utf8'))
const recipeCollections = collections.filter(collection => {
  const name = collection.label_values.find(value => value.label === 'Name')?.value ?? ''
  return /recipe|food idea/i.test(name)
})
if (recipeCollections.length !== 1) throw new Error(`Expected one recipe collection, found ${recipeCollections.length}`)

const entries = recipeCollections[0].label_values.find(value => Array.isArray(value.dict))?.dict ?? []
const valueFor = (entry, label) => entry.dict.find(value => value.label === label)?.value ?? ''
const shortcodeFor = url => url.match(/\/(?:p|reel)\/([^/]+)/)?.[1]
const fixText = value => /[ÃÂðâìØÙèå]/.test(value)
  ? Buffer.from(value, 'latin1').toString('utf8')
  : value

const titles = [
  'Korean all-purpose sauce','Mongolian ground beef noodles','Oi kimchi','Swiss curried beef and rice','Baked figs with Serrano ham','Hot-honey mozzarella eggs','Crispy Parmesan bites','Elevated boiled eggs','Mozzarella-stuffed rice-paper noodles','Stainless-steel scrambled eggs','Algorithmic recipe design','High-protein feta chickpea dip','Steak frites with green peppercorn sauce','French crêpes','Fresh shrimp ceviche','Mango avocado prawn salad','Hot-honey prawns','Tomato tarte tatin','Salmon pan sauces','Smoky butter chicken','Rainbow fruit salad','Mango coconut chia pudding','Beef stir-fry noodles','Japanese smashed potato salad','Greek tomato-feta bread dip','French omelette','Food-storage fundamentals','Roasted grapes with whipped ricotta','Orange iced latte','Lemon posset brûlée','Caramelized dates with yogurt','Accordion potatoes','Crispy tofu','Indian accordion potato snacks','Sticky tofu','Roasted tomato burrata dip','Tuna avocado wrap','Chicken breast with white-wine jus','Air-fryer accordion potatoes','Crispy rice salmon salad','Chicken meal-prep two ways','Sunken honey cake','Fillet steak with potato croquettes','Hot-honey chicken tenders','Slow-roasted spiced cabbage','Mango yogurt cheesecake','Ginger milk curd','Six breakfast toasts','Hot-honey fried chicken','Vegetable bake','Loaded nachos','Orange chicken','Cooking techniques collection','Milanesa Napolitana empanada','Fried-egg hollandaise','One-pan chicken shawarma','Muhammara','Green goddess salad','Poke bowl','The Bear French omelette','Pasta alla cenere','Crispy rice-paper eggs','Beef-stuffed potato roll','Crispy potato schiacciata','Osso buco','Classic mashed potatoes','Marrakesh carrot ribbon salad','Sheet-pan kefta','Harissa-roasted chickpeas','Dulce de batata','Extra-crispy roast potatoes','Tomato and burrata tarte tatin','Red-wine short ribs','Cacio e pepe','Oven-crisp torreznos','Nori-wrapped crispy tofu','Chicken-stuffed rice bun','Korean beef bulgogi','Oven-baked kebab','Courgette ribbons with tahini yogurt','Miso-glazed carrots','Jalapeño rosé','Gazpacho','Produce-storage guide','Lemon yogurt chicken','Apricot-stuffed leeks','Yemeni lahsa','Perfect seared scallops','Spaghetti alla Nerano','Frozen tomato burrata','Easy butter chicken','Beet-cured salmon','Fruit and vegetable storage hacks','Watermelon tuna steak','Three chicken marinades','Budget caviar and foie gras','Chinese tea eggs','Dill beurre blanc','Truffled egg yolk','Fondant potatoes','Homemade mozzarella','Oven-roasted chicken thighs'
]
if (titles.length !== entries.length) throw new Error(`Title catalogue has ${titles.length} items for ${entries.length} saves`)

const ingredientSets = [
  ['see original post'],['ground beef','noodles','broccoli','soy sauce'],['cucumber','gochugaru','garlic','fish sauce'],['ground beef','rice','curry','onion'],['figs','Serrano ham','cream cheese','Parmesan'],['eggs','mozzarella','hot honey'],['egg whites','Parmesan'],['eggs','see original post'],['rice paper','mozzarella','gochujang','spring onion'],['eggs','butter','salt'],['see original post'],['Greek yogurt','chickpeas','feta','tomatoes'],['sirloin steak','potatoes','green peppercorns','cream'],['flour','eggs','milk','butter'],['shrimp','lime','tomato','cucumber'],['mango','avocado','prawns','red onion'],['prawns','honey','sriracha','garlic'],['tomatoes','puff pastry','balsamic','feta'],['salmon','see original post'],['chicken','yogurt','tomato','spices'],['mixed fruit','berries'],['coconut milk','Greek yogurt','chia seeds','mango'],['beef','noodles','see original post'],['potatoes','eggs','cucumber','bacon'],['tomato','feta','olives','olive oil'],['eggs','butter','salt'],['see original post'],['grapes','ricotta','feta','hot honey'],['espresso','orange','sugar','milk'],['lemon','cream','sugar'],['dates','Greek yogurt','butter','cinnamon'],['potatoes','olive oil','herbs'],['tofu','see original post'],['potatoes','spices'],['tofu','soy sauce','teriyaki','ginger'],['tomatoes','burrata','garlic','baguette'],['tuna','avocado','red onion','tortilla'],['chicken','white wine','thyme','butter'],['potatoes','olive oil','seasoning'],['rice','salmon','cucumber','avocado'],['chicken','vegetables','soy sauce','cream cheese'],['egg yolks','egg whites','honey','flour'],['fillet steak','potatoes','see original post'],['chicken tenders','hot sauce','honey','flour'],['cabbage','butter','paprika','garlic'],['mango','Greek yogurt','cream cheese','eggs'],['milk','condensed milk','ginger'],['plantain','sweet potato','tofu','avocado'],['chicken','honey','breadcrumbs','chilli'],['vegetables','see original post'],['tortilla chips','cheese','see original post'],['chicken','orange','see original post'],['see original post'],['beef schnitzel','tomato sauce','cheese','empanada dough'],['eggs','olive oil','mustard','lemon'],['chicken thighs','Greek yogurt','garlic','lemon'],['red peppers','walnuts','garlic','pomegranate molasses'],['cabbage','cucumber','avocado','basil'],['fish','rice','vegetables','see original post'],['eggs','butter','salt'],['fusilli','Gorgonzola','black olives'],['rice paper','egg yolks','avocado','tomato'],['potatoes','ground beef','cheese','onion'],['potatoes','flour','olive oil','rosemary'],['veal shanks','tomato','wine','stock'],['potatoes','butter','milk','cream'],['carrots','courgette','cucumber','cumin'],['ground meat','onion','spices','herbs'],['chickpeas','harissa','tomatoes','red pepper'],['sweet potato','sugar','agar agar','cocoa'],['potatoes','baking soda','rosemary','garlic'],['tomatoes','puff pastry','burrata','balsamic'],['beef ribs','red wine','carrot','rosemary'],['spaghetti','Pecorino','black pepper'],['pork belly','salt','vinegar','ghee'],['tofu','nori','gochujang','garlic'],['rice','chicken','curry'],['beef','soy sauce','sesame','spring onion'],['ground meat','onion','spices'],['courgette','tahini','yogurt','mint'],['carrots','miso','honey','soy sauce'],['jalapeño','rosé wine'],['tomatoes','cucumber','green pepper','garlic'],['see original post'],['chicken','yogurt','lemon','garlic'],['leeks','apricots','rice','mint'],['eggs','tomatoes','onion','cheese'],['scallops','butter','salt'],['spaghetti','courgette','cheese','olive oil'],['tomatoes','burrata','balsamic','olive oil'],['chicken','butter','tomato','spices'],['salmon','beetroot','salt','sugar'],['see original post'],['watermelon','rice','seasoning'],['chicken','garlic','Parmesan','balsamic'],['caviar','foie gras','see original post'],['eggs','black tea','soy sauce','star anise'],['butter','white wine','shallot','dill'],['egg yolk','truffle broth'],['potatoes','butter','garlic','stock'],['milk','vinegar'],['chicken thighs','onion','Greek yogurt','lemon']
]
if (ingredientSets.length !== entries.length) throw new Error(`Ingredient catalogue has ${ingredientSets.length} items for ${entries.length} saves`)

// Exact matches already in FML, followed by repeated saves of the same dish in this collection.
const skip = new Set([
  'DCo0xcaPEn6','DBreHgZSZ_0','DA0_iqJJfiv','C_d5ruZSED6','C74NaDagNsr','C61PV29LmJD','DSPr1-0AnH8',
  'DYCpGE1y_aK','DVYN_fsDSis','DUDqieLCXBx','C-aXC6DORvk','DC9oOqioxBA'
])

const tagsFor = title => {
  const text = title.toLowerCase()
  if (/cake|posset|fruit salad|dates|cheesecake|curd/.test(text)) return ['Dessert']
  if (/latte|rosé/.test(text)) return ['Drinks']
  if (/^(?:korean all-purpose sauce|salmon pan sauces|fried-egg hollandaise|dill beurre blanc|muhammara)|\bdip$/.test(text)) return ['Sauce','Easy']
  if (/salad|gazpacho|carrot|cabbage|leek|chickpea|tofu|tomato/.test(text)) return ['Vegetarian']
  if (/egg|toast|crêpe/.test(text)) return ['Breakfast','Easy']
  if (/potato|storage|technique|design|scallop/.test(text)) return ['Sides']
  return ['Dinner']
}
const minutesFor = (title, caption) => {
  const explicit = caption.match(/prep time:\s*(\d{1,3})\s*(?:min|minute)/i)?.[1]
  if (explicit) return Number(explicit)
  if (/osso buco|short rib|slow-roasted/.test(title.toLowerCase())) return 180
  if (/cake|roast|bake|shawarma|kebab|chicken thigh/.test(title.toLowerCase())) return 50
  if (/dip|sauce|salad|latte|eggs|toast|gazpacho/.test(title.toLowerCase())) return 15
  return 30
}

const selected = entries.map((entry, index) => {
  const source = valueFor(entry, 'URL')
  const shortcode = shortcodeFor(source)
  const caption = fixText(valueFor(entry, 'Caption'))
  return { shortcode, source, caption, name: titles[index], ingredients: ingredientSets[index] }
}).filter(recipe => recipe.shortcode && !skip.has(recipe.shortcode))

const imageDir = path.resolve('public/recipes')
await mkdir(imageDir, { recursive: true })
const decodeHtml = value => value.replaceAll('&amp;', '&').replaceAll('&#x2F;', '/').replaceAll('&quot;', '"')
for (const [index, recipe] of selected.entries()) {
  const imagePath = path.join(imageDir, `instagram-${recipe.shortcode}.jpg`)
  try {
    await access(imagePath)
    console.log(`[${index + 1}/${selected.length}] ${recipe.name} (cached)`)
    continue
  } catch {}
  const html = await fetch(recipe.source, { headers: { 'user-agent': 'Mozilla/5.0' } }).then(response => response.text())
  const imageUrl = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
  if (!imageUrl) throw new Error(`No cover found for ${recipe.source}`)
  const image = await fetch(decodeHtml(imageUrl)).then(response => {
    if (!response.ok) throw new Error(`Cover download failed (${response.status}) for ${recipe.source}`)
    return response.arrayBuffer()
  })
  await writeFile(imagePath, Buffer.from(await image))
  console.log(`[${index + 1}/${selected.length}] ${recipe.name}`)
}

const quote = value => `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
const lines = selected.map(recipe => {
  const ingredients = recipe.ingredients.map(quote).join(',')
  const tags = tagsFor(recipe.name).map(quote).join(',')
  return `  { id:${quote(`instagram-${recipe.shortcode.toLowerCase()}`)}, name:${quote(recipe.name)}, minutes:${minutesFor(recipe.name, recipe.caption)}, ingredients:[${ingredients}], image:img(${quote(`instagram-${recipe.shortcode}`)}), source:${quote(recipe.source)}, sourceLabel:'Instagram', tags:[${tags}] },`
})
const output = `import type { Recipe } from './data'\n\nconst img = (name: string) => \`\${import.meta.env.BASE_URL}recipes/\${name}.jpg\`\n\nexport const instagramRecipes: Recipe[] = [\n${lines.join('\n')}\n]\n`
await writeFile('src/instagramRecipes.ts', output)
console.log(`Imported ${selected.length} unique recipes from ${entries.length} saved posts.`)
