import { useState, useEffect } from 'react'
import { Box, Typography, Button, LinearProgress, CardMedia, Paper, Container, CircularProgress } from '@mui/material'
import axios from 'axios'

const BattleSystem = ({ playerPokemon, allPokemons, onBattleEnd }) => {
  const [opponentPokemon, setOpponentPokemon] = useState(null)
  const [playerBattleData, setPlayerBattleData] = useState(null)
  const [opponentBattleData, setOpponentBattleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playerHP, setPlayerHP] = useState(100)
  const [opponentHP, setOpponentHP] = useState(100)
  const [currentTurn, setCurrentTurn] = useState('player')
  const [battleLog, setBattleLog] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Inicializar la batalla
  useEffect(() => {
    const initializeBattle = async () => {
      try {
        setLoading(true)
        
        // Seleccionar un oponente aleatorio
        const randomIndex = Math.floor(Math.random() * allPokemons.length)
        const opponent = allPokemons[randomIndex]
        
        // Obtener detalles completos de ambos Pokémon
        const [playerDetails, opponentDetails] = await Promise.all([
          axios.get(`https://pokeapi.co/api/v2/pokemon/${playerPokemon.id}`),
          axios.get(`https://pokeapi.co/api/v2/pokemon/${opponent.id}`)
        ])

        const playerData = {
          ...playerDetails.data,
          powerPoints: playerPokemon.powerPoints,
          typeMultiplier: playerPokemon.typeMultiplier
        }

        const opponentData = {
          ...opponentDetails.data,
          powerPoints: opponent.powerPoints,
          typeMultiplier: opponent.typeMultiplier
        }

        setPlayerBattleData(playerData)
        setOpponentBattleData(opponentData)
        setOpponentPokemon(opponent)

        // Inicializar HP
        const maxPlayerHP = playerData.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 100
        const maxOpponentHP = opponentData.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 100
        
        setPlayerHP(maxPlayerHP)
        setOpponentHP(maxOpponentHP)
        setBattleLog([`¡${playerData.name} vs ${opponentData.name}!`])
      } catch (error) {
        console.error('Error initializing battle:', error)
      } finally {
        setLoading(false)
      }
    }

    if (playerPokemon && allPokemons.length > 0) {
      initializeBattle()
    }
  }, [playerPokemon, allPokemons])

  // Calcular daño simple basado en el ataque
  const calculateDamage = (attacker) => {
    const attackStat = attacker.stats.find(stat => stat.stat.name === 'attack')?.base_stat || 50
    const randomFactor = 0.8 + Math.random() * 0.4 // Entre 80% y 120%
    return Math.floor(attackStat * randomFactor)
  }

  // Turno del jugador
  const handlePlayerAttack = () => {
    if (currentTurn !== 'player' || isProcessing || playerHP <= 0 || opponentHP <= 0) return

    setIsProcessing(true)
    const damage = calculateDamage(playerBattleData)
    const newOpponentHP = Math.max(0, opponentHP - damage)
    
    setBattleLog(prev => [...prev, `${playerBattleData.name} ataca y causa ${damage} de daño`])
    setOpponentHP(newOpponentHP)

    // Cambiar al turno del oponente después de un breve delay
    setTimeout(() => {
      setCurrentTurn('opponent')
      setIsProcessing(false)
    }, 1000)
  }

  // Turno del oponente (automático)
  useEffect(() => {
    if (currentTurn === 'opponent' && !isProcessing && playerHP > 0 && opponentHP > 0 && opponentBattleData) {
      setIsProcessing(true)
      
      setTimeout(() => {
        const damage = calculateDamage(opponentBattleData)
        const newPlayerHP = Math.max(0, playerHP - damage)
        
        setBattleLog(prev => [...prev, `${opponentBattleData.name} ataca y causa ${damage} de daño`])
        setPlayerHP(newPlayerHP)
        
        // Cambiar al turno del jugador
        setTimeout(() => {
          setCurrentTurn('player')
          setIsProcessing(false)
        }, 500)
      }, 1000)
    }
  }, [currentTurn, isProcessing, playerHP, opponentHP, opponentBattleData])

  // Verificar si hay un ganador
  useEffect(() => {
    if (playerHP <= 0 && playerBattleData) {
      setBattleLog(prev => [...prev, `¡${opponentBattleData?.name} gana!`])
      setTimeout(() => {
        onBattleEnd('opponent')
      }, 2000)
    } else if (opponentHP <= 0 && opponentBattleData) {
      setBattleLog(prev => [...prev, `¡${playerBattleData?.name} gana!`])
      setTimeout(() => {
        onBattleEnd('player')
      }, 2000)
    }
  }, [playerHP, opponentHP, playerBattleData, opponentBattleData, onBattleEnd])

  if (loading || !playerBattleData || !opponentBattleData) {
    return (
      <Container className="min-h-screen bg-pearl p-8 relative flex items-center justify-center">
        <Box className="text-center">
          <CircularProgress />
          <Typography variant="h6" className="mt-4 text-gray-700">
            Preparando batalla...
          </Typography>
        </Box>
      </Container>
    )
  }

  const maxPlayerHP = playerBattleData.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 100
  const maxOpponentHP = opponentBattleData.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 100

  return (
    <Container className="min-h-screen bg-pearl p-8 relative">
      <Box className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-lg text-white min-h-[80vh]">
        <Typography variant="h4" className="text-center mb-6 font-bold">
          ⚔️ Batalla Pokémon
        </Typography>

        {/* Información de turno */}
        <Paper className="p-4 mb-6 bg-white/20 text-center">
          <Typography variant="h6" className="text-white">
            {currentTurn === 'player' ? `Tu turno - ${playerBattleData.name}` : `Turno de ${opponentBattleData.name}`}
          </Typography>
        </Paper>

        {/* Pokémon del jugador */}
        <Box className="mb-6">
          <Box className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
            <CardMedia
              component="img"
              className="w-36 h-36 object-contain"
              image={playerBattleData.sprites?.other?.['official-artwork']?.front_default || playerBattleData.sprites?.front_default}
              alt={playerBattleData.name}
            />
            <Box className="flex-1">
              <Typography variant="h5" className="capitalize mb-2 text-white">
                {playerBattleData.name}
              </Typography>
              <Typography variant="body2" className="mb-2 text-white">
                HP: {playerHP} / {maxPlayerHP}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(playerHP / maxPlayerHP) * 100}
                className="h-5 rounded bg-black/30"
                sx={{ 
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: playerHP > 50 ? '#4caf50' : playerHP > 25 ? '#ff9800' : '#f44336'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* VS */}
        <Typography variant="h4" className="text-center my-4 font-bold text-white">
          VS
        </Typography>

        {/* Pokémon oponente */}
        <Box className="mb-6">
          <Box className="flex items-center gap-4 bg-white/10 p-4 rounded-lg flex-row-reverse">
            <CardMedia
              component="img"
              className="w-36 h-36 object-contain"
              image={opponentBattleData.sprites?.other?.['official-artwork']?.front_default || opponentBattleData.sprites?.front_default}
              alt={opponentBattleData.name}
            />
            <Box className="flex-1 text-right">
              <Typography variant="h5" className="capitalize mb-2 text-white">
                {opponentBattleData.name}
              </Typography>
              <Typography variant="body2" className="mb-2 text-white">
                HP: {opponentHP} / {maxOpponentHP}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(opponentHP / maxOpponentHP) * 100}
                className="h-5 rounded bg-black/30"
                sx={{ 
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: opponentHP > 50 ? '#4caf50' : opponentHP > 25 ? '#ff9800' : '#f44336'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Botón de ataque */}
        {currentTurn === 'player' && playerHP > 0 && opponentHP > 0 && (
          <Box className="text-center mb-6">
            <Button 
              variant="contained" 
              size="large"
              onClick={handlePlayerAttack}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600 text-lg px-10 py-3"
            >
              {isProcessing ? 'Procesando...' : '⚔️ Atacar'}
            </Button>
          </Box>
        )}

        {/* Log de batalla */}
        <Paper className="p-4 bg-black/30 max-h-48 overflow-y-auto rounded-lg">
          <Typography variant="subtitle2" className="mb-2 font-bold text-white">
            Registro de batalla:
          </Typography>
          {battleLog.map((entry, index) => (
            <Typography key={index} variant="body2" className="mb-1 text-white">
              {entry}
            </Typography>
          ))}
        </Paper>
      </Box>
    </Container>
  )
}

export default BattleSystem

