import './App.css';
import {HashRouter, Route, Switch, useHistory} from "react-router-dom";
import React from "react";

import Register from './pages/Register';
import Sign_in from './pages/Sign_in';
import Main from "./pages/Main";

function App() {
    useHistory();
    return (
        <div className="App">
            <HashRouter>
                <Switch> {}
                    <Route exact path='/' component={Sign_in}/>
                    <Route exact path='/register' component={Register}/>
                    <Route exact path='/main' component={Main}/>
                </Switch>
            </HashRouter>
        </div>

    );

}

export default App;
