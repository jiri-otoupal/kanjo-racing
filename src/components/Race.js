import React from "react";
import Leaderboard from "./Leaderboard";
import {callApi, getCookie} from "../utils";
import {Marker} from "react-map-gl";
import {Check, Circle, Clear, Flag, FlagCircle, SportsScoreOutlined, SportsScoreRounded} from "@mui/icons-material";
import {CountdownCircleTimer} from 'react-countdown-circle-timer'
import {Checkbox, FormControlLabel} from "@mui/material";
import WaypointSound from "./../resources/audio/waypoint.wav";

export class Race extends React.Component {
    constructor(props) {
        super(props);
        if (props.race == null)
            return;

        this.alerted = false;
        this.callbackWaypoints = this.callbackWaypoints.bind(this);
        this.update = this.update.bind(this);
        this.handleError = this.handleError.bind(this);
        this.callbackLocationUpdate = this.callbackLocationUpdate.bind(this);
        this.stopLocationWatch = this.stopLocationWatch.bind(this);
        this.render = this.render.bind(this);
        this.generateRacerMarkers = this.generateRacerMarkers.bind(this);
        this.handleReady = this.handleReady.bind(this);
        this.startLocationWatch = this.startLocationWatch.bind(this);
        this.startRace = this.startRace.bind(this);
        this.generateGateMarkers = this.generateGateMarkers.bind(this);
        this.refreshTime = this.refreshTime.bind(this);
        this.randColor = this.randColor.bind(this);
        this.racers_pos = [];
        this.race = props["race"];
        this.step = 0;

        const remainingSec = (new Date(this.race["start_time"]) - new Date()) / 1000;
        this.state = {
            racer_color: {},
            ready: false,
            racers_pos: [],
            displayCounter: true,
            remainingSeconds: remainingSec
        };


        callApi("/backend/race.php", this.callbackWaypoints, {
            op: "get_waypoints",
            race_id: this.race.race_id
        });
        this.startLocationWatch();
    }

    startLocationWatch() {
        //console.log("Started Location watch");
        const watchOptions = {
            timeout: 10000,
            maxAge: 500, //ms
            enableHighAccuracy: true
        };
        if (navigator.geolocation)
            this.watchId = navigator.geolocation.watchPosition(this.update, this.handleError, watchOptions);
    }

    randColor() {
        const r = ('0' + (Math.random() * 256 | 0).toString(16)).slice(-2),
            g = ('0' + (Math.random() * 256 | 0).toString(16)).slice(-2),
            b = ('0' + (Math.random() * 256 | 0).toString(16)).slice(-2);
        return '#' + r + g + b;
    }

    generateRacerMarkers(racers) {

        let markers = [];


        racers.forEach(racer => {
            const racer_name = racer.name;
            let racer_color_tmp = this.state.racer_color[racer_name];
            if (racer_color_tmp == null) {
                racer_color_tmp = this.randColor();
                const n_dct = {}
                n_dct[racer_name] = racer_color_tmp

                this.setState({
                        racer_color: {...this.state.racer_color, ...n_dct}
                    }
                )
            }


            markers.push(<Marker longitude={racer.longitude} latitude={racer.latitude}>
                {racer.user_id !== getCookie("user_id") ? <Circle sx={{fontSize: '1.5rem'}} style={{color: "red"}}/> :
                    <Circle sx={{fontSize: '1rem'}} style={{color: racer_color_tmp}}/>}
                <b style={{color: "darkred"}}>{racer.name}</b>
            </Marker>);
        });
        return markers;
    }

    generateGateMarkers(route_waypoints) {
        let markers = [];

        route_waypoints.forEach(waypoint => {
            if (waypoint.step >= this.step) {
                let marker = <Circle sx={{fontSize: '1.5rem'}} style={{color: "rgb(255,255,50,0.7)"}}/>;
                if (parseInt(waypoint.step) === route_waypoints.length)
                    marker = <SportsScoreRounded style={{color: "white"}}/>

                markers.push(<Marker longitude={waypoint.longitude} latitude={waypoint.latitude}>
                    {marker}
                </Marker>);
            }
        });
        return markers;
    }

    update(pos) {
        if (!this.state.ready) {
            this.stopLocationWatch();
        } else {

            const callback = this.callbackLocationUpdate;
            callApi("/backend/tracking.php", callback, {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                race_id: this.race.race_id,
            });
        }
        //console.log("Ready", this.state.ready);

    }

    startRace() {
        setTimeout(() =>
            this.setState({
                displayCounter: false
            }), 2000);
    }

    stopLocationWatch() {
        //console.log("Stopped Watch");
        navigator.geolocation.clearWatch(this.watchId);
    }

