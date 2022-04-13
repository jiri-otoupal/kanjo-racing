import React from "react";
import Leaderboard from "./Leaderboard";
import {callApi, getCookie} from "../utils";
import gps2m from "../location/GpsOperation";
import {Marker} from "react-map-gl";
import {Check, Circle, Clear} from "@mui/icons-material";
import {CountdownCircleTimer} from 'react-countdown-circle-timer'
import {Checkbox, FormControlLabel} from "@mui/material";
import StartGif from "./../resources/images/start.gif";
import WaypointSound from "./../resources/audio/waypoint.wav";

export class Race extends React.Component {
    constructor(props) {
        super(props);
        this.alerted = false;
        this.callbackWaypoints = this.callbackWaypoints.bind(this);
        this.update = this.update.bind(this);
        this.handleError = this.handleError.bind(this);
        this.callbackLocationUpdate = this.callbackLocationUpdate.bind(this);
        this.stopLocationWatch = this.stopLocationWatch.bind(this);
        this.render = this.render.bind(this);
        this.getState = this.getState.bind(this);
        this.generateRacerMarkers = this.generateRacerMarkers.bind(this);
        this.handleReady = this.handleReady.bind(this);
        this.startLocationWatch = this.startLocationWatch.bind(this);
        this.startRace = this.startRace.bind(this);
        this.generateGateMarkers = this.generateGateMarkers.bind(this);
        this.racers_pos = [];

        this.state = {
            ready: false,
            racers_pos: [],
            displayCounter: true
        };

        this.race = props["race"];


        callApi("http://localhost:80/backend/race.php", this.callbackWaypoints, {
            op: "get_waypoints",
            race_id: this.race.race_id
        });
        this.startLocationWatch();
    }

    startLocationWatch() {
        console.log("Started Location watch");
        const watchOptions = {
            timeout: 10000,
            maxAge: 100, //ms
            enableHighAccuracy: true
        };
        if (navigator.geolocation)
            this.watchId = navigator.geolocation.watchPosition(this.update, this.handleError, watchOptions);
    }

    generateRacerMarkers(racers) {
        let markers = [];

        racers.forEach(racer => {
            markers.push(<Marker longitude={racer.longitude} latitude={racer.latitude}>
                {racer.user_id !== getCookie("user_id") ? <Circle sx={{fontSize: '1.5rem'}} style={{color: "red"}}/> :
                    <Circle sx={{fontSize: '1.5rem'}} style={{color: "green"}}/>}
            </Marker>);
        });
        return markers;
    }

    generateGateMarkers(route_waypoints) {
        let markers = [];

        route_waypoints.forEach(racer => {
            markers.push(<Marker longitude={racer.longitude} latitude={racer.latitude}>
                <Circle sx={{fontSize: '1.5rem'}} style={{color: "yellow"}}/>
            </Marker>);
        });
        return markers;
    }

    update(pos) {
        if (!this.state.ready) {
            this.stopLocationWatch();
        } else {

            const callback = this.callbackLocationUpdate;
            callApi("http://localhost:80/backend/tracking.php", callback, {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                race_id: this.race.race_id
            });
        }
        console.log("Ready", this.state.ready);

    }

    startRace() {
        setTimeout(() =>
            this.setState({
                displayCounter: false
            }), 2000);
    }

    stopLocationWatch() {
        console.log("Stopped Watch");
        navigator.geolocation.clearWatch(this.watchId);
    }

    handleError(error) {
        console.log(error);
    }

    handleReady(event) {
        this.setState({
            ready: event.target.checked,
            displayCounter: event.target.checked
        });

        if (event.target.checked)
            this.startLocationWatch();
        else
            this.stopLocationWatch();
    }

    callbackWaypoints(data) {
        this.waypoints = data["waypoints"];
        console.log("Waypoints", this.waypoints);
    }


