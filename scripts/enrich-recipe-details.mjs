import { readFile, writeFile } from 'node:fs/promises'

const instagramExport = process.argv[2]
const unescapeTs = value => value.replaceAll("\\'", "'").replaceAll('\\\\','\\')
const parseRecipes = text => text.split('\n').flatMap(line => {
  const id = line.match(/\bid:'((?:\\'|[^'])+)'/)?.[1]
  if (!id) return []
  const field = name => unescapeTs(line.match(new RegExp(`\\b${name}:'((?:\\\\'|[^'])*)'`))?.[1] ?? '')
  const ingredientsText = line.match(/\bingredients:\[([^\]]*)\]/)?.[1] ?? ''
  const ingredients = [...ingredientsText.matchAll(/'((?:\\'|[^'])+)'/g)].map(match => unescapeTs(match[1]))
  return [{ id:unescapeTs(id), name:field('name'), source:field('source'), ingredients }]
})
const recipes = [
  ...parseRecipes(await readFile('src/data.ts','utf8')),
  ...parseRecipes(await readFile('src/instagramRecipes.ts','utf8')),
]

const decodeHtml = value => String(value).replace(/&#x([0-9a-f]+);/gi,(_,code)=>String.fromCodePoint(parseInt(code,16))).replace(/&#(\d+);/g,(_,code)=>String.fromCodePoint(Number(code))).replaceAll('&quot;','"').replaceAll('&#039;',"'").replaceAll('&apos;',"'").replaceAll('&amp;','&').replaceAll('&nbsp;',' ')
const stripHtml = value => decodeHtml(String(value ?? '').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()
const fullIngredients = values => values.map(value => ({ item:stripHtml(typeof value === 'string' ? value : value?.item ?? value?.name ?? ''), amount:null })).filter(value => value.item)
const instructions = value => {
  if (!value) return []
  const values = Array.isArray(value) ? value : [value]
  return values.flatMap(item => {
    if (typeof item === 'string') return [stripHtml(item)]
    if (Array.isArray(item?.itemListElement)) return instructions(item.itemListElement)
    return [stripHtml(item?.text ?? item?.name ?? '')]
  }).filter(Boolean)
}
const findRecipeSchema = value => {
  if (!value || typeof value !== 'object') return null
  if (Array.isArray(value)) { for (const item of value) { const found=findRecipeSchema(item); if(found)return found } return null }
  const type = value['@type']
  if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) return value
  for (const child of Object.values(value)) { const found=findRecipeSchema(child); if(found)return found }
  return null
}
const schemaFromUrl = async url => {
  const response = await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (compatible; FML recipe importer)'}})
  if (!response.ok) throw new Error(`${response.status}`)
  const html = await response.text()
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const schema=findRecipeSchema(JSON.parse(match[1].trim())); if(schema)return schema } catch {}
  }
  return null
}

