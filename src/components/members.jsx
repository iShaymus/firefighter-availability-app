import React, { Component } from 'react';
import Moment from 'react-moment';
import img from '../img/overalls.jpg'

class Members extends Component {
  render() {
    return (
      <div className="container bg-light content-container">
        <div className="row py-3" id="accordion">
          <div className="col-lg">
            <img className="w-100 img-thumbnail" src={img} alt=""/>
            <h4 className="text-center py-3">Current Brigade Members</h4>
          </div>
          <div className="col-lg">
            {this.props.firefighters.map((firefighter) => {
              if (firefighter.status) {
              return (
                <div className="list-group-item p-2 member" data-toggle="collapse" data-target={"#collapse" + firefighter.id} aria-expanded="true" aria-controls={"collapse" + firefighter.id}>
                  <div id={"heading" + firefighter.id}>
                    <h5 className="mb-0 text-left d-flex">
                      {firefighter.rank} {firefighter.firstName.charAt(0)} {firefighter.lastName} <span className="click-info ml-auto">More info <i className="fas fa-info"></i></span>
                    </h5>
                  </div>

                  <div id={"collapse" + firefighter.id} className="collapse border border-danger rounded p-2 mt-3" aria-labelledby={"heading" + firefighter.id} data-parent="#accordion">
                    <div>
                      <p className="m-0 text-left">
                        <strong>{firefighter.firstName} {firefighter.lastName} -</strong> {firefighter.fullRank}
                        <br/>
                        <br/>
                        {firefighter.startDate ? 
                          <p className="m-0">
                            {firefighter.firstName} has been a volunteer firefighter for <Moment fromNow ago>{firefighter.startDate}</Moment>. {firefighter.bio ? firefighter.bio : null}
                          </p>
                        :
                          null
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Members;