// Sistema de tipos y sus interacciones
export const typeInteractions = {
  normal: { weak: ['fighting'], strong: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], strong: ['normal', 'rock', 'steel', 'ice', 'dark'] },
  flying: { weak: ['rock', 'electric', 'ice'], strong: ['fighting', 'bug', 'grass'] },
  poison: { weak: ['ground', 'psychic'], strong: ['grass', 'fairy'] },
  ground: { weak: ['water', 'grass', 'ice'], strong: ['poison', 'rock', 'steel', 'fire', 'electric'] },
  rock: { weak: ['fighting', 'ground', 'steel', 'water', 'grass'], strong: ['flying', 'bug', 'fire', 'ice'] },
  bug: { weak: ['flying', 'rock', 'fire'], strong: ['grass', 'psychic', 'dark'] },
  ghost: { weak: ['ghost', 'dark'], strong: ['ghost', 'psychic'] },
  steel: { weak: ['fighting', 'ground', 'fire'], strong: ['rock', 'ice', 'fairy'] },
  fire: { weak: ['ground', 'rock', 'water'], strong: ['bug', 'steel', 'grass', 'ice'] },
  water: { weak: ['electric', 'grass'], strong: ['ground', 'rock', 'fire'] },
  grass: { weak: ['flying', 'poison', 'bug', 'fire', 'ice'], strong: ['ground', 'rock', 'water'] },
  electric: { weak: ['ground'], strong: ['flying', 'water'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], strong: ['fighting', 'poison'] },
  ice: { weak: ['fighting', 'rock', 'steel', 'fire'], strong: ['flying', 'ground', 'grass', 'dragon'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], strong: ['dragon'] },
  dark: { weak: ['fighting', 'bug', 'fairy'], strong: ['ghost', 'psychic'] },
  fairy: { weak: ['poison', 'steel'], strong: ['fighting', 'dragon', 'dark'] }
}

// Función para determinar las fortalezas basadas en los tipos
export const getStrengths = (types) => {
  const strengths = new Set()
  types.forEach(type => {
    const typeName = typeof type === 'string' ? type : type.type.name
    if (typeInteractions[typeName]?.strong) {
      typeInteractions[typeName].strong.forEach(strongType => strengths.add(strongType))
    }
  })
  return Array.from(strengths)
}

// Función para determinar las debilidades basadas en los tipos
export const getWeaknesses = (types) => {
  const weaknesses = new Set()
  types.forEach(type => {
    const typeName = typeof type === 'string' ? type : type.type.name
    if (typeInteractions[typeName]?.weak) {
      typeInteractions[typeName].weak.forEach(weakType => weaknesses.add(weakType))
    }
  })
  return Array.from(weaknesses)
}

