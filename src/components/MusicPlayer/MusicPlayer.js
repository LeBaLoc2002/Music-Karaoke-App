import React, { useState, useEffect, useRef } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';

const WallPaper = styled('div')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  overflow: 'hidden',
  transition: 'all 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s',
  '&::before': {
    content: '""',
    width: '140%',
    height: '140%',
    position: 'absolute',
    top: '-40%',
    right: '-50%',
  },
  '&::after': {
    content: '""',
    width: '140%',
    height: '140%',
    position: 'absolute',
    bottom: '-50%',
    left: '-30%',
    background:
      'radial-gradient(at center center, rgb(247, 237, 225) 0%, rgba(247, 237, 225, 0) 70%)',
    transform: 'rotate(30deg)',
  },
});

const Widget = styled('div')(({ theme }) => ({
  padding: 16,
  borderRadius: 16,
  width: 343,
  maxWidth: '100%',
  margin: 'auto',
  position: 'relative',
  zIndex: 1,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
  backdropFilter: 'blur(40px)',
}));

const CoverImage = styled('div')({
  width: 100,
  height: 100,
  objectFit: 'cover',
  overflow: 'hidden',
  flexShrink: 0,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%',
  },
});

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

const MusicPlayer = () => {
  const theme = useTheme();
  const [audio] = useState(new Audio('https://storage.googleapis.com/ikara-storage/tmp/beat.mp3'));
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(true);
  const [lyrics, setLyrics] = useState('');

  const canvasRef = useRef(null);
  const mainIconColor = theme.palette.mode === 'dark' ? '#fff' : '#000';
  const lightIconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  useEffect(() => {
    const fetchMusicLyrics = async () => {
      try {
        const resp = await fetch('https://storage.googleapis.com/ikara-storage/ikara/lyrics.xml');
        const xml = await resp.text();
        const parser = new DOMParser();
        const xmlDOM = parser.parseFromString(xml, 'application/xml');
        const lyrics = xmlDOM.querySelectorAll("data");
        let tempLyricsBeat = [];
        lyrics.forEach(lyricsXmlParam => {
          for (let i = 0; i < lyricsXmlParam.children.length; i++) {
            let sizeParam = lyricsXmlParam.children[i].getElementsByTagName('i').length;
            let lyricsParam = { timeParam: '', lyricsParam: [] };
            let lyricsChart = [];
            for (let j = 0; j < sizeParam; j++) {
              let chartLyric = {
                timeChart: lyricsXmlParam.children[i].getElementsByTagName('i')[j].getAttribute('va'),
                chartLyric: lyricsXmlParam.children[i].getElementsByTagName('i')[j].textContent
              };
              lyricsChart.push(chartLyric);
            }
            lyricsParam.timeParam = lyricsXmlParam.children[i].getElementsByTagName('i')[0].getAttribute('va');
            lyricsParam.lyricsParam = lyricsChart;
            tempLyricsBeat.push(lyricsParam);
          }
        });
        console.log(tempLyricsBeat);
        setLyrics(tempLyricsBeat);
      } catch (error) {
        console.error('Error fetching music lyrics:', error);
      }
    };
  
    fetchMusicLyrics();
  
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
  
    const handleTimeUpdate = () => {
      setPosition(audio.currentTime);
      if (audio.ended) {
        setPaused(true);
      }
    };
  
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
  
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audio]);
  

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 14px Arial';
    context.textAlign = 'left';
    context.textBaseline = 'top';

    if (Array.isArray(lyrics)) {
        const lineHeight = 25;
        let y = 10;
        let currentIndex = 0;

        for (let i = 0; i < lyrics.length; i++) {
            if (audio.currentTime >= parseFloat(lyrics[i].lyricsParam[0].timeChart)) {
                currentIndex = i;
            }
        }

        const startLineIndex = Math.max(0, currentIndex - 1);

        for (let i = startLineIndex; i < startLineIndex + 2; i++) {
            let x = 10;
            let lineText = '';
            let lineFinished = true;

            for (let j = 0; j < lyrics[i].lyricsParam.length; j++) {
                const char = lyrics[i].lyricsParam[j];
                let charColor = 'gray';

                if (audio.currentTime >= parseFloat(char.timeChart)) {
                    const nextTime = parseFloat(lyrics[i].lyricsParam[j + 1]?.timeChart);
                    const progress = nextTime ? (audio.currentTime - parseFloat(char.timeChart)) / (nextTime - parseFloat(char.timeChart)) : 1;
                    const red = Math.floor(255 * progress);
                    charColor = `rgb(${red}, 0, 0)`;
                }

                context.fillStyle = charColor;
                lineText += char.chartLyric;
                context.fillText(char.chartLyric, x, y);
                x += context.measureText(char.chartLyric).width;
            }

            if (lineFinished && i !== currentIndex) {
                context.fillStyle = 'gray';
                context.fillText(lineText, 10, y);
            }

            y += lineHeight;
        }
    }
}, [audio.currentTime, lyrics]);
  

