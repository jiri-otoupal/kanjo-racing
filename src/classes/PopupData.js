import {Button} from "@mui/material";
import React from "react";

class PopupData {
    constructor(lng, lat, click_func) {
        this.lng = lng;
        this.lat = lat;
        this.component = (<Button variant="contained" onClick={click_func}>Delete</Button>);
    }

}

export default PopupData;