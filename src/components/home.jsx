import React, { Component } from 'react';
import station from '../img/fire-crop.jpg'

class Home extends Component {
  render() {
    return (
      <div>
        <img id="home-splash" src={station} alt=""/>
      </div>
    );
  }
}

export default Home;