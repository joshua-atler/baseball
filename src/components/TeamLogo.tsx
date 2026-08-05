import { Box } from '@mui/material';

export const TeamLogo = ({
    teamAbbr,
    size,
}: {
    teamAbbr: string;
    size: number;
}) => {
    return (
        <Box
            component="img"
            src={`/teamLogos/${teamAbbr}.svg`}
            sx={{
                verticalAlign: 'middle',
                mr: '5px',
                width: size,
                height: size,
                objectFit: 'cover',
            }}
        />
    );
};
