import React from "react";
import {DataGrid} from "@mui/x-data-grid";
import gps2m from "../location/GpsOperation";

class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.getRaceDistance = this.getRaceDistance.bind(this);

        this.getRaceDistance();
    }

    getRaceDistance() {
        if (this.props.waypoints) {
            const last_index = this.props.waypoints.length - 1;

            const start_lat = this.props.waypoints[0].latitude;
            const start_lng = this.props.waypoints[0].longitude;

            this.end_lat = this.props.waypoints[last_index].latitude;
            this.end_lng = this.props.waypoints[last_index].longitude;

            this.race_distance = gps2m(start_lat, start_lng, this.end_lat, this.end_lng);
        }
    }

    render() {


        if (this.props.racers == null || this.props.waypoints == null) {
            console.log("No racers to display");
            return;
        }
        this.getRaceDistance();

        const columns = [
            {field: 'position', headerName: 'Pos', width: 10},
            {
                field: 'name',
                headerName: 'Racer',
                editable: false,
                width: 22
            },
            {
                field: 'percent',
                headerName: '%',
                editable: false,
                width: 15
            },
            {
                field: 'lap',
                headerName: 'Lap',
                editable: false,
                width: 10
            },
        ];


        let rows = [];

        for (let i = 0; i < this.props.racers.length; i++) {
            const start_lat = this.props.racers[i]["latitude"];
            const start_lng = this.props.racers[i]["longitude"];

            const user_distance = gps2m(start_lat, start_lng, this.end_lat, this.end_lng);

            console.log("Distance", user_distance, this.race_distance);
            const percent = Math.round((user_distance / this.race_distance) * 100);
            const race_step = this.props.racers[i]["step"];
            rows.unshift({
                name: this.props.racers[i]["name"],
                percent: (percent > 100 ? 0 : race_step === this.props.waypoints.length ? 100 : percent),
                lap: this.props.racers[i]["lap"]
            });
        }

        for (let i = 0; i < this.props.racers.length; i++) {
            rows[i]["id"] = i + 1;
            rows[i]["position"] = i + 1;
        }
        console.log("Rows", rows);


        return <DataGrid
            style={{
                position: "absolute",
                left: "6px",
                top: "6px",
                width: "230px",
                overflowX: "hidden",
                backgroundColor: "rgb(0,0,0,0.75)"
            }}
            autoHeight pageSize={5} hideFooter rows={rows} columns={columns} density={"compact"} disableColumnMenu
            disableSelectionOnClick/>;
    }
}

export default Leaderboard;