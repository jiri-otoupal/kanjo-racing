import $ from "jquery";
import {access_token, api_port, pre_url} from "./config";

function formDataToJson(form) {
    let jsonObj = {};
    $.map(form.serializeArray(), function (n, i) {
        jsonObj[n.name] = n.value;
    });

    return jsonObj;
}

export const handleSubmit = (e, callback, custom_data = {}) => {
    e.preventDefault();
    const form = $(e.target);
    const form_data_json = formDataToJson(form);
    const data_concat = Object.assign({}, form_data_json, custom_data)
    //console.log("Data: ", data_concat, form_data_json);

    $.ajax({
        type: "POST",
        url: form.attr("action"),
        data: data_concat,
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log("Request Error", data);
        }
    });
};

export const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
export const getCookie = (cname) => {
    let cookies = ` ${document.cookie}`.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].split("=");
        if (cookie[0] === ` ${cname}`) {
            return cookie[1];
        }
    }
    return "";
}

export const callApi = (url, callback, custom_data = {}) => {
    $.ajax({
        type: "POST",
        url: pre_url  + window.location.hostname + api_port + url,
        data: Object.assign({session_id: getCookie("session_id")}, custom_data),
        success(data) {
            callback(data);
        },
    });
};

export const getInterpolatedPathRequestFromWaypoints = (__waypoints) => {
    let value = Object.values(__waypoints);
    let waypoint_pairs;
    if (__waypoints[0].lng != null && __waypoints[0].lat != null)
        waypoint_pairs = value.map(object => object.lng + "," + object.lat);
    else
        waypoint_pairs = value.map(object => object.longitude + "," + object.latitude);
    const waypoints = waypoint_pairs.join(";");
    return "https://api.mapbox.com/directions/v5/mapbox/driving/" + waypoints + "?steps=true&geometries=geojson&access_token=" + access_token;
}
