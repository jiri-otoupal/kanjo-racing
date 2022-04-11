import {callApi, getCookie} from "../utils";
import {Button, Container, FormControl, IconButton, InputLabel, Link, MenuItem, Select, TextField} from "@mui/material";
import React from "react";
import {Delete as DeleteIcon, PhotoCamera} from "@mui/icons-material";
import {Input, paperStyle} from "./styles/main";
import LoadingButton from "@mui/lab/LoadingButton";
import SampleCar from "../resources/images/sample_car.png";
import {RaceTimeSelector} from "./RaceTimeSelector";

class RaceContainer extends React.Component {
    constructor(props) {
        super(props);
        const race = props["r"], handleSaveRace = props["h"],
            updateRaceOnChangeCallback = props["u"], deleteRace = props["d"],
            callbackEditMode = props["c"], cars = props["cars"];

        console.log("Cars", cars);
        this.cars_extracted = cars; //TODO: make as ref or something
        this.margin = {};
        //if (races === 0)
        //    this.margin = {marginTop: "90vh"};
        this.callbackEditMode = callbackEditMode;
        this.vehicle_img = "url(" + SampleCar + ")";
        if (race["img_url"] !== "")
            this.vehicle_img = "url(" + race['img_url'] + ")";
        this.race = race;
        this.handleSaveRace = handleSaveRace;
        this.updateRaceOnChangeCallback = updateRaceOnChangeCallback;
        this.delete_race = deleteRace;
        console.log(race);
        this.state = {
            car: {},
            race_op: "Join",
            heat_level: "no_offence",
            loadingSave: false,
            loadingEdit: false,
            loadingJoin: false,
            joined: false
        };
        this.changeCar = this.changeCar.bind(this);
        this.changeHeatLevel = this.changeHeatLevel.bind(this);
        this.changeLoadingSave = this.changeLoadingSave.bind(this);
        this.changeLoadingJoin = this.changeLoadingJoin.bind(this);
        this.callbackJoin = this.callbackJoin.bind(this);
        this.generateCarItem = this.generateCarItem.bind(this);
    }

    changeLoadingSave(state) {
        this.setState({
            loadingSave: state
        });
    }


    changeLoadingJoin(state, operation) {
        const race = this.race;
        const car_id = this.state.car; //TODO Value to be car_id

        this.setState({
            loadingJoin: state
        });


        const customData = {
            op: operation,
            race_id: race["race_id"],
            car_id: car_id
        };

        console.log("Custom Data", customData);
        callApi("http://localhost:80/backend/race.php", this.callbackJoin, customData)
    }

    callbackJoin(data) {
        let join_stat;
        let op_stat = "Join";
        if (data["status"] === "OK") {
            if (data["message"].includes("join")) {
                op_stat = "Leave";
                join_stat = true;
            }else{
                join_stat = false;
            }

        } else {
            op_stat = this.state.race_op;
            join_stat = this.state.joined;
        }
        console.log("Setting State",op_stat);

        this.setState({
            loadingJoin: false,
            joined: join_stat,
            race_op: op_stat
        });
    }

    changeCar(event) {
        console.log(event);
        this.setState({
            car: event.target.value
        });
    }

    changeHeatLevel(event) {
        this.setState({
            heat_level: event.target.value
        });
    }

    componentDidMount() {
        this.changeHeatLevel = this.changeHeatLevel.bind(this);
    }

    generateCarItem(car) {
        console.log("Car", car);
        return <MenuItem value={car.id}>{car.name}</MenuItem>;
    }

