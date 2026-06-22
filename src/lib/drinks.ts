import { PredefinedDrink } from '@/types'

export const PREDEFINED_DRINKS: PredefinedDrink[] = [
  { type: 'beer', name: 'Beer', volume_ml: 500, abv_percent: 5, emoji: '🍺' },
  { type: 'wine', name: 'Wine', volume_ml: 150, abv_percent: 12, emoji: '🍷' },
  { type: 'shot', name: 'Shot', volume_ml: 40, abv_percent: 40, emoji: '🥃' },
  { type: 'cocktail', name: 'Cocktail', volume_ml: 200, abv_percent: 10, emoji: '🍹' },
]
