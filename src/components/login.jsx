import React from 'react';
import fenz from '../img/fenz-logo.png'

class Login extends React.Component {
  constructor() {
    super();
    this.submitLogin = this.submitLogin.bind(this);
  }

  submitLogin() {
    let username = document.getElementById('id_username').value;
    let password = document.getElementById('id_password').value;
    this.props.login(username, password);
  }
  
  render() {
    return (
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-12 col-sm-9 col-md-7 col-lg-5">
            <div className="card shadow mt-4">
              <div className="text-center" style={{backgroundColor: 'rgb(22, 16, 92)'}}>
                <img id="fenz-logo" src={fenz} alt=""/>
              </div>
              <LoginError message={this.props.errorMessage} visible={this.props.error}/>
              <div className="card-body">
                <label>Email</label>
                <input id="id_username" name="username" type="text" className="form-control" />
                <label className="pt-3">Password</label>
                <input id="id_password" name="password" type="password" className="form-control" />
                <br />
                <input onClick={this.submitLogin} type="submit" value="Login" className="btn btn-primary btn-block" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class LoginError extends React.Component {
  render() {
    if (this.props.visible){
      return (
        <div className="alert alert-danger m-2" role="alert">
          {this.props.message}
        </div>
      )
    } else {
      return (
        <div>
        </div>
      )
    }
  }
}

export default Login;