const fixText = value => /[ÃÂðâìØÙèå]/.test(value) ? Buffer.from(value,'latin1').toString('utf8') : value
const instagramCaptions = new Map()
if (instagramExport) {
  const archive=JSON.parse(await readFile(instagramExport,'utf8'))
  const collection=archive.find(item=>item.label_values?.some(value=>value.label==='Name'&&/recipe|food idea/i.test(value.value)))
  const entries=collection?.label_values?.find(value=>Array.isArray(value.dict))?.dict ?? []
  for(const entry of entries){
    const get=label=>entry.dict.find(value=>value.label===label)?.value??''
    const shortcode=get('URL').match(/\/(?:p|reel)\/([^/]+)/)?.[1]
    if(shortcode)instagramCaptions.set(shortcode,fixText(get('Caption')))
  }
}
const summaryIngredients = recipe => recipe.ingredients.map(item=>({item,amount:null}))
const captionDetails = (caption,recipe) => {
  const normalized=caption.replaceAll('\r','').replace(/[ \t]+/g,' ')
  const description=normalized.split('\n').map(line=>line.trim()).find(line=>line&&!/^(?:ingredients?|ingredientes?|zutaten|method|instructions?|recipe)\s*:?$/i.test(line))?.replace(/\s*#.*$/,'').slice(0,280) || `Saved from Instagram: ${recipe.name}.`
  const ingredientMarker=/\b(?:ingredients?|ingredientes?|zutaten|ingredienti|malzemeler|you(?:'|’)ll need|to make)\s*:?/i
  const methodMarker=/\b(?:method|instructions?|preparation|preparación|how to make|steps?|pasos|preparazione)\s*:?/i
  const ingredientStart=normalized.search(ingredientMarker)
  const methodStart=normalized.search(methodMarker)
  let ingredientLines=[]
  if(ingredientStart>=0&&(methodStart<0||ingredientStart<methodStart)){
    const block=normalized.slice(ingredientStart,methodStart>ingredientStart?methodStart:ingredientStart+1800).replace(ingredientMarker,'')
    ingredientLines=block.split(/\n|•|(?=\s[-*]\s)|(?=\s\d+[.)]\s)/).map(line=>line.replace(/^\s*(?:[-*]|\d+[.)])\s*/,'').trim()).filter(line=>line.length>1&&line.length<170&&!/comment|follow|recipe in|serves|method|how to make|instructions/i.test(line)&&!/^[A-Za-z &/–-]{2,30}:$/.test(line)).slice(0,20)
  }else if(methodStart>0){
    ingredientLines=normalized.slice(0,methodStart).split(/\n|•|(?=\s[-*]\s)/).map(line=>line.replace(/^\s*[-*]\s*/,'').trim()).filter(line=>line.length>2&&line.length<170&&/\d|\b(?:salt|pepper|oil|butter|prawns?|shrimp|chicken|beef|tofu|eggs?)\b/i.test(line)&&!/method|comment|follow|ingredients/i.test(line)).slice(0,20)
  }
  let steps=[]
  if(methodStart>=0){
    const block=normalized.slice(methodStart).replace(methodMarker,'')
    steps=block.split(/\n|(?=\s(?:step\s*)?\d+[.)]\s)/i).map(line=>line.replace(/^\s*(?:[•*-]\s*)?(?:step\s*)?\d*[.)]?\s*/i,'').trim()).filter(line=>line.length>8&&!/#|\bfyp\b|foryou|comment|follow/i.test(line)&&!/^\(.*(?:recipe|dinner ideas|homemade).*\)$/i.test(line)).slice(0,16)
  } else {
    steps=normalized.split('\n').map(line=>line.trim()).filter(line=>/^(?:\d+[.)]|❶|❷|❸|❹|❺|❻|❼|❽)/.test(line)).map(line=>line.replace(/^(?:\d+[.)]|[❶❷❸❹❺❻❼❽])\s*/, '')).slice(0,16)
  }
  return {
    description,
    fullIngredients:ingredientLines.length>=2?fullIngredients(ingredientLines):summaryIngredients(recipe),
    steps:steps.length?steps:['The saved post does not contain a written method. Open the original Instagram post to follow the demonstrated preparation.'],
  }
}

const details={}
let structured=0,instagram=0,fallback=0
for(const [index,recipe] of recipes.entries()){
  const shortcode=recipe.source.match(/\/(?:p|reel)\/([^/]+)/)?.[1]
  if(shortcode&&instagramCaptions.has(shortcode)){
    details[recipe.id]=captionDetails(instagramCaptions.get(shortcode),recipe);instagram++
  }else if(recipe.source&&recipe.source!=='#'&&!/instagram\.com|youtube\.com|youtu\.be|tiktok\.com/i.test(recipe.source)){
    try{
      const schema=await schemaFromUrl(recipe.source)
      if(schema&&schema.recipeIngredient?.length&&instructions(schema.recipeInstructions).length){
        details[recipe.id]={description:stripHtml(schema.description)||`${recipe.name}, from the original recipe.`,fullIngredients:fullIngredients(schema.recipeIngredient),steps:instructions(schema.recipeInstructions),servings:Array.isArray(schema.recipeYield)?schema.recipeYield[0]:schema.recipeYield??null};structured++
      }else throw new Error('no Recipe schema')
    }catch(error){
      details[recipe.id]={description:`Recipe summary for ${recipe.name}.`,fullIngredients:summaryIngredients(recipe),steps:['The linked source does not expose a complete written method. Open the original recipe for its preparation instructions.']};fallback++
    }
  }else{
    details[recipe.id]={description:`Recipe summary for ${recipe.name}.`,fullIngredients:summaryIngredients(recipe),steps:[recipe.source==='#'?'The archived entry does not include a recoverable written method. Use the ingredient list as a starting point.':'Open the original source to follow the complete preparation.']};fallback++
  }
  console.log(`[${index+1}/${recipes.length}] ${recipe.name}`)
}
await writeFile('src/externalRecipeDetails.ts',`import type { Recipe } from './data'\n\nexport const externalRecipeDetails: Record<string, Partial<Recipe>> = ${JSON.stringify(details,null,2)}\n`)
console.log({recipes:recipes.length,structured,instagram,fallback})
