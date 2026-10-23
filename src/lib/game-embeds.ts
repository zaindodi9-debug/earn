export const GAME_EMBED_URLS: Record<string, string> = {
  'sunset-rush': '/games/sunset-rush.html',
  'bubble-pop': '/games/bubble-pop.html',
  'flip-match': '/games/flip-match.html',
  'ninja-jump': '/games/ninja-jump.html',
  'penalti-sepak-bola': '/games/penalti.html',
  'grand-city-auto': '/games/grand-city-auto.html',
  'honeypaw': '/games/honeypaw.html',
  'tembak-sasaran': '/games/mini-arcade.html?mode=target-shooter',
  'bola-pinball': '/games/mini-arcade.html?mode=pinball',
  'solitaire-cepat': '/games/mini-arcade.html?mode=solitaire',
  'tower-stack': '/games/mini-arcade.html?mode=tower-stack',
  'catur-kilat': '/games/mini-arcade.html?mode=chess',
  'ludo-sprint': '/games/mini-arcade.html?mode=ludo',
  'puzzle-mania': '/games/mini-arcade.html?mode=sliding-puzzle',
  'kartu-cepat': '/games/mini-arcade.html?mode=blackjack',
}

export function resolveGameEmbedUrl(slug: string, embedUrl: string | null): string | null {
  return embedUrl || GAME_EMBED_URLS[slug] || null
}