    callbackLocationUpdate(data) {
        if (data["collect"] === true) {
            const audio = new Audio(WaypointSound);
            const promise = audio.play();
            if (promise !== undefined) {
                promise.then(_ => {
                    // Autoplay started!
                }).catch(error => {
                    // Autoplay not allowed!
                    // Mute video and try to play again
                    if (!this.alerted) {
                        alert("Please allow Auto Play in browser for waypoint sounds");
                        this.alerted = true;
                    }

                    // Show something in the UI that the video is muted
                });
            }
        }

        this.racers = data["racers"];
        let tmp_racers = [];
        const browser_user_id = getCookie("user_id");

        this.racers.forEach(racer => {
            const raceStep = racer["step"];
            const i_w = raceStep != null ? raceStep - 1 : 0;
            const next_waypoint = this.waypoints[i_w];
            const distance = gps2m(racer["latitude"], racer["longitude"], next_waypoint.latitude, next_waypoint.longitude)

            tmp_racers.push({
                step: raceStep,
                distance: distance,
                user_id: racer["user_id"],
                name: racer["nickname"],
                latitude: racer["latitude"],
                longitude: racer["longitude"]
            })

            console.log(racer["user_id"], browser_user_id);
            if (racer["user_id"] === browser_user_id)
                this.racer = racer;
        });

        tmp_racers.sort((a, b) => {
            if (a[1] === b[1])
                return a[1] - b[1];
            else
                return a[0] - b[0];
        })
        console.log("Racers Leaderboard", tmp_racers);

        this.setState({
            racers_pos: tmp_racers
        })

        let route_waypoints = JSON.parse(JSON.stringify(this.waypoints));

        for (let i = 0; i < route_waypoints.length; i++)
            if (route_waypoints[i]["step"] <= this.racer.step)
                route_waypoints.splice(i, 1);

        const currentLocation = {latitude: this.racer["latitude"], longitude: this.racer["longitude"], zoom: 17};

        this.props.drawWaypoints(this.generateGateMarkers(route_waypoints));
        this.props.setMapLocation(currentLocation);

        route_waypoints.unshift(currentLocation);

        this.props.drawRoute(route_waypoints);
        this.props.mapUpdate(this.generateRacerMarkers(this.racers));

    }

    getState() {
        return this.state;
    }

    render() {
        const renderTime = ({remainingTime}) => {


            const isTimeUp = remainingTime === 0;
            if (isTimeUp && this.state.displayCounter)
                this.startRace();

            return (
                <div className="time-wrapper">
                    <div key={remainingTime} className={`time`}>
                        {isTimeUp ? "GO" : remainingTime}
                    </div>

                </div>
            );
        };

        const leaderboard = React.createElement(Leaderboard, {
            waypoints: this.waypoints,
            racers: this.state.racers_pos
        });
        const readyBg = "rgb(0,0,0,0.8)";


        const startingImg = <div style={{
            position: "absolute",
            backgroundImage: 'url(' + StartGif + ')',
            width: "100vw",
            height: "100vh",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
        }}/>;

        return <div>
            {this.state.ready ? leaderboard : null}

            <div className="timer-wrapper-main"
                 style={{visibility: this.state.displayCounter && this.state.ready ? "visible" : "hidden"}}>
                <CountdownCircleTimer
                    isPlaying={this.state.displayCounter && this.state.ready}
                    size={200}
                    duration={7}
                    colors={['#00b308', '#d0ff00', '#d29700', '#A30000']}
                    colorsTime={[7, 5, 2, 0]}
                >
                    {this.state.displayCounter && this.state.ready ? renderTime : null}
                </CountdownCircleTimer>
            </div>
            <FormControlLabel
                label="Ready" style={{
                position: "absolute",
                right: 0,
                bottom: 70,
                color: "#f8f8f8",
                borderRadius: "12px",
                paddingRight: "12px",
                display: "flex",
                alignContent: "center",
                backgroundColor: this.state.ready ? "rgb(0,0,0,0.75)" : readyBg
            }}
                control={<Checkbox variant={this.state.ready ? "contained" : "outlined"} color="error" size={"large"}
                                   onChange={this.handleReady}
                >
                    {this.state.ready ? <Check/> : <Clear/>}Ready
                </Checkbox>}/>

        </div>;
    }


}