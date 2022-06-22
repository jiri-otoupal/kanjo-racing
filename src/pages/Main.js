import React, {useRef, useState} from 'react';
import Map, {Layer, Marker, Popup, Source} from 'react-map-gl';
import {
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Button,
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
    DeleteOutlined, Flag,
    Flag as Race,
    FlagCircle,
    Garage, LocationOn, Map as MapIcon, MyLocation,
    Person as ProfileIcon,
    PhotoCamera, RefreshRounded,
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
import {access_token, pre_url} from "../config";
import {fabStyle, Input} from "../components/styles/main";
import RaceContainer from "../components/RaceContainer";
import PopupData from "../classes/PopupData";
import geoJsonTemplate from "../templates/GeoJsonTemplate";
import {Race as RacePane} from "../components/Race";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';


const Main = () => {
    const cars_ref = useRef([]);
    const races_storage = useRef();
    const waypoints = useRef([]); //TODO: do dict of waypoints
    const tmp_cars = useRef([]);
    const tmp_races = useRef([]);
    const [distance, setDistance] = useState(null);

    //TODO: connect to button to set deletion mode
    const [popupInfo, setPopupInfo] = useState(null);
    const [raceEditMode, setRaceEditMode] = useState(false);
    const [geoJson, setGeoJson] = useState({});
    const [markers, setMarkers] = useState([]);
    const [racerMarkers, setRacerMarkers] = useState([]);
    const [raceMarkers, setRaceMarkers] = useState([]);
    const [waypointMarkers, setWaypointMarkers] = useState([]);
    const [racePane, setRacePane] = useState(null);

    const [coords, setCoords] = useState({});

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

    // eslint-disable-next-line import/no-webpack-loader-syntax
    mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

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

    const renderRoute = async (url, showDistance = true) => {
        const query = await fetch(
            url,
            {method: 'GET'}
        );
        const json = await query.json();
        const data = json.routes[0];
        let route = data.geometry.coordinates;

        // SWAP lat & lng
        //for (let i = 0; i < route.length; i++) {
        //    route[i] = [route[i][1], route[i][0]]
        //}

        const geoJsonTmp = geoJsonTemplate(route);
        console.log(geoJsonTmp);
        setGeoJson(geoJsonTmp);

        if (showDistance)
            setDistance(data.distance);
    }


    function handleSaveCar(e, callback) {
        setBlockAddCar(false);
        handleSubmit(e, callback);
    }

    function handleSaveRace(e, callback) {
        handleSubmit(e, callback, {
            waypoints: waypoints.current,
            session_id: getCookie("session_id"),
        });
    }

    function getCoords(lat, long, zoom) {
        return {
            latitude: lat,
            longitude: long,
            zoom: zoom
        };
    }


    let track = {
        just_once: () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(track.callback, track.handleError);

            }
        },

        callback: (pos) => {
            const coords1 = getCoords(pos.coords.latitude, pos.coords.longitude, 14);
            setCoords(coords1);
            setRacerMarkers([<Marker longitude={pos.coords.longitude} latitude={pos.coords.latitude}>
                <LocationOn sx={{fontSize: '1.5rem'}} style={{color: "white"}}/>
            </Marker>]);
        },
        handleError: (error) => {
            console.log(error);
        }
    };


    function deleteCar(car_id) {
        callApi("/backend/car.php", handleCarsUpdate, {delete: true, car_id: car_id});
    }

    function updateCarOnChangeCallback(data) {
        if (data["status"] === "OK") {
            console.log("Calling Update Cars");
            callApi("/backend/car.php", handleCarsUpdate);
        }
    }

    function generateCarRow(car) {
        if (car == null) {
            console.log("Car for generate is null")
            return;
        } else {
            console.log(car);
        }

        let vehicle_img = "url(" + SampleCar + ")";

        if (car.hasOwnProperty("img_url") || car["img_url"] !== "")
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
                    <form action={pre_url + window.location.hostname + "/backend/car.php"}
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
                                <IconButton color="primary" aria-label="upload picture" component="span"><PhotoCamera/>
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
        console.log(data)


        let cars = data["cars"];

        if (!Array.isArray(data["cars"]))
            cars = [data["cars"]];


        if (cars == null || cars.length === 0) {
            setCarsExist(false);
        } else {
            let tmp = [];

            if (Object.keys(cars).includes("id")) {
                tmp.push(generateCarRow(cars));
            } else {
                for (let i = 0; i < cars.length; i++)
                    tmp.push(generateCarRow(cars[i]));
            }

            tmp_cars.current = tmp;
            setCars(tmp_cars.current);
            setCarsExist(true);
            cars_ref.current = cars;
        }
    }

    function updateRaceOnChangeCallback(data) {
        if (data != null && data["status"] === "OK") {
            console.log("Calling Update Races");
            callApi("/backend/race.php", handleRacesUpdate);
            callApi("/backend/car.php", handleCarsUpdate);
        }
    }

    function deleteRace(id) {
        callApi("/backend/race.php", handleRacesUpdate, {delete: true, race_id: id});
    }

    function callbackEditMode(_waypoints) {
        if (_waypoints == null) {
            console.log("Waypoints are null on edit")
            return;
        }
        setMapControls(mapControl);
        setChecked(false);
        setRaceEditMode(true);
        console.log("Requested waypoints for edit", _waypoints);
        waypoints.current = _waypoints;
        setNavVal(0);
        updateMarkers();
    }

    function callbackMapRacers(markers) {
        setRacerMarkers(markers);
    }

    function callbackMapWaypoints(markers) {
        setWaypointMarkers(markers);
    }

    function callbackDrawRaceRoute(coords) {
        console.log("Draw route coords", coords);
        if (coords == null)
            setGeoJson({});
        if (coords != null && coords.length >= 1) {
            const url = getInterpolatedPathRequestFromWaypoints(coords);
            renderRoute(url, false).then(r => function () {
            });
        }
    }

    function callbackSetClosestRace(data) {
        const races = data["races"];
        if (races == null) {
            console.log("No races");
            return;
        }
        console.log("races", races);
        const race = React.createElement(RacePane, {
                race: (!Object.keys(races).includes("race_id") ? races[0] : races),
                mapUpdate: callbackMapRacers,
                drawRoute: callbackDrawRaceRoute,
                drawWaypoints: callbackMapWaypoints,
                setMapLocation: setCoords
            }
        );
        setRacePane(race);
        console.log("Setted race pane", races);
    }

    if (racePane == null)
        callApi("/backend/race.php", callbackSetClosestRace, {
            op: "get_joined",
            user_id: getCookie("user_id")
        });


    function generateRaceRow(race) {
        const raceContainer = React.createElement(RaceContainer, {
            r: race, h: handleSaveRace,
            u: updateRaceOnChangeCallback, d: deleteRace, c: callbackEditMode, cars: cars_ref
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

        setLoadedCars(false);
        setLoadedRaces(true);

        let races = data["races"];
        for (const [i, race] of (Object.keys(races).includes("race_id") ? Object.entries([races]) : Object.entries(races))) {
            console.log("Race", i, race);

            let waypoint_arr = [];

            if (race.hasOwnProperty("waypoints_np") && race["waypoints_np"] !== null) {
                const waypoints_tmp = race["waypoints_np"].split(";");
                waypoints_tmp.forEach(waypoint => {
                    const waypoint_tmp = waypoint.split(",");
                    waypoint_arr.push({step: waypoint_tmp[0], lat: waypoint_tmp[1], lng: waypoint_tmp[2]});
                });
            }
            Object.assign(race, {waypoints: waypoint_arr});
        }

        console.log("Handle Races update", races);


        let tmp = [];

        races_storage.current = races;

        if (Object.keys(races).includes("race_id")) {
            tmp.push(generateRaceRow(races));
        } else {
            for (let i = 0; i < races.length; i++)
                tmp.push(generateRaceRow(races[i]));
        }


        tmp_races.current = tmp;
        setRaces(tmp_races.current); //TODO: maybe better to use ref
    }

    if (!loadedProfile)
        callApi("/backend/profile.php", handleProfileUpdate);

    if (!loadedCars)
        callApi("/backend/car.php", handleCarsUpdate);

    if (!loadedRaces)
        callApi("/backend/race.php", handleRacesUpdate);


//callApi("/backend/race.php", function () {
//                 }, {race_id: 1, waypoints: waypoints.current});

    const mapControl = (
        <div style={fabStyle}>

            <IconButton size={"large"} onClick={function () {
                clearWaypoints();
                setMapControls(null);
            }
            } style={{color: "#f8f8f8", marginRight: "16px", backgroundColor: "rgba(160, 0, 0, 1)"}}>
                <DeleteOutlined/>
            </IconButton>

            <Button size={"large"} onClick={function () {
                setRaceEditMode(false);
                setNavVal(3);
                setChecked(true);
                setMapControls(null);
                createNewRace();
                setDistance(null);
            }} variant="contained" style={{color: "#f8f8f8", backgroundColor: "darkgreen"}} endIcon={<Check/>}>
                Save
            </Button>
        </div>
    );

    const races_menu = (
        <div>
            <Fab key={"add_race_btn"} color="#333333" style={fabStyle} aria-label="add" onClick={function () {
                clearWaypoints();
                setRaceEditMode(true);
                setChecked(false);
                setNavVal(0);
                setMapControls(mapControl);
            }}>
                <Add/>
            </Fab>
            <Stack key={"races_list"} style={{
                width: "100vw",
                height: "100%",
                display: "flex",
                alignContent: "center",
                justifyContent: "center"
            }}
                   color={"textwhitish"}>
                {races}
            </Stack>
        </div>
    );

    const profile_menu = (
        <Container maxWidth={"sm"} style={{backgroundColor: "#222222", borderRadius: "10px"}}>
            <form action={pre_url + window.location.hostname + "/backend/profile.php"}
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

        if (blockAddRace)
            return;


        tmp_races.current.push(generateRaceRow({
            name: "Enter Race Name", owner_id: getCookie("user_id"), waypoints: waypoints.current
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

    function clearWaypoints() {
        console.log("clearing waypoints");
        setChecked(false);
        setRacerMarkers([]);
        setRaceEditMode(false);
        const geoJsonTmp = geoJsonTemplate({});
        waypoints.current = [];
        setGeoJson(geoJsonTmp);
        updateMarkers();
        setDistance(null);
    }

    function handleRemoveWaypoint(i) {
        setPopupInfo(null);
        waypoints.current.pop(i);
        updateMarkers();
    }

    function handleAddWaypoint(event) {
        if (!raceEditMode)
            return;
        const pos = event.lngLat;
        waypoints.current.push(Object.assign({}, pos, {step: (waypoints.current.length + 1)}));
        updateMarkers();
    }

    function setPopupData(event, popup_obj) {
        event.stopPropagation();
        setPopupInfo(popup_obj);
    }


    function updateMarkers() {
        let tmp_markers = [];
        if (waypoints.current.length)
            //TODO: Marker limit 12
            for (let i = 0; i < waypoints.current.length; i++) {
                const waypoint = waypoints.current[i];
                const lng = waypoint.lng;
                const lat = waypoint.lat;
                const last = waypoints.current.length - 1;

                let marker = <Circle key={"waypoint" + i} className={"MarkerColor"}/>;

                if (i === 0)
                    marker = <StartRounded key={"StartWaypoint" + i} style={{color: "rgb(255,255,255,0.7)"}}/>
                else if (i === last)
                    marker = <FlagCircle key={"FinishWaypoint" + i} style={{color: "rgb(255,255,255,0.7)"}}/>

                const markerBody = (
                    <Grid container direction="row" alignItems="center">
                        <Grid item>
                            <Typography color={"black"} variant={"h5"}
                                        fontWeight={"1000"}>{i > 0 && i < last ? i : null}</Typography>
                        </Grid>
                        <Grid item>
                            <Button style={{marginBottom: "16px"}} size={"small"} variant={"contained"}
                                    onMouseDown={(event) => setPopupData(event, popup_obj)
                                    }>Edit</Button>
                        </Grid>
                    </Grid>);

                const popup_obj = new PopupData(lng, lat, handleRemoveWaypoint.bind(i));

                tmp_markers.push(
                    <Marker anchor="bottom" key={"Marker" + i} draggable={true} longitude={lng}
                            latitude={lat}>
                        {markerBody}
                        {marker}
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

    const distanceInfo = (
        <div style={{
            backgroundColor: "rgb(0,0,0,0.85)",
            position: "fixed",
            top: "12px",
            left: "12px",
            borderRadius: "12px"
        }}>
            <Typography variant={"h6"}
                        style={{color: "white"}}>Distance: {(distance / 1000).toFixed(2)} km</Typography>
        </div>);


    function updateRaces() {
        updateRaceOnChangeCallback();
        let races = [];

        races_storage.current.forEach(race => {
            races.push(<Marker longitude={race.longitude} latitude={race.latitude}>
                <Flag sx={{fontSize: '1.5rem'}} style={{color: "white"}}/><b
                style={{
                    color: "black",
                    fontSize: "1.5rem",
                    backgroundColor: "rgb(255,255,255,0.75)",
                    borderRadius: "6px"
                }}>race.name</b>
            </Marker>)
        })

        setRaceMarkers(races);
    }

    return (
        <ThemeProvider theme={darkTheme}>

            <div style={{display: "flex"}}>
                <Map
                    initialViewState={{
                        longitude: 14,
                        latitude: 50,
                        zoom: 2
                    }}
                    //bearing={-60}
                    //pitch={60}

                    mapboxAccessToken={access_token}

                    viewState={coords}
                    onZoomStart={resetCoords}
                    onDragStart={resetCoords}
                    style={{width: "100vw", height: "100vh"}}
                    mapStyle="mapbox://styles/opaka/cl1kxb42p00o514o3ix7xo2x9"
                    onClick={handleAddWaypoint}
                >
                    {waypointMarkers}
                    {racerMarkers}
                    {raceMarkers}

                    {bottomNavVal === 0 ? racePane : null}

                    <Source id="route" type="geojson" data={geoJson}>
                        <Layer  {...layerStyle} />
                    </Source>

                    {markers}

                    {popupInfo && (
                        <Popup
                            anchor="top"
                            longitude={popupInfo.lng}
                            latitude={popupInfo.lat}
                            closeOnClick={true}
                            onClose={() => setPopupInfo(null)}
                        >
                            {popupInfo.component}
                        </Popup>
                    )}

                    {distance != null ? distanceInfo : null}
                </Map>
                <Slide direction="up" in={checked} container={containerRef.current}>
                    <Paper sx={{
                        overflowX: "hidden",
                        overflowY: "auto",
                        position: "fixed",
                        width: "100%",
                        height: "90%",
                        backgroundColor: "#111111",
                        display: "flex",
                        alignItems: "center",
                        alignContent: "center",
                        justifyItems: "center",
                        justifyContent: "center",
                    }} elevation={0}>
                        {boxContent === "profile" ? profile_menu : boxContent === "cars" ? cars_menu : races_menu}
                    </Paper>
                </Slide>

                <IconButton aria-label={"Report"} id={"report-pos"}><Report/></IconButton>

                {mapControls}
                <IconButton size={"large"} style={{backgroundColor: "#f8f8f8"}} onClick={updateRaces}
                            aria-label={"Center"}
                            id={"center-pos-up"}><RefreshRounded/></IconButton>
                <IconButton size={"large"} style={{backgroundColor: "#f8f8f8"}} onClick={track.just_once}
                            aria-label={"Center"}
                            id={"center-pos"}><MyLocation/></IconButton>
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
                        if (newValue !== 0) {
                            clearWaypoints();
                            setChecked(true);
                            setDistance(null);
                        } else {
                            setChecked(false);
                        }

                        if (newValue === 1) {
                            callApi("/backend/profile.php", handleProfileUpdate);
                            setBoxContent("profile");
                            setBlockAddCar(false);
                        } else if (newValue === 2) {
                            tmp_cars.current = [];
                            callApi("/backend/car.php", handleCarsUpdate);
                            setBoxContent("cars");
                        } else if (newValue === 3) {
                            callApi("/backend/race.php", handleRacesUpdate);
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
            </div>
        </ThemeProvider>
    )
        ;
}


export default Main;