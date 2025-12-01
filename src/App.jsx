import { useState, useEffect } from 'react'
import { Container, Grid, Card, CardContent, Typography, TextField, Button, CardMedia, Chip, Box, LinearProgress, Skeleton, AppBar, Toolbar } from '@mui/material'
import axios from 'axios'
import BattleSystem from './components/BattleSystem'
import PokemonDetails from './components/PokemonDetails'
import { typeInteractions } from './utils/typeInteractions'
// import AudioManager from './components/AudioManager'
import './App.css'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [pokemonDetails, setPokemonDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [battleMode, setBattleMode] = useState(false)
  const [battlePokemon, setBattlePokemon] = useState(null)
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

  const startBattle = (pokemon) => {
    setBattlePokemon(pokemon)
    setBattleMode(true)
  }

  const handleBattleEnd = (winner) => {
    setBattleMode(false)
    setBattlePokemon(null)
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

  // Componente de Skeleton para las tarjetas de Pokémon
  const PokemonCardSkeleton = () => (
    <Card className="card h-full animate-pulse">
      <Skeleton 
        variant="rectangular" 
        height={200} 
        className="p-2"
        animation="wave"
      />
      <CardContent>
        <Skeleton 
          variant="text" 
          width="60%" 
          height={32} 
          className="mb-1"
          animation="wave"
        />
        <Skeleton 
          variant="text" 
          width="40%" 
          height={20} 
          className="mb-4"
          animation="wave"
        />
        <Box className="mb-4">
          <Skeleton 
            variant="text" 
            width="50%" 
            height={20} 
            className="mb-1"
            animation="wave"
          />
          <Skeleton 
            variant="text" 
            width="30%" 
            height={20} 
            className="mb-2"
            animation="wave"
          />
          <Skeleton 
            variant="rectangular" 
            height={10} 
            className="rounded-full"
            animation="wave"
          />
        </Box>
        <Box className="flex gap-2 mb-4">
          <Skeleton 
            variant="rectangular" 
            width={60} 
            height={24} 
            className="rounded"
            animation="wave"
          />
          <Skeleton 
            variant="rectangular" 
            width={60} 
            height={24} 
            className="rounded"
            animation="wave"
          />
        </Box>
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={36} 
          className="rounded mt-4"
          animation="wave"
        />
      </CardContent>
    </Card>
  );

  if (battleMode && battlePokemon) {
    return (
      <BattleSystem
        playerPokemon={battlePokemon}
        allPokemons={pokemons}
        onBattleEnd={handleBattleEnd}
      />
    )
  }

  return (
    <Box className="min-h-screen bg-pearl pt-20 sm:pt-32">
      {/* <AudioManager /> */}
      
      {/* Navbar */}
      <AppBar 
        position="fixed" 
        className="bg-white shadow-md z-50"
      >
        <Toolbar className="justify-between px-4 sm:px-8 min-h-[64px] flex-col sm:flex-row gap-4 sm:gap-0 py-4 sm:py-0">
          <Typography 
            variant="h5" 
            component="h1" 
            className="text-slate-700 font-bold flex-grow-0 mr-0 sm:mr-8 text-xl sm:text-2xl"
          >
            Pokémon Card Collection
          </Typography>
          
          <TextField
            label="Buscar Pokémon"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            className="flex-grow w-full sm:w-auto max-w-full sm:max-w-md"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#eeeeee'
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff'
                }
              }
            }}
          />
        </Toolbar>
      </AppBar>

      <Container className="p-8 relative">

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(9)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <PokemonCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredPokemons.length === 0 ? (
        <Typography variant="h5" component="h2" className="text-black text-center my-8">
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
                  <Box className="mb-4">
                    <Typography 
                      variant="body2" 
                      className="font-bold"
                      style={{ color: pokemon.powerLevel.color }}
                    >
                      Nivel: {pokemon.powerLevel.level}
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      PP: {pokemon.powerPoints}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((pokemon.powerPoints / 800) * 100, 100)} 
                      className="h-2.5 rounded-full bg-gray-200 mt-2"
                      sx={{ 
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: pokemon.powerLevel.color
                        }
                      }}
                    />
                  </Box>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {pokemon.types.map((type) => (
                      <Chip
                        key={type}
                        label={type}
                        className="mr-1 mb-1"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </div>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => startBattle(pokemon)}
                    className="mt-4 w-full"
                  >
                    ¡Batalla!
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      </Container>

      <PokemonDetails
        open={!!selectedPokemon}
        onClose={handleCloseModal}
        pokemonDetails={pokemonDetails}
        loadingDetails={loadingDetails}
        onStartBattle={startBattle}
      />
    </Box>
  )
}

export default App
