import React from 'react';
import Map, {Layer, Source} from 'react-map-gl';
import {BottomNavigation, BottomNavigationAction, IconButton} from "@mui/material";
import {Map as MapIcon, Person as ProfileIcon, Flag as Race, Report} from "@mui/icons-material";

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

const Main = () => {

    return (
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
                <IconButton aria-label={"Report"} id={"report-pos"}><Report/></IconButton>
                <BottomNavigation
                    className={"map-nav-bar"}
                    showLabels
                    value={0}
                    onChange={(event, newValue) => {

                    }}
                >
                    <BottomNavigationAction label="Map" icon={<MapIcon/>}/>
                    <BottomNavigationAction label="Profile" icon={<ProfileIcon/>}/>
                    <BottomNavigationAction label="Races" icon={<Race/>}/>
                </BottomNavigation>
            </Map>
        </div>
    );
}


export default Main;