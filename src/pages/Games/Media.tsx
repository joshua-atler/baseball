import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';

import { GameTabContent } from '../../components/GameTabContent.tsx';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { fetchContent } from '../../services/gamesService.ts';
import { transformGameMedia } from '../../utils/gameTransformers.ts';


export default function Media() {

    const { selectedGame } = useBasedash();
    const [media, setMedia] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const getMedia = async () => {
            if (!selectedGame) {
                setMedia(null);
                return;
            };

            try {
                const content = await fetchContent(selectedGame);
                const formattedMedia = transformGameMedia(content);
                setMedia(formattedMedia);
            } catch (error) {
                setMedia(null);
                console.error("News fetch failed:", error);
            }
        };

        getMedia();
    }, [selectedGame]);

    return (
        <GameTabContent>
            {media ?
                <>
                    {media.map((m, i) => {
                        return <Box key={i} sx={{ mb: 2 }}>
                            <Box key={i} sx={{
                                aspectRatio: '16 / 9',
                                '&:hover': { opacity: 0.8 },
                                transition: 'opacity 0.2s',
                                overflow: 'hidden'
                            }}>
                                <ReactPlayer
                                    key={m.videoURL}
                                    src={m.videoURL}
                                    light={m.imageURL}
                                    width="100%"
                                    height="100%"
                                    controls
                                />
                            </Box>
                            <Typography variant="h6">{m.title}</Typography>
                        </Box>
                    })}
                </> :
                <>
                    <Typography variant="h5">No content</Typography>
                </>}
        </GameTabContent>
    )
}
