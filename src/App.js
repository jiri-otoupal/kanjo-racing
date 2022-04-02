import './App.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import React from "react";

import Register from './pages/Register';
import Signup from './pages/Signup';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Switch> {/* The Switch decides which component to show based on the current URL.*/}
                    <Route exact path='/' component={Signup}/>
                    <Route exact path='/register' component={Register}/>
                </Switch>
            </BrowserRouter>
        </div>

    );

}

export default App;
