import { Modal, Box, Typography, CardMedia, Chip, Button, LinearProgress, Skeleton } from '@mui/material'
import { getStrengths, getWeaknesses } from '../utils/typeInteractions'

const PokemonDetails = ({ open, onClose, pokemonDetails, loadingDetails, onStartBattle }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
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
          <Box>
            <Skeleton variant="text" width="60%" height={40} className="mb-4" animation="wave" />
            <Skeleton variant="rectangular" height={200} className="mb-4 rounded-lg" animation="wave" />
            <Box className="my-4">
              <Skeleton variant="text" width="40%" height={24} className="mb-2" animation="wave" />
              <Skeleton variant="text" width="30%" height={20} className="mb-2" animation="wave" />
              <Skeleton variant="text" width="50%" height={16} className="mb-2" animation="wave" />
              <Skeleton variant="rectangular" height={10} className="rounded-full mb-4" animation="wave" />
            </Box>
            <Box className="my-4">
              <Skeleton variant="text" width="30%" height={20} className="mb-2" animation="wave" />
              <Box className="flex gap-2 mb-4">
                <Skeleton variant="rectangular" width={60} height={24} className="rounded" animation="wave" />
                <Skeleton variant="rectangular" width={60} height={24} className="rounded" animation="wave" />
                <Skeleton variant="rectangular" width={60} height={24} className="rounded" animation="wave" />
              </Box>
            </Box>
            <Box className="my-4">
              <Skeleton variant="text" width="30%" height={20} className="mb-2" animation="wave" />
              <Box className="flex gap-2 mb-4">
                <Skeleton variant="rectangular" width={60} height={24} className="rounded" animation="wave" />
                <Skeleton variant="rectangular" width={60} height={24} className="rounded" animation="wave" />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={60} className="mb-4" animation="wave" />
            <Skeleton variant="text" width="40%" height={20} className="mb-4" animation="wave" />
            <Box className="flex gap-2 mb-4">
              <Skeleton variant="rectangular" width={60} height={24} className="rounded" animation="wave" />
              <Skeleton variant="rectangular" width={60} height={24} className="rounded" animation="wave" />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={36} className="rounded" animation="wave" />
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
              className="object-contain p-2"
            />
            <Box className="my-4">
              <Typography 
                variant="body2" 
                className="font-bold"
                style={{ color: pokemonDetails.powerLevel.color }}
              >
                Nivel: {pokemonDetails.powerLevel.level}
              </Typography>
              <Typography variant="body2" className="text-gray-700">
                PP: {pokemonDetails.powerPoints}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                Multiplicador de tipo: x{pokemonDetails.typeMultiplier.toFixed(1)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((pokemonDetails.powerPoints / 800) * 100, 100)} 
                className="h-2.5 rounded-full bg-gray-200 mt-2"
                sx={{ 
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: pokemonDetails.powerLevel.color
                  }
                }}
              />
            </Box>
            <Box className="my-4">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                Fortalezas:
              </Typography>
              <Box className="flex flex-wrap gap-2">
                {getStrengths(pokemonDetails.types).map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    size="small"
                    className="bg-green-500 text-white"
                  />
                ))}
              </Box>
            </Box>
            <Box className="my-4">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                Debilidades:
              </Typography>
              <Box className="flex flex-wrap gap-2">
                {getWeaknesses(pokemonDetails.types).map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    size="small"
                    className="bg-red-500 text-white"
                  />
                ))}
              </Box>
            </Box>
            <Typography variant="body1" className="my-4 text-gray-700">
              {pokemonDetails.description}
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              # {pokemonDetails.id.toString().padStart(3, '0')}
            </Typography>
            <div className="flex flex-wrap gap-2 mb-2">
              {pokemonDetails.types.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  className="mr-1 mb-1"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </div>
            {pokemonDetails.isLegendary && (
              <Chip
                label="Legendario"
                className="mt-4 bg-yellow-400 text-black font-bold"
              />
            )}
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => onStartBattle(pokemonDetails)}
              className="mt-4 w-full"
            >
              ¡Batalla!
            </Button>
          </>
        ) : null}
      </Box>
    </Modal>
  )
}

export default PokemonDetails