const formatDuration = (value) => {
  const minute = Math.floor(value / 60);
  const secondLeft = Math.floor(value % 60);
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
};

const handlePlayPause = () => {
  if (paused) {
      audio.play();
  } 
  else {
      audio.pause();
  }
  setPaused(!paused);
};

const handleSeek = (_, value) => {
  audio.currentTime = value;
  setPosition(value);
};
  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Widget>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CoverImage>
            <img
              alt="Mái Tóc Người Thương"
              src="https://i.ytimg.com/vi/B2w0-cw-6Uw/maxresdefault.jpg"
              style={{ width: '100px', height: '100px' }}
            />
          </CoverImage>
          <Box sx={{ ml: 1.5, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Jun Pulse
            </Typography>
            <Typography noWrap>
              <b>Mái Tóc Người Thương</b>
            </Typography>
            <Typography noWrap letterSpacing={-0.25}>
              Quang Le &mdash; Mái Tóc Người Thương
            </Typography>
          </Box>
        </Box>
        <Slider
          aria-label="time-indicator"
          size="small"
          value={position}
          min={0}
          step={1}
          max={duration}
          onChange={handleSeek}
          sx={{
            color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&::before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0px 0px 0px 8px ${
                  theme.palette.mode === 'dark'
                    ? 'rgb(255 255 255 / 16%)'
                    : 'rgb(0 0 0 / 16%)'
                }`,
              },
              '&.Mui-active': {
                width: 20,
                height: 20,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
            },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: -2,
          }}
        >
          <TinyText>{formatDuration(position)}</TinyText>
          <TinyText>-{formatDuration(duration - position)}</TinyText>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: -1,
          }}
        >
          <IconButton aria-label="previous song">
            <FastRewindRounded fontSize="large" htmlColor={mainIconColor} />
          </IconButton>
          <IconButton
            aria-label={paused ? 'play' : 'pause'}
            onClick={handlePlayPause}
          >
            {paused ? (
              <PlayArrowRounded
                sx={{ fontSize: '3rem' }}
                htmlColor={mainIconColor}
              />
            ) : (
              <PauseRounded sx={{ fontSize: '3rem' }} htmlColor={mainIconColor} />
            )}
          </IconButton>
          <IconButton aria-label="next song">
            <FastForwardRounded fontSize="large" htmlColor={mainIconColor} />
          </IconButton>
        </Box>
        <Stack spacing={2} direction="row" sx={{ mb: 1, px: 1 }} alignItems="center">
          <VolumeDownRounded htmlColor={lightIconColor} />
          <Slider
            aria-label="Volume"
            defaultValue={30}
            sx={{
              color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
                backgroundColor: '#fff',
                '&::before': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                },
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none',
                },
              },
            }}
          />
          <VolumeUpRounded htmlColor={lightIconColor} />
        </Stack>
        <canvas ref={canvasRef} width={700} height={200} />
      </Widget>
      <WallPaper />
    </Box>
  );
};

export default MusicPlayer;