    render() {
        const zoom = 14;
        const race = this.race;
        const lat = this.race["latitude"];
        const lng = this.race["longitude"];
        const is_owner = this.race["owner_id"] === getCookie("user_id");
        const updateRaceOnChangeCallback = this.updateRaceOnChangeCallback;
        const handleSaveRace = this.handleSaveRace;
        const id = this.race["race_id"];
        const deleteRace = this.delete_race;
        const timeSelector = React.createElement(RaceTimeSelector, {r: this.race, owner: is_owner});
        const styles = Object.assign({}, paperStyle, this.margin, {backgroundImage: this.vehicle_img});
        const changeLoading = this.changeLoadingSave;
        const _waypoints = this.race["waypoints"];
        console.log("Render Waypoints", _waypoints);
        const callbackEditMode = this.callbackEditMode;
        let car_items = [];

        this.cars_extracted.current.forEach(car =>
            car_items.push(this.generateCarItem(car))
        );


        const owner_elems = (<div><Button variant="outlined" startIcon={<DeleteIcon/>} onClick={function () {
            deleteRace(id)
        }}>
            Delete
        </Button>
            <label htmlFor="photo-camera" style={{alignSelf: "center"}}>
                <Input accept="image/*" id="photo-camera" type="file" name={"img_cam"}/>
                <IconButton color="primary" aria-label="upload picture" component="span">
                    <PhotoCamera/>
                </IconButton>
            </label>
            <LoadingButton type={"submit"} color={"anger"} loading={this.state.loadingSave}
                           onClick={this.changeLoadingSave.bind(true)}
                           style={{alignSelf: "center"}}
                           variant="contained">Save</LoadingButton></div>);
        //callApi("http://localhost/backend/race.php", function () {
        //}, {race_id: this.race["race_id"], waypoints: this.waypoints.current});


        const joined_race = (race["racers_id"] != null &&
            Array.from(race["racers_id"]).includes(getCookie("user_id"))) || this.state.joined;
        return (<Container key={"container" + this.race["race_id"]} maxWidth={"sm"}
                           style={styles}>
            <div key={"race_div" + this.race["race_id"]} style={{marginTop: "12px", marginBottom: "12px"}}>
                <form action="http://localhost:80/backend/race.php"
                      method="post"
                      onSubmit={(event) => {
                          handleSaveRace(event, function (data) {
                              console.log("Waypoints in Race", id, _waypoints)
                              race["waypoints"] = _waypoints;

                              updateRaceOnChangeCallback(data);
                              changeLoading(false);
                          });
                      }}>
                    <input name={"latitude"} type={"text"} hidden readOnly
                           value={_waypoints.length ? _waypoints[0].lat : 30}/>
                    <input name={"longitude"} type={"text"} hidden readOnly
                           value={_waypoints.length ? _waypoints[0].lng : 30}/>
                    <input name={"chat_link"} type={"text"} hidden readOnly value={""}/>
                    <input name={"race_id"} type={"text"} hidden readOnly value={this.race["race_id"]}/>
                    <input name={"session_id"} type={"text"} hidden readOnly value={getCookie("session_id")}/>
                    <TextField className={"menu-field"} name={"name"} label={"Nickname"} required variant="filled"
                               disabled={!is_owner}
                               size="small" defaultValue={this.race["name"]}/>

                    {timeSelector}


                    <TextField className={"menu-field"} name={"laps"} label={"Laps"} variant="filled"
                               disabled={!is_owner}
                               size="small" defaultValue={this.race["laps"]}/>
                    <TextField className={"menu-field"} name={"min_racers"} label={"Minimum Racers"} variant="filled"
                               disabled={!is_owner}
                               size="small" defaultValue={this.race["min_racers"]}/>

                    <TextField className={"menu-field"} name={"max_racers"} label={"Maximum Racers"} variant="filled"
                               disabled={!is_owner}
                               size="small" defaultValue={this.race["max_racers"]}/>
                    <TextField className={"menu-field"} name={"max_hp"} label={"Maximum HP"} variant="filled"
                               disabled={!is_owner}
                               size="small" defaultValue={this.race["max_hp"]}/>

                    <TextField className={"menu-field"} name={"password"} label={"Password"} variant="filled"
                               size="small" defaultValue={this.race["password"]}/>

                    <TextField className={"menu-field"} name={"min_req_karma"} label={"Minimum Karma Needed"}
                               disabled={!is_owner}
                               variant="filled"
                               size="small" defaultValue={this.race["min_req_karma"]}/>

                    <FormControl fullWidth>
                        <InputLabel id="select-heat-grade">Heat Grade</InputLabel>
                        <Select
                            labelId="heat-level-select"
                            id="heat-level-select"
                            name={"heat_grade"}
                            value={this.state.heat_level}
                            label="Heat Grade"
                            onChange={this.changeHeatLevel}
                            disabled={!is_owner}
                        >
                            <MenuItem value={"no_offence"}>No Traffic Offences Allowed</MenuItem>
                            <MenuItem value={'offences'}>Only Offences Allowed</MenuItem>
                            <MenuItem value={'only_traffic_lights'}>Respect only traffic lights</MenuItem>
                            <MenuItem value={"no-rules"}>No Rules</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="select-car">Car</InputLabel>
                        <Select
                            labelId="car-select"
                            id="car-select"
                            name={"car_id"}
                            value={this.state.car}
                            label="Car"
                            onChange={this.changeCar}
                        >
                            {car_items}
                        </Select>
                    </FormControl>


                    {/*TODO: ADD Chat link*/}

                    <div style={{display: "inline-flex", justifyContent: "left", alignItems: "flex-start"}}>
                        {is_owner ? owner_elems : null}
                        <Link style={{alignSelf: "center", marginLeft: "6px"}} variant="body2"
                              href={"https://www.google.com/maps/place/" + lat + "," + lng + "/@" + lat + "," + lng + "," + zoom + "z"}><span>Google
                            Maps<br/>Location</span></Link>
                    </div>

                    {/*TODO: Join race, State if already joined make it "Leave Race" */}
                    {is_owner ? <LoadingButton color={"anger"} loading={this.state.loadingEdit}
                                               onClick={function () {
                                                   callbackEditMode(_waypoints)
                                               }} fullWidth
                                               style={{marginTop: "6px"}}
                                               type={"button"}
                                               variant={"contained"}>Edit
                        Track</LoadingButton> : null}
                    <LoadingButton color={"anger"} loading={this.state.loadingJoin}
                                   onClick={() => this.changeLoadingJoin(true, this.state.race_op)}
                                   fullWidth style={{marginTop: "6px"}}
                                   type={"button"}
                                   variant={"contained"}>{this.state.race_op} Race</LoadingButton>


                </form>
            </div>
        </Container>);
    }
}

export default RaceContainer;