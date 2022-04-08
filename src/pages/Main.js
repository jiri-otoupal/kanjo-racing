import React, {useRef, useState} from 'react';
import Map, {Layer, Marker, Source} from 'react-map-gl';
import {
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Button,
    Checkbox,
    Container,
    Fab,
    Grid,
    IconButton,
    Paper,
    Slide,
    Stack,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import {
    Add,
    Check,
    Circle,
    Delete as DeleteIcon,
    DeleteOutlined,
    DirectionsCar,
    Flag as Race,
    FlagCircle,
    Garage,
    Map as MapIcon,
    Person as ProfileIcon,
    PhotoCamera,
    Report,
    StartRounded
} from "@mui/icons-material";
import darkTheme from "../themes/DarkTheme";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    callApi,
    getCookie,
    getInterpolatedPathRequestFromWaypoints,
    handleSubmit
} from "../utils";
import SampleCar from "./../resources/images/sample_car.png";
import {RaceTimeSelector} from "../components/RaceTimeSelector";
import {access_token} from "../config";
import {fabStyle, Input} from "../components/styles/main";
import RaceContainer from "../components/RaceContainer";


const Main = () => {
    const waypoints = useRef([]);
    const tmp_cars = useRef([]);
    const tmp_races = useRef([]);

    //TODO: connect to button to set deletion mode
    const [raceEditMode, setRaceEditMode] = useState(false);
    const [geojson, setGeoJson] = useState({});
    const [delWaypointMode, setDelWaypointMode] = useState(false);
    const [markers, setMarkers] = useState([]);

    const [coords, setCoords] = useState({});
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);

    const [loadedProfile, setLoadedProfile] = useState(false);
    const [loadedCars, setLoadedCars] = useState(false);
    const [loadedRaces, setLoadedRaces] = useState(false);

    const [blockAddRace, setBlockAddRace] = useState(false);
    const [blockAddCar, setBlockAddCar] = useState(false);
    const [carsExist, setCarsExist] = useState(false);
    const [loadingState, setLoading] = useState(false);
    const [boxContent, setBoxContent] = React.useState("map");
    const [nicknameVal, setNicknameVal] = React.useState("");
    const [karmaVal, setKarmaVal] = React.useState(0);
    const [bottomNavVal, setNavVal] = React.useState(0);
    const [checked, setChecked] = React.useState(false);
    const containerRef = React.useRef(null);
    const [mapControls, setMapControls] = useState(null);
    const [cars, setCars] = useState(null);
    const [races, setRaces] = useState(null);

    const layerStyle = {
        id: 'track',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#f8f8f8',
            'line-width': 5,
            'line-opacity': 0.75
        }
    };

    const renderRoute = async (url) => {
        const query = await fetch(
            url,
            {method: 'GET'}
        );
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;

        const geoJsonTmp = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };

        setGeoJson(geoJsonTmp);
    }


    function handleSaveCar(e, callback) {
        setBlockAddCar(false);
        handleSubmit(e, callback);
    }

    function handleSaveRace(e, callback) {
        setBlockAddRace(false);
        handleSubmit(e, callback);
    }

    function getCoords(lat, long, zoom) {
        return {
            latitude: lat,
            longitude: long,
            zoom: zoom
        };
    }


    let track = {
        // (B) PROPERTIES & SETTINGS
        watchOptions: {
            timeout: 10000,
            maxAge: 0,
            enableHighAccuracy: true
        },

        watchId: null, // Interval timer.
        // (C) INIT
        init: () => {
            // (C2) CHECK GPS SUPPORT + START TRACKING
            if (navigator.geolocation)
                track.watchId = navigator.geolocation.watchPosition(track.update, track.handleError, track.watchOptions);

        },

        just_once: () => {
            if (navigator.geolocation)
                navigator.geolocation.getCurrentPosition(track.callback, track.handleError);
        },

        callback: (pos) => {
            const coords1 = getCoords(pos.coords.latitude, pos.coords.longitude, 12);
            setCoords(coords1);
        },

        // (D) UPDATE CURRENT LOCATION TO SERVER
        update: (pos) => {

            callApi("http://localhost:80/backend/tracking.php", track.callback, {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            });

            if (latitude == 0) {
                setLatitude(pos.coords.latitude);
                setLongitude(pos.coords.longitude);
            }

        },

        handleError: (error) => {
            console.log(error);
        }
    };


    //track.just_once();

    //track.init(); // Enables Tracking to DB


    function deleteCar(car_id) {
        callApi("http://localhost:80/backend/car.php", handleCarsUpdate, {delete: true, car_id: car_id});
    }

    function updateCarOnChangeCallback(data) {
        if (data["status"] === "OK") {
            console.log("Calling Update Cars");
            callApi("http://localhost:80/backend/car.php", handleCarsUpdate);
        }
    }

    function generateCarRow(car) {
        let vehicle_img = "url(" + SampleCar + ")";

        if (car["img_url"] !== "")
            vehicle_img = "url(" + car['img_url'] + ")";


        return (
            <Container key={"container" + car["id"]} maxWidth={"sm"} style={{
                marginTop: "6px",
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
                <div style={{marginTop: "12px", marginBottom: "12px"}}>
                    <form action="http://localhost:80/backend/car.php"
                          method="post"
                          onSubmit={(event) => {
                              handleSaveCar(event, updateCarOnChangeCallback);
                          }}>

                        <input name={"car_id"} type={"text"} hidden value={car["id"]}/>
                        <input name={"session_id"} type={"text"} hidden value={getCookie("session_id")}/>
                        <TextField className={"menu-field"} name={"name"} label={"Nickname"} variant="filled"
                                   size="small" defaultValue={car["name"]}/>

                        <TextField className={"menu-field"} name={"vehicle_type"} label={"Vehicle Type"}
                                   variant="filled"
                                   size="small" defaultValue={car["vehicle_type"]}/>

                        <TextField className={"menu-field"} name={"brand"} label={"Brand"} variant="filled"
                                   size="small" defaultValue={car["brand"]}/>

                        <TextField className={"menu-field"} name={"hp"} label={"Horse Power"} variant="filled"
                                   size="small" defaultValue={car["hp"]}/>
                        <div style={{display: "inline-flex", justifyContent: "left", alignItems: "flex-start"}}>
                            <Button variant="outlined" startIcon={<DeleteIcon/>} onClick={function () {
                                deleteCar(car["id"])
                            }}>
                                Delete
                            </Button>
                            <label htmlFor="photo-upload" style={{alignSelf: "center"}}>
                                <Input accept="image/*" id="photo-upload" type="file" name={"img_url_upload"}/>
                                <Button variant="contained" component="span">
                                    Upload Photo
                                </Button>
                            </label>
                            <label htmlFor="photo-camera" style={{alignSelf: "center"}}>
                                <Input accept="image/*" id="photo-camera" type="file" name={"img_url_cam"}/>
                                <IconButton color="primary" aria-label="upload picture" component="span">
                                    <PhotoCamera/>
                                </IconButton>
                            </label>
                            <LoadingButton type={"submit"} color={"anger"}
                                           style={{alignSelf: "center"}}
                                           variant="contained">Save</LoadingButton>
                        </div>

                    </form>
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

        if (data["cars"] == null || data["cars"].length === 0) {
            setCarsExist(false);
        } else {
            let tmp = [];
            for (let i = 0; i < data["cars"].length; i++)
                tmp.push(generateCarRow(data["cars"][i]));

            tmp_cars.current = tmp;
            setCars(tmp_cars.current);
            setCarsExist(true);
        }
    }

    function updateRaceOnChangeCallback(data) {
        if (data["status"] === "OK") {
            console.log("Calling Update Races");
            callApi("http://localhost:80/backend/race.php", handleRacesUpdate);
        }
    }

    function deleteRace(id) {
        callApi("http://localhost:80/backend/race.php", handleRacesUpdate, {delete: true, race_id: id});
    }

    function generateRaceRow(race, i) {
        const raceContainer = React.createElement(RaceContainer, {
            r: race, h: handleSaveRace,
            u: updateRaceOnChangeCallback, d: deleteRace, w: waypoints.current, races: i
        });


        return (
            raceContainer
        );
    }

    function handleRacesUpdate(data) {
        if (data["status"] === "FAIL") {
            window.location = "/?unauthorized=1";
            return;
        }

        setLoadedRaces(true);

        let tmp = [];
        const races = data["races"];

        for (let i = 0; i < races.length; i++)
            tmp.push(generateRaceRow(races[i], i));

        tmp_races.current = tmp;
        setRaces(tmp_races.current);
    }

    if (!loadedProfile)
        callApi("http://localhost:80/backend/profile.php", handleProfileUpdate);

    if (!loadedCars)
        callApi("http://localhost:80/backend/car.php", handleCarsUpdate);

    if (!loadedRaces)
        callApi("http://localhost:80/backend/race.php", handleRacesUpdate);


//callApi("http://localhost/backend/race.php", function () {
//                 }, {race_id: 1, waypoints: waypoints.current});

    const mapControl = (
        <div style={fabStyle}>

            <Checkbox size={"large"} onChange={e => {
                setDelWaypointMode(e.target.checked)
            }} style={{color: "#f8f8f8", marginRight: "16px", backgroundColor: "rgba(160, 0, 0, 1)"}}
                      icon={<DeleteOutlined/>} checkedIcon={<DeleteIcon/>}/>

            <Button size={"large"} onClick={function () {
                setRaceEditMode(false);
                setNavVal(2);
                setChecked(true);
                setMapControls(null);
                createNewRace();
            }} variant="contained" style={{color: "#f8f8f8", backgroundColor: "darkgreen"}} endIcon={<Check/>}>
                Save
            </Button>
        </div>
    );

    const races_menu = (
        <div>
            <Fab color="#333333" style={fabStyle} aria-label="add" onClick={function () {
                setRaceEditMode(true);
                setChecked(false);
                setNavVal(0);
                setMapControls(mapControl);
            }}>
                <Add/>
            </Fab>
            <Stack style={{width: "100vw",height: "100%", display: "flex", alignContent: "center", justifyContent: "center"}}
                   color={"textwhitish"}>
                {races}
            </Stack>
        </div>
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
                               defaultValue={nicknameVal}/>
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


    function createNewRace() {
        //TODO
        if (blockAddRace)
            return;


        tmp_races.current.push(generateRaceRow({
            name: "Enter Race Name",
        }));


        setBlockAddRace(true);
        setRaces(tmp_races.current);
    }

    function createNewCar() {
        if (blockAddCar)
            return;
        tmp_cars.current.push(generateCarRow({
            name: "Enter Name",
            brand: "Enter Brand",
            vehicle_type: "Enter Type(Example Corrola GR)",
            hp: "0"
        }));

        setBlockAddCar(true,);
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


    function handleRemoveWaypoint(i) {
        waypoints.current.pop(i);
        updateMarkers();
    }

    function handleAddWaypoint(event) {
        if (!raceEditMode)
            return;
        const pos = event.lngLat;
        if (!delWaypointMode)
            waypoints.current.push(Object.assign({}, pos, {step: (waypoints.current.length + 1)}));
        updateMarkers();
    }


    function updateMarkers() {
        let tmp_markers = [];
        if (waypoints.current.length)
            //TODO: Marker limit 12
            for (let i = 0; i < waypoints.current.length; i++) {
                const waypoint = waypoints.current[i];
                const long = waypoint.lng;
                const lat = waypoint.lat;
                const last = waypoints.current.length - 1;

                let marker = <Circle className={"MarkerColor"}/>;

                if (i === 0)
                    marker = <StartRounded style={{color: "rgb(255,255,255,0.7)"}}/>
                else if (i === last)
                    marker = <FlagCircle style={{color: "rgb(255,255,255,0.7)"}}/>


                const markerBody = (
                    <Grid container direction="row" alignItems="center">
                        <Grid item>
                            {marker}
                        </Grid>
                        <Grid item>
                            <Typography color={"black"} variant={"h5"}
                                        fontWeight={"1000"}>{i > 0 && i < last ? i : null}</Typography>
                        </Grid>
                    </Grid>);

                tmp_markers.push(
                    <Marker draggable={!delWaypointMode} onClick={function () {
                        handleRemoveWaypoint(i)
                    }} longitude={long} latitude={lat}>
                        {markerBody}
                    </Marker>
                );

            }
        if (waypoints.current.length > 2) {
            const url = getInterpolatedPathRequestFromWaypoints(waypoints.current);
            renderRoute(url).then(r => function () {
            });
        }
        setMarkers(tmp_markers);
    }

    function resetCoords() {
        setCoords(null);
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <div>
                <Map
                    initialViewState={{
                        longitude: 14,
                        latitude: 50,
                        zoom: 2
                    }}
                    //bearing={-60}
                    //pitch={60}

                    mapboxAccessToken={access_token}
                    //TODO: Fix this
                    viewState={coords}

                    onZoomStart={resetCoords}
                    onDragStart={resetCoords}
                    style={{width: "100vw", height: "100vh"}}
                    mapStyle="mapbox://styles/opaka/cl1kxb42p00o514o3ix7xo2x9"
                    onClick={handleAddWaypoint}
                >
                    <Source id="route" type="geojson" data={geojson}>
                        <Layer  {...layerStyle} />
                    </Source>
                    <Marker longitude={longitude} latitude={latitude}>
                        <DirectionsCar/>
                    </Marker>

                    {markers}

                    <Slide direction="up" in={checked} container={containerRef.current}>
                        <Paper sx={{
                            overflowX: "hidden",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            position: "fixed",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#111111",
                            display: "flex",
                            alignItems: "center",
                            alignContent: "center",
                            justifyItems: "center",
                            justifyContent: "center"
                        }} elevation={0}>
                            {boxContent === "profile" ? profile_menu : boxContent === "cars" ? cars_menu : races_menu}
                        </Paper>
                    </Slide>

                    <IconButton aria-label={"Report"} id={"report-pos"}><Report/></IconButton>

                    {mapControls}
                    <BottomNavigation
                        size={"large"}
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
                            setMapControls(null);
                            setNavVal(newValue);
                            if (newValue !== 0)
                                setChecked(true);
                            else
                                setChecked(false);

                            if (newValue === 1) {
                                callApi("http://localhost:80/backend/profile.php", handleProfileUpdate);
                                setBoxContent("profile");
                                setBlockAddCar(false);
                            } else if (newValue === 2) {
                                tmp_cars.current = [];
                                callApi("http://localhost:80/backend/car.php", handleCarsUpdate);
                                setBoxContent("cars");
                            } else if (newValue === 3) {
                                callApi("http://localhost:80/backend/race.php", handleRacesUpdate);
                                setBoxContent("races");
                                setBlockAddCar(false);
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