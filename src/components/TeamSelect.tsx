import { Box } from '@mui/material';
import { Consts } from '../consts/consts.ts';
import { memo, useEffect, useRef } from 'react';
import SlimSelect from 'slim-select';


export const TeamSelect = memo(({ currentValue, onTeamChange, multiple }: {
    currentValue: any,
    onTeamChange: any,
    multiple: boolean
}) => {
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
                        <img src="teamLogos/${abbr}.svg" width="30" height="30" style="margin-right: 10px;" />
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
                    closeOnSelect: multiple ? false : true,
                    allowDeselect: true,
                    isMultiple: multiple,
                    maxSelected: 5
                },
                events: {
                    beforeOpen: () => {
                        const containers = document.querySelectorAll('.ss-option');
                        containers.forEach(el => el.classList.add('roster-select'));
                    },
                    afterChange: (newVal) => {
                        const selectedTeams = newVal.map(v => v.value);
                        onTeamChange(selectedTeams);
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
    }, [multiple]);

    useEffect(() => {
        if (slimSelectInstance.current && currentValue) {
            slimSelectInstance.current.setSelected(currentValue);
        }
    }, [currentValue]);

    return <>
        <Box>
            <select ref={selectRef} multiple={multiple}></select>
        </Box>
    </>;
});
