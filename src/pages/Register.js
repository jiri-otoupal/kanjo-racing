import {handleSubmit} from "../utils";
import {Email} from "@mui/icons-material";
import {Alert, TextField, ThemeProvider, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import darkTheme from "../themes/DarkTheme";
import {useState} from "react";
import LoadingButton from '@mui/lab/LoadingButton';

const Register = () => {

    const [loadingState, setLoading] = useState(false);

    const registration_form = <form
        action={"http://" + window.location.hostname + "/backend/register.php"}
        method="post"
        onSubmit={(event) => {
            handleSubmit(event, callback);
        }}>
        <div className="loginBox">
            <div className="form__group field">
                <ThemeProvider theme={darkTheme}>
                    <LoadingButton type={"submit"} loading={loadingState} color={"anger"} variant="contained"
                                   className={"form__group"}>Sign
                        Up</LoadingButton>
                    <TextField id="outlined-basic" color={"textwhitish"} label="Password" variant="outlined"
                               style={{marginBottom: "6px"}}
                               type={"password"} className={"form__group"}
                               name={"password"} required/>
                    <TextField id="outlined-basic" label="Email" variant="outlined" type={"email"}
                               color={"textwhitish"}
                               style={{marginBottom: "6px"}} className={"form__group"}
                               name={"email"} required/>
                    <TextField id="outlined-basic" label="Nickname" variant="outlined" type={"text"}
                               color={"textwhitish"}
                               style={{marginBottom: "6px"}} className={"form__group"}
                               name={"nickname"} required/>
                </ThemeProvider>
            </div>
        </div>
    </form>;

    const email_sent = (<div className="loginBox">
        <div style={{display: "flex", flexDirection: "column", alignSelf: "center"}}>
            <Email sx={{width: "30%", height: "30%", alignSelf: "center", marginBottom: "5%"}}/>
            <Typography variant="h6" style={{marginBottom: "15%"}}>
                Please verify your email
            </Typography>
            <Link className={"hakio-font sign-href"} to={"./"}>Sign In</Link>
        </div>
    </div>);

    const register_alert = (message) => {
        return (<Alert severity="error">{message}</Alert>)
    };

    const [alert, setAlert] = useState(false);
    const [form_state, setFormState] = useState(registration_form);

    function callback(obj) {
        if (obj["status"] === "OK") {
            setFormState(email_sent);
            setAlert(null);
        } else {
            setFormState(registration_form);
            setAlert(register_alert(obj["message"]));
        }
    }


    return (<header className="App-header App-bg2">
        <h1 className={"title dock-up"}>Kanjo Racing</h1>
        {alert}
        {form_state}
    </header>);


}


export default Register;