import {
    Box,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useBasedash } from '../context/BasedashContext.tsx';

export default function Settings() {
    const { timeZone, setTimeZone } = useBasedash();

    const handleTimeZoneChange = (event: SelectChangeEvent) => {
        setTimeZone(event.target.value);
    };

    return (
        <>
            <Box>
                <Grid container spacing={5} alignItems="center" mt={5} ml={10}>
                    <Grid>
                        <Typography variant="h6" noWrap component="div">
                            Time zone
                        </Typography>
                    </Grid>
                    <Grid>
                        <Box sx={{ minWidth: 120, width: 300 }}>
                            <FormControl fullWidth>
                                <Select
                                    displayEmpty
                                    value={timeZone}
                                    onChange={handleTimeZoneChange}
                                >
                                    <MenuItem value={'PT'}>
                                        Pacific Time
                                    </MenuItem>
                                    <MenuItem value={'MT'}>
                                        Mountain Time
                                    </MenuItem>
                                    <MenuItem value={'CT'}>
                                        Central Time
                                    </MenuItem>
                                    <MenuItem value={'ET'}>
                                        Eastern Time
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
