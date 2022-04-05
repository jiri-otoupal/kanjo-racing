import $ from "jquery";

export const handleSubmit = (e, callback) => {
    e.preventDefault();
    const form = $(e.target);
    $.ajax({
        type: "POST",
        url: form.attr("action"),
        data: form.serialize(),
        success(data) {
            callback(data);
        },
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

export const callApiGet = (url, callback) => {
    $.ajax({
        type: "GET",
        url: url + "?session_id=" + getCookie("session_id"),
        success(data) {
            callback(data);
        },
    });
};

