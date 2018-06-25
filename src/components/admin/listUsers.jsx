import React, { Component } from 'react';

class ListUsers extends Component {  
  render() {
    return (
      <div className="container">
        <ul className="list-group w-25 text-align-left">
          {this.props.firefighters.map((firefighter) => {
            return (
              <li className="list-group-item d-flex">
                {firefighter.rank} {firefighter.firstName} {firefighter.lastName} <i onClick={() => {alert('test')}} className="fas fa-trash-alt ml-auto" style={{color: 'crimson'}}></i>
              </li>
            )
          })}
        </ul>
      </div>
    );
  }
}

export default ListUsers;