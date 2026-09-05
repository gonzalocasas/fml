export type Recipe = {
  id: string; name: string; minutes: number; ingredients: string[]; image: string;
  source: string; sourceLabel: 'Notion' | 'Instagram' | 'Akis'; tags: string[]
}

const img = (name: string) => `${import.meta.env.BASE_URL}recipes/${name}.jpg`

export const recipes: Recipe[] = [
  { id:'chicken-souvlaki', name:'Chicken souvlaki', minutes:35, ingredients:['chicken','lemon','oregano','tzatziki'], image:img('chicken-souvlaki'), source:'https://www.mygreekdish.com/recipe/souvlaki-with-chicken-and-pita-breads', sourceLabel:'Notion', tags:['Dinner','Kids'] },
  { id:'parmigiana', name:'Parmigiana di melanzane', minutes:75, ingredients:['aubergine','tomato','mozzarella','basil'], image:img('parmigiana'), source:'https://www.recipetineats.com/eggplant-parmigiana', sourceLabel:'Notion', tags:['Dinner','Kids'] },
  { id:'shrimp-couscous', name:'Couscous with shrimp', minutes:25, ingredients:['shrimp','couscous','lemon','parsley'], image:img('shrimp-couscous'), source:'#', sourceLabel:'Notion', tags:['Dinner','Easy'] },
  { id:'greek-potatoes', name:'Greek crunchy roast potatoes', minutes:65, ingredients:['potato','breadcrumbs','oregano','olive oil'], image:img('greek-potatoes'), source:'https://akispetretzikis.com/en/recipe/3158/patates-pshtes-ston-foyrno', sourceLabel:'Akis', tags:['Sides','Kids'] },
  { id:'pastitsio', name:'Greek pastitsio', minutes:75, ingredients:['bucatini','beef','béchamel','feta'], image:img('pastitsio'), source:'https://akispetretzikis.com/en/recipe/118/to-pastitsio-toy-akh', sourceLabel:'Akis', tags:['Dinner','Comfort'] },
  { id:'spanakopita', name:'Easy Greek spinach pie', minutes:40, ingredients:['puff pastry','spinach','feta','cream cheese'], image:img('spanakopita'), source:'https://akispetretzikis.com/en/recipe/731/grhgorh-spanakopita', sourceLabel:'Akis', tags:['Dinner','Vegetarian'] },
  { id:'short-ribs', name:'Red wine short ribs', minutes:210, ingredients:['beef ribs','red wine','carrot','rosemary'], image:img('short-ribs'), source:'https://www.instagram.com/britacooks/reel/DCo0xcaPEn6/', sourceLabel:'Instagram', tags:['Weekend','Dinner'] },
  { id:'cacio-pepe', name:'Cacio e pepe', minutes:20, ingredients:['spaghetti','pecorino','black pepper'], image:img('cacio-pepe'), source:'https://www.instagram.com/deansheremet/reel/DBreHgZSZ_0/', sourceLabel:'Instagram', tags:['Quick','Dinner'] },
  { id:'nori-tofu', name:'Nori-wrapped crispy tofu', minutes:30, ingredients:['tofu','nori','gochujang','garlic'], image:img('nori-tofu'), source:'https://www.instagram.com/veganbunnyelle/reel/DA0_iqJJfiv/', sourceLabel:'Instagram', tags:['Vegan','Dinner'] },
  { id:'bulgogi', name:'Korean beef bulgogi', minutes:25, ingredients:['beef','soy','sesame','spring onion'], image:img('bulgogi'), source:'https://www.instagram.com/saltnpiipa/reel/C_d5ruZSED6/', sourceLabel:'Instagram', tags:['Quick','Dinner'] },
  { id:'lemon-yogurt-chicken', name:'Lemon yogurt chicken', minutes:50, ingredients:['chicken','yogurt','lemon','garlic'], image:img('lemon-yogurt-chicken'), source:'https://www.instagram.com/themodernnonna/reel/C74NaDagNsr/', sourceLabel:'Instagram', tags:['Dinner','Kids'] },
  { id:'fondant-potatoes', name:'Fondant potatoes', minutes:50, ingredients:['potato','butter','garlic','stock'], image:img('fondant-potatoes'), source:'https://www.instagram.com/kellyscleankitchen/reel/C61PV29LmJD/', sourceLabel:'Instagram', tags:['Sides','Fancy'] }
]
