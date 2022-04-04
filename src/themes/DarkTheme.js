import {createTheme} from "@mui/material";

const {palette} = createTheme();
const {augmentColor} = palette;
const createColor = (mainColor) => augmentColor({color: {main: mainColor}});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        anger: createColor('#333333'),
        textwhitish: createColor("#f8f8f8ff")
    },
});

export default darkTheme;