import React, {useEffect, useRef, useState} from 'react';
import Map, {Layer, Source} from 'react-map-gl';
import {styled} from '@mui/material/styles';
import {
    Avatar,
    BottomNavigation,
    BottomNavigationAction, Button,
    Container, Fab, FormControlLabel, FormGroup, Grid,
    IconButton,
    Paper,
    Slide, Stack, Switch, Table, TextField, ThemeProvider, Typography
} from "@mui/material";
import {
    Map as MapIcon,
    Person as ProfileIcon,
    Flag as Race,
    Report,
    Add,
    Garage,
    PhotoCamera
} from "@mui/icons-material";
import darkTheme from "../themes/DarkTheme";
import LoadingButton from "@mui/lab/LoadingButton";
import {callApi, handleSubmit} from "../utils";
import {DataGrid} from '@mui/x-data-grid';
import $ from 'jquery';
import {GridColDef} from "@mui/x-data-grid";
import {GridRowsProp} from "@mui/x-data-grid";
import SampleCar from "./../resources/images/sample_car.png";


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

const Input = styled('input')({
    display: 'none',
});

const fabStyle = {
    position: 'fixed',
    bottom: 75,
    right: 16,
};





const Main = () => {
    const [loadedProfile, setLoadedProfile] = useState(false);
    const [loadedCars, setLoadedCars] = useState(false);
    const [loadedRaces, setLoadedRaces] = useState(false);
    const [loadedUserRaces, setUserLoadedRaces] = useState(false);

    const [blockAddCar, setBlockAddWithoutFill] = useState(false);
    const [carsExist, setCarsExist] = useState(false);
    const [loadingState, setLoading] = useState(false);
    const [boxContent, setBoxContent] = React.useState("map");
    const [nicknameVal, setNicknameVal] = React.useState("");
    const [karmaVal, setKarmaVal] = React.useState(0);
    const [bottomNavVal, setNavVal] = React.useState(0);
    const [checked, setChecked] = React.useState(false);
    const containerRef = React.useRef(null);
    const [cars, setCars] = useState(null);

    let tmp_cars = useRef([]);


    function handleSaveCar() {
        setBlockAddWithoutFill();
    }

    function generateCarRow(car) {
        let vehicle_img = "url(" + SampleCar + ")";

        if (car["img_url"] != null)
            vehicle_img = "url(" + car['img_url'] + ")";


        const rows = [
            {id: 1, name: 'Nickname', value: car["name"]},
            {id: 2, name: 'Vehicle Type', value: car["vehicle_type"]},
            {id: 3, name: 'Brand', value: car["brand"]},
            {id: 4, name: 'HP', value: car["hp"]},
        ];

        const columns = [
            {
                field: "name",
                headerName: "Name",
                sortable: false,
                disableColumnMenu: true,
                disableReorder: true,
                selectable: false,
                flex: true
            }, {
                field: "value",
                headerName: "Value",
                sortable: false,
                disableColumnMenu: true,
                disableReorder: true,
                editable: true,
                flex: true
            }
        ];


        return (
            <Container maxWidth={"sm"} style={{
                marginBottom: "6px",
                backgroundColor: "#222222",
                borderRadius: "10px",
                backgroundImage: vehicle_img,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundBlendMode: "darken",
                backgroundRepeat: "no-repeat",
                display: "flex",
                alignContent: "center",
                flexDirection: "column"

            }}>

                <DataGrid
                    id
                    rows={rows}
                    columns={columns}
                    density="compact"
                    pageSize={8}
                    autoHeight
                    rowsPerPageOptions={[5]}
                    headerHeight={0}
                    hideFooter
                    style={{border: 0, width: "100%"}}
                />
                <div style={{display: "inline-flex", justifyContent: "space-between", alignItems: "center"}}>
                    <label htmlFor="photo-upload" style={{alignSelf: "center"}}>
                        <Input accept="image/*" id="photo-upload" type="file"/>
                        <Button variant="contained" component="span">
                            Upload Photo
                        </Button>
                    </label>
                    <label htmlFor="photo-camera" style={{alignSelf: "center"}}>
                        <Input accept="image/*" id="photo-camera" type="file"/>
                        <IconButton color="primary" aria-label="upload picture" component="span">
                            <PhotoCamera/>
                        </IconButton>
                    </label>
                    <LoadingButton type={"button"} onClick={handleSaveCar} color={"anger"} style={{alignSelf: "center"}}
                                   variant="contained">Save</LoadingButton>
                </div>
            </Container>
        );
    }

    function handleProfileUpdate(data) {
        if (data["status"] === "FAIL") {
            window.location = "/?unauthorized=1";
            return;
        }

        setNicknameVal(data["nickname"]);
        setKarmaVal(data["karma"]);
        setLoadedProfile(true);
    }

    function handleCarsUpdate(data) {
        if (data["status"] === "FAIL") {
            window.location = "/?unauthorized=1";
            return;
        }

        setLoadedCars(true);

        let tmp = [];

        if (data["cars"].length === 0) {
            setCarsExist(false);
            return;
        }


        for (let i = 0; i < data["cars"].length; i++)
            tmp.push(generateCarRow(data["cars"][i]));

        tmp_cars.current = tmp;
        setCars(tmp_cars.current);
        setCarsExist(true);
    }

    function handleRacesUpdate(data) {
        if (data["status"] === "FAIL") {
            window.location = "/?unauthorized=1";
            return;
        }
        //TODO
        setLoadedRaces(true);
    }

    function handleUserRacesUpdate(data) {
        if (data["status"] === "FAIL") {
            window.location = "/?unauthorized=1";
            return;
        }
        //TODO
        setUserLoadedRaces(true);
    }

    if (!loadedProfile)
        callApi("http://localhost:80/backend/profile.php", handleProfileUpdate);

    if (!loadedCars)
        callApi("http://localhost:80/backend/car.php", handleCarsUpdate);

    if (!loadedRaces)
        callApi("http://localhost:80/backend/races.php", handleRacesUpdate);

    if (!loadedUserRaces)
        callApi("http://localhost:80/backend/user_race.php", handleUserRacesUpdate);

    const races_menu = (
        <Container maxWidth={"sm"} style={{backgroundColor: "#222222", borderRadius: "10px"}}>

            <Fab color="#333333" style={fabStyle} aria-label="add">
                <Add/>
            </Fab>
        </Container>
    );

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


    function createNewCar() {
        if (blockAddCar)
            return;
        tmp_cars.current.push(generateCarRow({
            name: "Enter Name",
            brand: "Enter Brand",
            vehicle_type: "Enter Type(Example Corrola GR)",
            hp: "0"
        }));

        setBlockAddWithoutFill(true,);
        setCarsExist(true);
        setCars(tmp_cars.current);
    }

    let cars_menu = (
        <div>
            <Typography variant={"h4"} color={"textwhitish"}>{!carsExist ? "No Cars" : ""}</Typography>
            <Fab color={"textwhitish"} style={fabStyle} aria-label="add" onClick={createNewCar}>
                <Add/>
            </Fab>
            <Stack style={{width: "100vw", display: "flex", alignContent: "center", justifyContent: "center"}}
                   color={"textwhitish"}>
                {cars}
            </Stack>
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
                            overflowX: "hidden",
                            maxHeight: "90vh",
                            overflowY: 'auto',
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
                            {boxContent === "profile" ? profile_menu : boxContent==="cars" ? cars_menu  : races_menu}
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
                                callApi("http://localhost:80/backend/profile.php", handleProfileUpdate);
                                setBoxContent("profile");
                                setBlockAddWithoutFill(false);
                            } else if (newValue === 2) {
                                callApi("http://localhost:80/backend/car.php", handleCarsUpdate);
                                setBoxContent("cars");
                            } else if (newValue === 3) {
                                callApi("http://localhost:80/backend/races.php", handleRacesUpdate);
                                callApi("http://localhost:80/backend/user_race.php", handleUserRacesUpdate);
                                setBoxContent("races");
                                setBlockAddWithoutFill(false);
                            }
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