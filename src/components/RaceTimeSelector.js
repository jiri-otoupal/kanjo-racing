import React from "react";
import {DateTimePicker, LocalizationProvider} from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import {TextField} from "@mui/material";

export class RaceTimeSelector extends React.Component {
    constructor(props) {
        super();
        const race_data = props["r"];
        this.owner = props["owner"];
        this.state = {
            raceTime: race_data["start_time"]
        };
    }

    componentDidMount() {
        this.changeDate = this.changeDate.bind(this);
    }

    changeDate(date) {
        this.setState({
            raceTime: date
        });
    }

    render() {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                    value={this.state.raceTime}
                    onChange={this.changeDate}
                    disabled={!this.owner}
                    disablePast
                    renderInput={(params) => <TextField {...params} className={"menu-field"}
                                                        name={"start_time"} label={"Start Time"}
                                                        variant="filled" required
                                                        size="small"/>}
                />
            </LocalizationProvider>
        );
    }
}