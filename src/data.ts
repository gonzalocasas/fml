export type Recipe = {
  id: string; name: string; minutes: number; ingredients: string[]; image: string;
  source: string; sourceLabel: 'Notion' | 'Instagram' | 'Akis'; tags: string[]
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=86`

export const recipes: Recipe[] = [
  { id:'chicken-souvlaki', name:'Chicken souvlaki', minutes:35, ingredients:['chicken','lemon','oregano','tzatziki'], image:img('photo-1529692236671-f1f6cf9683ba'), source:'https://www.mygreekdish.com/recipe/souvlaki-with-chicken-and-pita-breads', sourceLabel:'Notion', tags:['Dinner','Kids'] },
  { id:'parmigiana', name:'Parmigiana di melanzane', minutes:75, ingredients:['aubergine','tomato','mozzarella','basil'], image:img('photo-1572449043416-55f4685c9bb7'), source:'https://www.recipetineats.com/eggplant-parmigiana', sourceLabel:'Notion', tags:['Dinner','Kids'] },
  { id:'shrimp-couscous', name:'Couscous with shrimp', minutes:25, ingredients:['shrimp','couscous','lemon','parsley'], image:img('photo-1515003197210-e0cd71810b5f'), source:'#', sourceLabel:'Notion', tags:['Dinner','Easy'] },
  { id:'greek-potatoes', name:'Crispy Greek lemon potatoes', minutes:65, ingredients:['potato','lemon','garlic','oregano'], image:img('photo-1518977676601-b53f82aba655'), source:'https://akispetretzikis.com/en/recipe/4855/lemonates-patates-foyrnoy', sourceLabel:'Akis', tags:['Sides','Kids'] },
  { id:'pastitsio', name:'Pastitsio', minutes:95, ingredients:['pasta','beef','béchamel','cinnamon'], image:img('photo-1473093295043-cdd812d0e601'), source:'https://akispetretzikis.com/en/recipe/1337/pastitsio', sourceLabel:'Akis', tags:['Dinner','Comfort'] },
  { id:'spanakopita', name:'Spanakopita', minutes:70, ingredients:['spinach','feta','filo','dill'], image:img('photo-1601050690597-df0568f70950'), source:'https://akispetretzikis.com/en/recipe/1016/spanakopita', sourceLabel:'Akis', tags:['Dinner','Vegetarian'] },
  { id:'short-ribs', name:'Red wine short ribs', minutes:210, ingredients:['beef ribs','red wine','carrot','rosemary'], image:img('photo-1544025162-d76694265947'), source:'https://www.instagram.com/britacooks/reel/DCo0xcaPEn6/', sourceLabel:'Instagram', tags:['Weekend','Dinner'] },
  { id:'cacio-pepe', name:'Cacio e pepe', minutes:20, ingredients:['spaghetti','pecorino','black pepper'], image:img('photo-1551183053-bf91a1d81141'), source:'https://www.instagram.com/deansheremet/reel/DBreHgZSZ_0/', sourceLabel:'Instagram', tags:['Quick','Dinner'] },
  { id:'nori-tofu', name:'Crispy nori tofu', minutes:30, ingredients:['tofu','nori','gochujang','garlic'], image:img('photo-1547592180-85f173990554'), source:'https://www.instagram.com/veganbunnyelle/reel/DA0_iqJJfiv/', sourceLabel:'Instagram', tags:['Vegan','Dinner'] },
  { id:'bulgogi', name:'Korean beef bulgogi', minutes:25, ingredients:['beef','soy','sesame','spring onion'], image:img('photo-1547592180-85f173990554'), source:'https://www.instagram.com/saltnpiipa/reel/C_d5ruZSED6/', sourceLabel:'Instagram', tags:['Quick','Dinner'] },
  { id:'lemon-yogurt-chicken', name:'Lemon yogurt chicken', minutes:45, ingredients:['chicken','yogurt','lemon','garlic'], image:img('photo-1532550907401-a500c9a57435'), source:'https://www.instagram.com/themodernnonna/reel/C74NaDagNsr/', sourceLabel:'Instagram', tags:['Dinner','Kids'] },
  { id:'fondant-potatoes', name:'Fondant potatoes', minutes:50, ingredients:['potato','butter','garlic','stock'], image:img('photo-1518977676601-b53f82aba655'), source:'https://www.instagram.com/kellyscleankitchen/reel/C61PV29LmJD/', sourceLabel:'Instagram', tags:['Sides','Fancy'] }
]
