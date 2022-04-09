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
            updateRaceOnChangeCallback = props["u"], deleteRace = props["d"], waypoints = props["w"],
            callbackEditMode = props["c"];

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
        this.waypoints = waypoints;
        this.state = {
            heat_level: "no_offence",
            loadingSave: false,
            loadingEdit: false,
            loadingJoin: false
        };
        this.changeHeatLevel = this.changeHeatLevel.bind(this);
        this.changeLoadingSave = this.changeLoadingSave.bind(this);
    }

    changeLoadingSave(state) {
        this.setState({
            loadingSave: state
        });
    }


    //TODO:Implement Loading and Join
    changeLoadingEdit(state) {
        const callbackEditMode = this.callbackEditMode;

        this.setState({
            loadingEdit: state
        });
        //TODO: Implement backend
        callApi("http://localhost:80/backend/waypoint.php",callbackEditMode);
    }

    changeLoadingJoin(state) {
        this.setState({
            loadingJoin: state
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

    render() {
        const zoom = 14;
        const lat = this.race["latitude"];
        const lng = this.race["longitude"];
        const updateRaceOnChangeCallback = this.updateRaceOnChangeCallback;
        const handleSaveRace = this.handleSaveRace;
        const id = this.race["race_id"];
        const deleteRace = this.delete_race;
        const timeSelector = React.createElement(RaceTimeSelector, this.race);
        const styles = Object.assign({}, paperStyle, this.margin, {backgroundImage: this.vehicle_img});
        const changeLoading = this.changeLoadingSave;
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


        return (<Container key={"container" + this.race["race_id"]} maxWidth={"sm"}
                           style={styles}>
            <div key={"race_div" + this.race["race_id"]} style={{marginTop: "12px", marginBottom: "12px"}}>
                <form action="http://localhost:80/backend/race.php"
                      method="post"
                      onSubmit={(event) => {
                          handleSaveRace(event, function (data) {
                              updateRaceOnChangeCallback(data);
                              changeLoading(false);
                          });
                      }}>

                    <input name={"latitude"} type={"text"} hidden
                           value={this.waypoints.length ? this.waypoints[0].lat : 30}/>
                    <input name={"longitude"} type={"text"} hidden
                           value={this.waypoints.length ? this.waypoints[0].lng : 30}/>
                    <input name={"chat_link"} type={"text"} hidden value={""}/>
                    <input name={"race_id"} type={"text"} hidden value={this.race["race_id"]}/>
                    <input name={"session_id"} type={"text"} hidden value={getCookie("session_id")}/>
                    <TextField className={"menu-field"} name={"name"} label={"Nickname"} required variant="filled"
                               size="small" defaultValue={this.race["name"]}/>

                    {timeSelector}


                    <TextField className={"menu-field"} name={"laps"} label={"Laps"} variant="filled"
                               size="small" defaultValue={this.race["laps"]}/>
                    <TextField className={"menu-field"} name={"min_racers"} label={"Minimum Racers"} variant="filled"
                               size="small" defaultValue={this.race["min_racers"]}/>

                    <TextField className={"menu-field"} name={"max_racers"} label={"Maximum Racers"} variant="filled"
                               size="small" defaultValue={this.race["max_racers"]}/>
                    <TextField className={"menu-field"} name={"max_hp"} label={"Maximum HP"} variant="filled"
                               size="small" defaultValue={this.race["max_hp"]}/>

                    <TextField className={"menu-field"} name={"password"} label={"Password"} variant="filled"
                               size="small" defaultValue={this.race["password"]}/>

                    <TextField className={"menu-field"} name={"min_req_karma"} label={"Minimum Karma Needed"}
                               variant="filled"
                               size="small" defaultValue={this.race["min_req_karma"]}/>

                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Heat Grade</InputLabel>
                        <Select
                            labelId="heat-level-select"
                            id="heat-level-select"
                            name={"heat_grade"}
                            value={this.state.heat_level}
                            label="Heat Grade"
                            onChange={this.changeHeatLevel}
                        >
                            <MenuItem value={"no_offence"}>No Traffic Offences Allowed</MenuItem>
                            <MenuItem value={'offences'}>Only Offences Allowed</MenuItem>
                            <MenuItem value={'only_traffic_lights'}>Respect only traffic lights</MenuItem>
                            <MenuItem value={"no-rules"}>No Rules</MenuItem>
                        </Select>
                    </FormControl>


                    {/*TODO: ADD Chat link*/}

                    <div style={{display: "inline-flex", justifyContent: "left", alignItems: "flex-start"}}>
                        {this.race["owner_id"] === getCookie("user_id") ? owner_elems : null}
                        <Link style={{alignSelf: "center", marginLeft: "6px"}} variant="body2"
                              href={"https://www.google.com/maps/place/" + lat + "," + lng + "/@" + lat + "," + lng + "," + zoom + "z"}><span>Google
                            Maps<br/>Location</span></Link>
                    </div>

                    {/*TODO: Join race, State if already joined make it "Leave Race" */}
                    <LoadingButton color={"anger"} loading={this.state.loadingEdit}
                                   onClick={this.changeLoadingEdit.bind(true)} fullWidth style={{marginTop: "6px"}}
                                   type={"button"}
                                   variant={"contained"}>Select
                        Track</LoadingButton>
                    <LoadingButton color={"anger"} loading={this.state.loadingJoin}
                                   onClick={this.changeLoadingJoin.bind(true)} fullWidth style={{marginTop: "6px"}}
                                   type={"button"} variant={"contained"}>Join
                        Race</LoadingButton>


                </form>
            </div>
        </Container>);
    }
}

export default RaceContainer;