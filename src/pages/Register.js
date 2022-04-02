const Register = () => {
    return (<header className="App-header App-bg2">
        <h1 className={"title dock-up"}>Kanjo Racing</h1>
        <div className="loginBox">
            <div className="form__group field">
                <button type="button" className="form__button">Register</button>
                <input type="text" className="form__field" placeholder="Invite code" name="inv-code" id='inv-code'
                       required/>
                <label htmlFor="password" className="form__label">Invite code</label>
                <input type="password" className="form__field" placeholder="Password" name="password" id='password'
                       required/>
                <label htmlFor="password" className="form__label">Password</label>
                <input type="input" className="form__field" placeholder="Name" name="name" id='name' required/>
                <label htmlFor="name" className="form__label">Name</label>
            </div>
        </div>
    </header>);
}


export default Register;