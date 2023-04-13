import {Link, useHistory} from "react-router-dom";
import {Alert, TextField, ThemeProvider} from "@mui/material";
import darkTheme from "../themes/DarkTheme";
import {handleSubmit, setCookie} from "../utils";
import LoadingButton from "@mui/lab/LoadingButton";
import {useState} from "react";
import {pre_url} from "../config";
import React from 'react';

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
        <div className={".text_group"}
             style={{width: "50%", background: "#33333399", borderRadius: "6px", marginBottom: "60px"}}>
            <h3 style={{fontSize: 24}}>Welcome to KanjoRacing, the best place for street racing enthusiasts! </h3>
            <p style={{fontSize: 16}}>We're here to ignite your passion for high-octane, adrenaline-pumping action on asphalt. 
            Immerse yourself in the exciting world of street racing and explore the latest trends, hottest vehicles and most thrilling races from around the world.
             Join our community of racers who are pushing the boundaries of automotive performance. Buckle up, hold on tight and put the pedal to the metal with KanjoRacing!</p>
            <p style={{fontSize: 14}}>
                <h5 style={{fontSize: 20}}>It's my first time here.</h5>
                <h5 style={{fontSize: 16}}>1. Sign up</h5>
                Enter your nickname, email and password. Register and log in.
                <h5 style={{fontSize: 16}}>2. Add your car</h5>
               Under the garage tab you can add your car or motorbike. You can enter a nickname, type, brand and performance of the vehicle. You can then easily find challengers in a similar group.
                <h5 style={{fontSize: 16}}>3. Let's race</h5>
                Now it's time to get the wheels turning. You can find races in your area or create your own race. You get karma (points) for each win.
            </p>
        </div>
    </header>);
}


export default Sign_in;
