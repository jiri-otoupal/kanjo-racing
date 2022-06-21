import {Link, useHistory} from "react-router-dom";
import {Alert, TextField, ThemeProvider} from "@mui/material";
import darkTheme from "../themes/DarkTheme";
import {handleSubmit, setCookie} from "../utils";
import LoadingButton from "@mui/lab/LoadingButton";
import {useState} from "react";
import {pre_url} from "../config";
import React from 'react';
import FacebookLogin from 'react-facebook-login';

const responseFacebook = (response) => {
    document.getElementById("nickname").value = response["name"];
    document.getElementById("password").value = "no pwd";
    document.getElementById("access_token").value = response["accessToken"];
    document.getElementById("email").value = response["email"];
    document.getElementById("sign").click();
}


const Sign_in = () => {
    const [alerted, setAlerted] = useState(false);
    const [alert, setAlert] = useState(false);

    const [loadingState, setLoading] = useState(false);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);


    let history = useHistory();
    const port = window.location.hostname.includes("localhost") ? ":9000" : "";

    const login_form = <form id="login-form"
                             action={pre_url + window.location.hostname + port + "/backend/login.php"}
                             method="post"
                             onSubmit={(event) => {
                                 handleSubmit(event, callback);
                             }}>
        <div className="loginBox">
            <div className="form__group field">

                <Link to={"./Register"} className={"register-href form__label"}>Register</Link>
                <ThemeProvider theme={darkTheme}>
                    <FacebookLogin
                        appId="1172903216896033"
                        autoLoad={false}
                        fields="name,email"
                        onClick={null}
                        callback={responseFacebook}
                        cssClass="my-facebook-button-class"
                    />
                    <LoadingButton id="sign" type={"submit"} loading={loadingState} color={"anger"} variant="contained"
                                   className={"form__group"}>Sign
                        In</LoadingButton>
                    <TextField id="password" color={"textwhitish"} label="Password" variant="outlined"
                               style={{marginBottom: "6px"}}
                               type={"password"} className={"form__group"}
                               name={"password"} required/>
                    <TextField id="email" label="Email" variant="outlined" type={"email"}
                               color={"textwhitish"}
                               style={{marginBottom: "6px"}} className={"form__group"}
                               name={"email"} required/>
                    <input name="nickname" type={"text"} value={""} hidden id="nickname"/>
                    <input name="access_token" type={"text"} value={""} hidden id="access_token"/>
                </ThemeProvider>

            </div>
        </div>
    </form>;

    const [form_state, setFormState] = useState(login_form);


    const register_alert = (message) => {
        return (<Alert severity="error">{message}</Alert>)
    };

    if (urlParams.has("unauthorized") && !alerted) {
        setAlert(register_alert("Please login first"))
        setAlerted(true);
        window.history.pushState("", "", '/');
    }

    function callback(obj) {
        if (obj["status"] === "OK") {
            setCookie("session_id", obj["cookie"], 30);
            setCookie("user_id", obj["user_id"], 30);
            setAlert(null);
            history.push("/main");
        } else {
            setFormState(login_form);
            setAlert(register_alert(obj["message"]));
        }
    }


    return (<header className="App-header App-bg">
        <h1 className={"title dock-up"}>Kanjo Racing</h1>
        {alert}
        {form_state}
    </header>);
}


export default Sign_in;