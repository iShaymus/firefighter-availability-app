import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './style.css';
import logo from '../img/fire.svg'


class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <nav className="navbar navbar-expand-md navbar-dark bg-dark">
        <div className="container-fluid">
          <div className="mx-auto order-0">
            <img id="logo" src={logo} alt=""/>
            <Link id="site-title" className="navbar-brand mx-auto" to='/'>Milton Fire Brigade</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target=".dual-collapse2">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          <div className="navbar-collapse collapse dual-collapse2">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <NavLink to='/gallery' activeStyle={{color: 'red'}} className="nav-link">Photos</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to='/members' activeStyle={{color: 'red'}} className="nav-link">Members</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to='/firesafety' activeStyle={{color: 'red'}} className="nav-link">Smoke Alarms</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to='/contact' activeStyle={{color: 'red'}} className="nav-link">Contact</NavLink>
              </li>
                {this.props.user ?
                <li className="nav-item dropdown active">
                  <a className="nav-link dropdown-toggle" href="#!" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i className="fas fa-user"></i> {this.props.user.displayName}
                  </a>
                  <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <Link to='/status' className="dropdown-item">Status Board</Link>
                    <Link to='/admin' className="dropdown-item">Administration</Link>
                    <div className="dropdown-divider"></div>
                    <Link to="/" onClick={this.props.logout} className="dropdown-item">Logout</Link>
                  </div>
                </li>
              : 
                <li className="nav-item">
                  <NavLink to='/auth' activeStyle={{fontWeight: 'bold', color: 'red'}} className="nav-link">Log In <i className="fas fa-user"></i></NavLink>
                </li>
              }
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navigation;