    handleError(error) {
        console.log(error);
    }

    handleReady(event) {
        this.refreshTime();
        this.setState({
            ready: event.target.checked,
            displayCounter: event.target.checked
        });

        if (event.target.checked) {
            this.startLocationWatch();
            this.props.drawRoute(this.waypoints);
        } else {
            this.props.drawWaypoints(null);
            this.props.setMapLocation(null);
            this.props.drawRoute(null);
            this.props.mapUpdate([]);
            this.stopLocationWatch();
        }
    }

    callbackWaypoints(data) {
        this.waypoints = data["waypoints"];
        //console.log("Waypoints", this.waypoints);
    }


    callbackLocationUpdate(data) {
        if (data["collect"] === true) {
            this.props.drawRoute(this.waypoints);
            const audio = new Audio(WaypointSound);
            const promise = audio.play();
            this.step = data["step"];

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
        if (Object.keys(data["racers"]).includes("user_id"))
            this.racers = [data["racers"]];
        else
            this.racers = data["racers"];

        let tmp_racers = [];
        const browser_user_id = getCookie("user_id");

        this.racers.forEach(racer => {
            const raceStep = racer["step"];
            const distance = racer["dtw"];

            tmp_racers.push({
                lap: racer["lap"],
                step: raceStep,
                distance: distance,
                user_id: racer["user_id"],
                name: racer["nickname"],
                latitude: racer["latitude"],
                longitude: racer["longitude"]
            })

            //console.log(racer["user_id"], browser_user_id);
            if (racer["user_id"] === browser_user_id)
                this.racer = racer;
        });

        tmp_racers.sort((a, b) => {
            if (a[1] === b[1])
                return a[1] - b[1];
            else
                return a[0] - b[0];
        })
        //console.log("Racers Leaderboard", tmp_racers);

        this.setState({
            racers_pos: tmp_racers
        })

        let route_waypoints = JSON.parse(JSON.stringify(this.waypoints));

        for (let i = 0; i < route_waypoints.length; i++)
            if (route_waypoints[i]["step"] <= this.racer.step)
                route_waypoints.splice(i, 1);

        const currentLocation = {latitude: this.racer["latitude"], longitude: this.racer["longitude"], zoom: 17};
        route_waypoints.unshift(currentLocation);

        this.props.drawWaypoints(this.generateGateMarkers(route_waypoints));
        this.props.setMapLocation(currentLocation);

        this.props.mapUpdate(this.generateRacerMarkers(tmp_racers));

    }

    refreshTime() {
        let timeToRace = (new Date(this.race["start_time"]) - new Date()) / 1000;
        this.setState({remainingSeconds: timeToRace})
    }


    render() {
        if (this.state == null)
            return null;
        const renderTime = ({remainingTime}) => {
            const hours = Math.floor(remainingTime / 3600)
            const minutes = Math.floor((remainingTime % 3600) / 60)
            const seconds = remainingTime % 60

            const isTimeUp = remainingTime === 0;
            if (isTimeUp && this.state.displayCounter)
                this.startRace();

            let format = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            let fSize = "2rem";
            if (remainingTime < 60) {
                format = remainingTime;
                fSize = "7rem";
            } else if (hours === 0)
                format = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

            return (
                <div className="time-wrapper">
                    <div key={remainingTime} className={`time`} style={{fontSize: `${fSize}`}}>
                        {isTimeUp ? "GO" : format}
                    </div>

                </div>
            );
        };


        const leaderboard = React.createElement(Leaderboard, {
            waypoints: this.waypoints,
            racers: this.state.racers_pos,
            race: this.race
        });
        const readyBg = "rgb(0,0,0,0.8)";
        //console.log("Time", new Date(this.race["start_time"]));


        return <div>
            {this.state.ready ? leaderboard : null}

            <div className="timer-wrapper-main"
                 style={{visibility: this.state.displayCounter && this.state.ready ? "visible" : "hidden"}}>
                <CountdownCircleTimer
                    isPlaying={this.state.displayCounter && this.state.ready}
                    size={200}
                    duration={this.state.remainingSeconds}
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
                bottom: "15vh",
                color: "#f8f8f8",
                borderRadius: "12px",
                paddingRight: "12px",
                display: "flex",
                alignContent: "center",
                backgroundColor: this.state.ready ? "rgb(0,0,0,0.75)" : readyBg
            }}
                control={<Checkbox variant={this.state.ready ? "contained" : "outlined"} color="error" size={"large"}
                                   onChange={this.handleReady}>
                    {this.state.ready ? <Check/> : <Clear/>}Ready
                </Checkbox>}/>

        </div>;
    }


}
