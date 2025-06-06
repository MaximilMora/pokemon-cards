import { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const AudioManager = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState(null);

  useEffect(() => {
    // Crear el elemento de audio para la música de fondo
    const audio = new Audio('/sounds/pokemon-theme.mp3');
    audio.loop = true;
    audio.volume = 0.5; // Volumen al 50%
    setBackgroundMusic(audio);

    // Intentar reproducir la música cuando el componente se monte
    const playMusic = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.log('La reproducción automática no está permitida');
      }
    };
    playMusic();

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const toggleMute = () => {
    if (backgroundMusic) {
      if (isMuted) {
        backgroundMusic.play();
      } else {
        backgroundMusic.pause();
      }
    }
    setIsMuted(!isMuted);
  };

  return (
    <IconButton 
      onClick={toggleMute}
      sx={{ 
        position: 'fixed',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }
      }}
    >
      {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
    </IconButton>
  );
};

export default AudioManager; 