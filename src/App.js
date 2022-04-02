import './App.css';


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1 className={"title dock-up"}>Kanjo Racing</h1>
                <div className="loginBox">
                    <div className="form__group field">
                        <button type="button" className="form__button">Log In</button>
                        <input type="password" className="form__field" placeholder="Password" name="password" id='password' required/>
                        <label htmlFor="password" className="form__label">Password</label>
                        <input type="input" className="form__field" placeholder="Name" name="name" id='name' required/>
                        <label htmlFor="name" className="form__label">Name</label>
                    </div>
                </div>
            </header>

        </div>
    );

}

export default App;
