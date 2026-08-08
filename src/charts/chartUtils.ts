export const handleScatterClick = (data: any) => {

    window.open(
        `https://baseballsavant.mlb.com/sporty-videos?playId=${data.playId}`,
        '_blank',
        'noopener,noreferrer'
    );
};
