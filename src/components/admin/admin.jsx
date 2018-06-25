import React, { Component } from 'react';
import ListUsers from './listUsers'

class Admin extends Component {
  render() {
    return (
      <div className="container">
        <ListUsers firefighters={this.props.firefighters}/>
      </div>
    );
  }
}

export default Admin;