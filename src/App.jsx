import { useState, useEffect } from 'react'
import { Container, Grid, Card, CardContent, Typography, TextField, Button, CardMedia, Chip, Modal, Box, CircularProgress, LinearProgress } from '@mui/material'
import axios from 'axios'
import Battle from './components/Battle'
// import AudioManager from './components/AudioManager'
import './App.css'

// Sistema de tipos y sus interacciones
const typeInteractions = {
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

function App() {
  const [pokemons, setPokemons] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [pokemonDetails, setPokemonDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [battleMode, setBattleMode] = useState(false)
  const [playerPokemon, setPlayerPokemon] = useState(null)
  const [opponentPokemon, setOpponentPokemon] = useState(null)
  const [filteredPokemons, setFilteredPokemons] = useState([])

  useEffect(() => {
    fetchPokemons()
  }, [])

  const calculateTypeMultiplier = (types) => {
    let multiplier = 1
    types.forEach(type => {
      // Calcular fortalezas
      typeInteractions[type].strong.forEach(strongType => {
        multiplier += 0.2 // Aumenta el multiplicador por cada tipo al que es fuerte
      })
      // Calcular debilidades
      typeInteractions[type].weak.forEach(weakType => {
        multiplier -= 0.1 // Reduce el multiplicador por cada tipo al que es débil
      })
    })
    return Math.max(0.5, Math.min(2, multiplier)) // Limitar el multiplicador entre 0.5 y 2
  }

  const calculatePowerPoints = (stats, isLegendary, types) => {
    const basePower = stats.reduce((total, stat) => total + stat.base_stat, 0)
    const typeMultiplier = calculateTypeMultiplier(types)
    const legendaryMultiplier = isLegendary ? 1.5 : 1
    return Math.floor(basePower * typeMultiplier * legendaryMultiplier)
  }

  const getPowerLevel = (powerPoints) => {
    if (powerPoints >= 750) return { level: 'Legendario', color: '#FFD700' }
    if (powerPoints >= 500) return { level: 'Épico', color: '#9B59B6' }
    if (powerPoints >= 200) return { level: 'Raro', color: '#3498DB' }
    return { level: 'Común', color: '#2ECC71' }
  }

  const fetchPokemons = async () => {
    try {
      setLoading(true)
      // Obtenemos los primeros 150 Pokémon
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=150')
      const pokemonList = response.data.results

      const pokemonDetails = await Promise.all(
        pokemonList.map(async (pokemon) => {
          const details = await axios.get(pokemon.url)
          const species = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${details.data.id}`)
          
          // Obtenemos la descripción en español
          const spanishDescription = species.data.flavor_text_entries.find(
            entry => entry.language.name === 'es'
          )?.flavor_text || 'Descripción no disponible'

          // Calculamos puntos de poder basados en estadísticas
          const stats = details.data.stats.reduce((acc, stat) => {
            acc[stat.stat.name] = stat.base_stat
            return acc
          }, {})

          const powerPoints = calculatePowerPoints(details.data.stats, details.data.stats.find(stat => stat.stat.name === 'hp').base_stat >= 600, details.data.types.map(type => type.type.name))

          // Determinamos el nivel de poder usando la función getPowerLevel
          const powerLevel = getPowerLevel(powerPoints)

          return {
            id: details.data.id,
            name: details.data.name,
            image: details.data.sprites.other['official-artwork'].front_default || details.data.sprites.front_default,
            types: details.data.types.map(type => type.type.name),
            description: spanishDescription,
            powerPoints,
            powerLevel,
            typeMultiplier: details.data.types.length > 1 ? 1.5 : 1.0,
            isLegendary: powerPoints >= 600,
            stats: details.data.stats,
            height: details.data.height,
            weight: details.data.weight,
            abilities: details.data.abilities.map(ability => ability.ability.name),
            sprites: details.data.sprites
          }
        })
      )

      setPokemons(pokemonDetails)
    } catch (error) {
      console.error('Error fetching pokemons:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para determinar las fortalezas basadas en los tipos
  const getStrengths = (types) => {
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
  const getWeaknesses = (types) => {
    const weaknesses = new Set()
    types.forEach(type => {
      const typeName = typeof type === 'string' ? type : type.type.name
      if (typeInteractions[typeName]?.weak) {
        typeInteractions[typeName].weak.forEach(weakType => weaknesses.add(weakType))
      }
    })
    return Array.from(weaknesses)
  }

  const handlePokemonClick = async (pokemon) => {
    setSelectedPokemon(pokemon)
    setLoadingDetails(true)
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
      setPokemonDetails({
        ...pokemon,
        description: response.data.flavor_text_entries.find(entry => entry.language.name === 'es')?.flavor_text || 'No hay descripción disponible',
        height: pokemon.height,
        weight: pokemon.weight,
        strengths: pokemon.types.flatMap(type => typeInteractions[type].strong),
        weaknesses: pokemon.types.flatMap(type => typeInteractions[type].weak)
      })
    } catch (error) {
      console.error('Error fetching pokemon details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedPokemon(null)
    setPokemonDetails(null)
  }

  const startBattle = async (pokemon) => {
    try {
      setLoadingDetails(true)
      // Seleccionar un oponente aleatorio
      const randomIndex = Math.floor(Math.random() * pokemons.length)
      const opponent = pokemons[randomIndex]
      
      // Obtener detalles completos de ambos Pokémon
      const [playerDetails, opponentDetails] = await Promise.all([
        axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`),
        axios.get(`https://pokeapi.co/api/v2/pokemon/${opponent.id}`)
      ])

      setPlayerPokemon({
        ...playerDetails.data,
        powerPoints: pokemon.powerPoints,
        typeMultiplier: pokemon.typeMultiplier
      })
      setOpponentPokemon({
        ...opponentDetails.data,
        powerPoints: opponent.powerPoints,
        typeMultiplier: opponent.typeMultiplier
      })
      setBattleMode(true)
    } catch (error) {
      console.error('Error starting battle:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleBattleEnd = (winner) => {
    setBattleMode(false)
    setPlayerPokemon(null)
    setOpponentPokemon(null)
    if (winner === 'player') {
      alert('¡Has ganado la batalla!')
    } else {
      alert('¡Has perdido la batalla!')
    }
  }

  useEffect(() => {
    const filtered = pokemons.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPokemons(filtered);
  }, [searchTerm, pokemons]);

  
  

  if (battleMode && playerPokemon && opponentPokemon) {
    return (
      <Container>
        {/* <AudioManager />  */}
        <Battle 
          playerPokemon={playerPokemon}
          opponentPokemon={opponentPokemon}
          onBattleEnd={handleBattleEnd}
        />
      </Container>
    );
  }

  return (
    <Container>
      {/* <AudioManager /> */}
      <Typography variant="h2" color="black" component="h1" align="center" sx={{ my: 4, fontFamily: "pokemon"}}>
        Pokémon Card Collection
      </Typography>
      
      <TextField
        fullWidth
        label="Buscar Pokémon"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredPokemons.length === 0 ? (
        <Typography variant="h5" color="black" component="h2" align="center" sx={{ my: 4 }}>
          No se encontraron Pokémon con el término "{searchTerm}"
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredPokemons.map((pokemon) => (
            <Grid item xs={12} sm={6} md={4} key={pokemon.id}>
              <Card className="card">
                <CardMedia
                  component="img"
                  height="200"
                  image={pokemon.image}
                  alt={pokemon.name}
                  sx={{ objectFit: 'contain', p: 2 }}
                  onClick={() => handlePokemonClick(pokemon)}
                />
                <CardContent>
                  <Typography variant="h5" component="h2" className="pokemon-name">
                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    # {pokemon.id.toString().padStart(3, '0')}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: pokemon.powerLevel.color, fontWeight: 'bold' }}>
                      Nivel: {pokemon.powerLevel.level}
                    </Typography>
                    <Typography variant="body2">
                      PP: {pokemon.powerPoints}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((pokemon.powerPoints / 800) * 100, 100)} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: pokemon.powerLevel.color
                        }
                      }}
                    />
                  </Box>
                  <div>
                    {pokemon.types.map((type) => (
                      <Chip
                        key={type}
                        label={type}
                        sx={{ mr: 1, mb: 1 }}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </div>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => startBattle(pokemon)}
                    sx={{ mt: 2 }}
                  >
                    ¡Batalla!
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Modal
        open={!!selectedPokemon}
        onClose={handleCloseModal}
        aria-labelledby="pokemon-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : pokemonDetails ? (
            <>
              <Typography id="pokemon-modal-title" variant="h4" component="h2" className="pokemon-name" gutterBottom>
                {pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1)}
              </Typography>
              <CardMedia
                component="img"
                height="200"
                image={pokemonDetails.image}
                alt={pokemonDetails.name}
                sx={{ objectFit: 'contain', p: 2 }}
              />
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ color: pokemonDetails.powerLevel.color, fontWeight: 'bold' }}>
                  Nivel: {pokemonDetails.powerLevel.level}
                </Typography>
                <Typography variant="body2">
                  PP: {pokemonDetails.powerPoints}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Multiplicador de tipo: x{pokemonDetails.typeMultiplier.toFixed(1)}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((pokemonDetails.powerPoints / 800) * 100, 100)} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: pokemonDetails.powerLevel.color
                    }
                  }}
                />
              </Box>
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Fortalezas:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getStrengths(pokemonDetails.types).map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      size="small"
                      sx={{ backgroundColor: '#4CAF50', color: 'white' }}
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Debilidades:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getWeaknesses(pokemonDetails.types).map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      size="small"
                      sx={{ backgroundColor: '#F44336', color: 'white' }}
                    />
                  ))}
                </Box>
              </Box>
              <Typography variant="body1" sx={{ my: 2 }}>
                {pokemonDetails.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                # {pokemonDetails.id.toString().padStart(3, '0')}
              </Typography>
              <div>
                {pokemonDetails.types.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    sx={{ mr: 1, mb: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </div>
              {pokemonDetails.isLegendary && (
                <Chip
                  label="Legendario"
                  sx={{ 
                    mt: 2,
                    backgroundColor: '#FFD700',
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                />
              )}
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => startBattle(pokemonDetails)}
                sx={{ mt: 2 }}
              >
                ¡Batalla!
              </Button>
            </>
          ) : null}
        </Box>
      </Modal>
    </Container>
  )
}

export default App
