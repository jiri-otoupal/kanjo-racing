import React, {useEffect, useRef, useState} from 'react';
import Map, {Layer, Source} from 'react-map-gl';
import {
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Container, Fab, FormControlLabel, FormGroup, Grid,
    IconButton,
    Paper,
    Slide, Stack, Switch, Table, TextField, ThemeProvider, Typography
} from "@mui/material";
import {Map as MapIcon, Person as ProfileIcon, Flag as Race, Report, Add, Garage} from "@mui/icons-material";
import darkTheme from "../themes/DarkTheme";
import LoadingButton from "@mui/lab/LoadingButton";
import {callApiGet, handleSubmit} from "../utils";
import {useHistory} from "react-router-dom";
import $ from 'jquery';

const access_token = "pk.eyJ1Ijoib3Bha2EiLCJhIjoiY2wxa3d6cmtyMDBpZzNjcWppMGM2djNxbCJ9.5Qka2qUoZBTZ5vkJpFwlKQ";


const geojson = {
    type: 'FeatureCollection',
    features: [
        {type: 'Feature', geometry: {type: 'Point', coordinates: [-122.4, 37.8]}}
    ]
};

const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
        'circle-radius': 10,
        'circle-color': '#007cbf'
    }
};

const fabStyle = {
    position: 'fixed',
    bottom: 75,
    right: 16,
};


const races_menu = (
    <Container maxWidth={"sm"} style={{backgroundColor: "#222222", borderRadius: "10px"}}>

        <Fab color="#333333" style={fabStyle} aria-label="add">
            <Add/>
        </Fab>
    </Container>
);

function generateCarRow() {
    return (<Stack color={"textwhitish"} spacing={1}>
        <Grid container spacing={1}>
            <Grid item>
                <Typography color={"textwhitish"}>
                    Car: Name
                    HP: 10
                </Typography>
            </Grid>
            <Grid item>
                <FormGroup>
                    <FormControlLabel color={"textwhitish"} control={<Switch defaultChecked/>} label="In Use"/>
                </FormGroup>
            </Grid>
        </Grid>
    </Stack>);
}

const Main = () => {
    const [cars, setCars] = useState("No Cars");
    const [loadingState, setLoading] = useState(false);
    const [boxContent, setBoxContent] = React.useState("map");
    const [nicknameVal, setNicknameVal] = React.useState("");
    const [karmaVal, setKarmaVal] = React.useState(0);
    const [bottomNavVal, setNavVal] = React.useState(0);
    const [checked, setChecked] = React.useState(false);
    const containerRef = React.useRef(null);


    function handleProfileUpdate(data) {
        if (data["status"] === "FAIL")
            return;

        setNicknameVal(data["nickname"]);
        setKarmaVal(data["karma"]);
    }


    const profile_menu = (
        <Container maxWidth={"sm"} style={{backgroundColor: "#222222", borderRadius: "10px"}}>
            <form action="http://localhost:80/backend/profile.php"
                  method="post"
                  onSubmit={(event) => {
                      handleSubmit(event);
                  }}>
                <Stack color={"textwhitish"} spacing={1}>
                    <Avatar style={{alignSelf: "center"}} {...('Kent Dodds')} />

                    <TextField color={"textwhitish"} id="nickname" label="Nickname" variant="outlined"
                               value={nicknameVal}/>
                    <TextField color={"textwhitish"} id="password" label="New Password" variant="outlined"/>
                    <div>
                        <span className={"text-normal"} style={{alignSelf: "left", marginRight: "30%"}}>Karma</span>
                        <span className={"text-normal"} id={"karma"}>{karmaVal}</span>
                    </div>
                    <LoadingButton type={"submit"} loading={loadingState} color={"anger"}
                                   variant="contained">Save</LoadingButton>

                </Stack>
            </form>
        </Container>
    );


    const cars_menu = (
        <div>
            <Typography variant={"h4"} color={"textwhitish"}>{cars}</Typography>
            <Fab color={"textwhitish"} style={fabStyle} aria-label="add">
                <Add/>
            </Fab>
        </div>
    );

    return (
        <ThemeProvider theme={darkTheme}>
            <div>
                <Map
                    mapboxAccessToken={access_token}
                    initialViewState={{
                        longitude: -100,
                        latitude: 40,
                        zoom: 12
                    }}
                    style={{width: "100vw", height: "100vh"}}
                    mapStyle="mapbox://styles/opaka/cl1kxb42p00o514o3ix7xo2x9"
                >
                    <Source id="my-data" type="geojson" data={geojson}>
                        <Layer {...layerStyle} />
                    </Source>

                    <Slide direction="up" in={checked} container={containerRef.current}>
                        <Paper sx={{
                            position: "absolute",
                            width: "100vw",
                            height: "100vh",
                            "backgroundColor": "#111111",
                            display: "flex",
                            alignItems: "center",
                            alignContent: "center",
                            justifyItems: "center",
                            justifyContent: "center"
                        }} elevation={14}>
                            {boxContent === "profile" ? profile_menu : "cars" ? cars_menu : races_menu}
                        </Paper>
                    </Slide>

                    <IconButton aria-label={"Report"} id={"report-pos"}><Report/></IconButton>
                    <BottomNavigation
                        sx={{
                            bgcolor: '#333333',
                            '& .Mui-selected': {
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: theme => theme.typography.caption,
                                    transition: 'none',
                                    fontWeight: 'bold',
                                    lineHeight: '20px'
                                },
                                '& .MuiSvgIcon-root, & .MuiBottomNavigationAction-label': {
                                    color: "#333333"
                                }
                            }
                        }}
                        className={"map-nav-bar"}
                        showLabels
                        value={bottomNavVal}
                        onChange={(event, newValue) => {
                            setNavVal(newValue);
                            if (newValue !== 0)
                                setChecked(true);
                            else
                                setChecked(false);

                            if (newValue === 1) {
                                callApiGet("http://localhost:80/backend/profile.php", handleProfileUpdate);
                                setBoxContent("profile");
                            } else if (newValue === 2)
                                setBoxContent("cars");
                            else if (newValue === 3)
                                setBoxContent("races");
                        }}
                    >
                        <BottomNavigationAction label="Map" icon={<MapIcon/>}/>
                        <BottomNavigationAction label="Profile" icon={<ProfileIcon/>}/>
                        <BottomNavigationAction label="Garage" icon={<Garage/>}/>
                        <BottomNavigationAction label="Races" icon={<Race/>}/>
                    </BottomNavigation>
                </Map>
            </div>
        </ThemeProvider>
    );
}


export default Main;