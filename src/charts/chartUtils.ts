export const handleScatterClick = (data, index) => {
    window.open(
        `https://baseballsavant.mlb.com/sporty-videos?playId=${data.playId}`,
        '_blank',
        'noopener,noreferrer'
    );
};
