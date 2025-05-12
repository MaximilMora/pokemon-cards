import React, { useState, useEffect } from 'react'
import { Box, Typography, Button, Paper, LinearProgress, Chip, CardMedia } from '@mui/material'

const Battle = ({ playerPokemon, opponentPokemon, onBattleEnd }) => {
  const [playerHP, setPlayerHP] = useState(100)
  const [opponentHP, setOpponentHP] = useState(100)
  const [currentTurn, setCurrentTurn] = useState('player')
  const [battleLog, setBattleLog] = useState([])
  const [isAttacking, setIsAttacking] = useState(false)

  const maxPlayerHP = playerPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat
  const maxOpponentHP = opponentPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat

  const calculateDamage = (attacker, defender) => {
    const baseDamage = Math.floor(attacker.powerPoints / 10)
    const typeMultiplier = attacker.typeMultiplier
    const randomFactor = 0.8 + Math.random() * 0.4
    return Math.floor(baseDamage * typeMultiplier * randomFactor)
  }

  const handleAttack = () => {
    if (currentTurn !== 'player' || isAttacking) return

    setIsAttacking(true)
    const damage = calculateDamage(playerPokemon, opponentPokemon)
    const newOpponentHP = Math.max(0, opponentHP - damage)
    
    setBattleLog(prev => [...prev, {
      message: `${playerPokemon.name} ataca a ${opponentPokemon.name} y causa ${damage} de daño`,
      type: 'attack'
    }])

    setTimeout(() => {
      setOpponentHP(newOpponentHP)
      setIsAttacking(false)
      setCurrentTurn('opponent')
    }, 1000)
  }

  useEffect(() => {
    if (currentTurn === 'opponent' && !isAttacking) {
      setIsAttacking(true)
      const damage = calculateDamage(opponentPokemon, playerPokemon)
      const newPlayerHP = Math.max(0, playerHP - damage)
      
      setBattleLog(prev => [...prev, {
        message: `${opponentPokemon.name} ataca a ${playerPokemon.name} y causa ${damage} de daño`,
        type: 'attack'
      }])

      setTimeout(() => {
        setPlayerHP(newPlayerHP)
        setIsAttacking(false)
        setCurrentTurn('player')
      }, 1000)
    }
  }, [currentTurn, isAttacking])

  useEffect(() => {
    if (playerHP <= 0 || opponentHP <= 0) {
      const winner = playerHP > 0 ? 'player' : 'opponent'
      onBattleEnd(winner)
    }
  }, [playerHP, opponentHP])

  return (
    <Box className="battle-container">
      <Typography variant="h4" gutterBottom>
        Batalla Pokémon
      </Typography>

      <Box display="flex" justifyContent="space-around" alignItems="center" mb={4}>
        <Box className={`battle-pokemon ${isAttacking && currentTurn === 'player' ? 'attacking' : ''}`}>
          <CardMedia
            component="img"
            height="200"
            image={playerPokemon.sprites.other['official-artwork'].front_default}
            alt={playerPokemon.name}
            sx={{ objectFit: 'contain', p: 2 }}
          />
          <Typography variant="h6">{playerPokemon.name}</Typography>
          <Box className="battle-hp-bar">
            <Box 
              className="battle-hp-fill"
              sx={{ 
                width: `${playerHP}%`,
                bgcolor: playerHP > 50 ? 'success.main' : playerHP > 25 ? 'warning.main' : 'error.main'
              }}
            />
          </Box>
          <Typography>HP: {playerHP}</Typography>
        </Box>

        <Typography variant="h5">VS</Typography>

        <Box className={`battle-pokemon ${isAttacking && currentTurn === 'opponent' ? 'attacking' : ''}`}>
          <CardMedia
            component="img"
            height="200"
            image={opponentPokemon.sprites.other['official-artwork'].front_default}
            alt={opponentPokemon.name}
            sx={{ objectFit: 'contain', p: 2 }}
          />
          <Typography variant="h6">{opponentPokemon.name}</Typography>
          <Box className="battle-hp-bar">
            <Box 
              className="battle-hp-fill"
              sx={{ 
                width: `${opponentHP}%`,
                bgcolor: opponentHP > 50 ? 'success.main' : opponentHP > 25 ? 'warning.main' : 'error.main'
              }}
            />
          </Box>
          <Typography>HP: {opponentHP}</Typography>
        </Box>
      </Box>

      {currentTurn === 'player' && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAttack}
          className="battle-button"
          disabled={isAttacking}
        >
          Atacar
        </Button>
      )}

      <Box className="battle-log">
        {battleLog.map((entry, index) => (
          <Typography key={index} className="battle-log-entry">
            {entry.message}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}

export default Battle 