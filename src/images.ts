export type RecipeImageKind = 'thumb' | 'card' | 'detail'

export function recipeImageVariants(source: string) {
  const stem = source.replace(/\/recipes\/([^/]+)\.[^.]+$/, '/recipes/generated/$1')
  return {
    thumb: `${stem}-thumb.webp`,
    card: `${stem}-card.webp`,
    detail: `${stem}-detail.webp`,
    placeholder: `${stem}-placeholder.webp`,
  }
}

export function preloadRecipeImage(source: string) {
  const variants = recipeImageVariants(source)
  const image = new Image()
  image.src = variants.card
  image.srcset = `${variants.card} 480w, ${variants.detail} 960w`
  image.sizes = '(max-width: 600px) 92vw, 520px'
}
