import {Link, useHistory} from "react-router-dom";
import {Alert, TextField, ThemeProvider} from "@mui/material";
import darkTheme from "../themes/DarkTheme";
import {handleSubmit, setCookie} from "../utils";
import LoadingButton from "@mui/lab/LoadingButton";
import {useState} from "react";


const Sign_in = () => {
    const [ alerted,setAlerted] = useState(false);
    const [alert, setAlert] = useState(false);

    const [loadingState, setLoading] = useState(false);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);


    let history = useHistory();


    const login_form = <form
        action="http://localhost:80/backend/login.php"
        method="post"
        onSubmit={(event) => {
            handleSubmit(event, callback);
        }}>
        <div className="loginBox">
            <div className="form__group field">
                <Link to={"./Register"} className={"register-href form__label"}>Register</Link>
                <ThemeProvider theme={darkTheme}>
                    <LoadingButton type={"submit"} loading={loadingState} color={"anger"} variant="contained"
                                   className={"form__group"}>Sign
                        In</LoadingButton>
                    <TextField id="outlined-basic" color={"textwhitish"} label="Password" variant="outlined"
                               style={{marginBottom: "6px"}}
                               type={"password"} className={"form__group"}
                               name={"password"} required/>
                    <TextField id="outlined-basic" label="Email" variant="outlined" type={"email"}
                               color={"textwhitish"}
                               style={{marginBottom: "6px"}} className={"form__group"}
                               name={"email"} required/>
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
            setAlert(null);
            history.push("/main");
        } else {
            setFormState(login_form);
            setAlert(register_alert(obj["message"]));
        }
    }


    return (<header className="App-header App-bg2">
        <h1 className={"title dock-up"}>Kanjo Racing</h1>
        {alert}
        {form_state}
    </header>);
}


export default Sign_in;