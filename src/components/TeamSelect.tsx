import { Box } from '@mui/material';
import { Consts } from '../consts/consts.ts';
import { useEffect, useRef } from 'react';
import SlimSelect from 'slim-select';


export function TeamSelect({ currentValue, onTeamChange }) {

    const selectRef = useRef(null);

    const slimSelectInstance = useRef<SlimSelect | null>(null);

    const divisionNames = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];
    let selectData = [];

    divisionNames.forEach((divName, index) => {
        const league = index < 3 ? 'AL' : 'NL';
        const divIndex = index % 3;

        const group = {
            label: divName,
            options: Consts.teamAbbrs[league][divIndex].map((abbr) => {
                return {
                    text: abbr,
                    value: abbr,
                    html: `
                    <div style="display: flex; align-items: center;">
                        <img src="teamLogos/${abbr}.svg" width="40" height="40" style="margin-right: 10px;" />
                        <span style="font-weight: bold;">${abbr}</span>
                    </div>
                    `
                };
            })
        };

        selectData.push(group);
    });
    selectData.unshift({ placeholder: true, text: 'Select a team', value: '' });

    useEffect(() => {
        if (selectRef.current && !slimSelectInstance.current) {
            slimSelectInstance.current = new SlimSelect({
                select: selectRef.current,
                data: selectData,

                settings: {
                    showSearch: false,
                    closeOnSelect: true,
                    allowDeselect: true,
                },
                events: {
                    afterChange: (newVal) => {
                        const selectedValue = newVal[0]?.value;
                        onTeamChange(selectedValue);

                    }
                }
            })
        }

        return () => {
            if (slimSelectInstance.current) {
                slimSelectInstance.current.destroy();
                slimSelectInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (slimSelectInstance.current && currentValue) {
            slimSelectInstance.current.setSelected(currentValue);
        }
    }, [currentValue]);

    return <>
        <Box>
            <select ref={selectRef}></select>
        </Box>
    </>;
}