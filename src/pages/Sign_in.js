import {Link, useHistory} from "react-router-dom";
import {Alert, TextField, ThemeProvider} from "@mui/material";
import darkTheme from "../themes/DarkTheme";
import {handleSubmit} from "../utils";
import LoadingButton from "@mui/lab/LoadingButton";
import {useState} from "react";
import Register from "./Register";



const Sign_in = () => {
    let history = useHistory();

    const [loadingState, setLoading] = useState(false);

    const login_form = <form
        action="http://localhost:80/backend/login.php"
        method="post"
        onSubmit={(event) => {
            handleSubmit(event, callback);
        }}>
        <div className="loginBox">
            <div className="form__group field">
                <Link to={"./Register"} className={"register-href form__label"} >Register</Link>
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


    const register_alert = (message) => {
        return (<Alert severity="error">{message}</Alert>)
    };

    const [alert, setAlert] = useState(false);
    const [form_state, setFormState] = useState(login_form);

    function callback(obj) {
        console.log(obj);
        if (obj["status"] === "OK") {
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