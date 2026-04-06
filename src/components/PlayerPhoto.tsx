import { Box } from '@mui/material';


export const PlayerPhoto = (({ playerID, width, height }: {
    playerID: number,
    width: number,
    height: number
}) => {


    return <Box
        component="img"
        src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${playerID}/headshot/silo/current`}
        sx={{
            width: width,
            height: height,
            objectFit: 'cover'
        }}
    />
});