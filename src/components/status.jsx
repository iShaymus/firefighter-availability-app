import React, { Component } from 'react';
import {db} from '../firebase';
import Modal from 'react-bootstrap4-modal';

class Status extends Component {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      selectedFirefighter: {}
    }
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.setStatus = this.setStatus.bind(this);
  };

  showModal(e) {
    // Gets the ID from the id= html tag of the clicked table row or other DOM element.  
    // Searches for the ID in the firefighters array that contains all firefighters from the initial
    // DB pull.  Takes the object from the found firefighter at sets it's object at the selectedFirefighter state.
    // Then displays a bootstrap modal by changing modalVisible to true.  Modal is then used to change current status.
    this.setState({selectedFirefighter: this.props.firefighters.find(x => x.id === e.currentTarget.id)});
    this.setState({modalVisible: true});
  }

  hideModal() {
    // Hides the bootstrap modal by changing the modalVisible state
    // sets the selectedFirefighter object back to empty.
    this.setState({modalVisible: false, selectedFirefighter:{} });
  }

  setStatus(status) {
    // ID is obtained when a table row is clicked.  Document for the specified ID
    // is found from Firestore and updated with the status from the status argument
    db.collection("firefighters").doc(this.state.selectedFirefighter.id).set({
      status: status
    }, { merge:true })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
    this.setState({modalVisible: false});
  };
  
  render() {
    return (
      <div className="container-fluid bg-white content-container">
        <div className="row">
          <div className="col-lg">
            <h3 className="text-center pt-3">Available - {this.props.av + this.props.od}</h3>
            <hr />
            <table className="table table-striped table-hover ">
              <thead className="thead-dark">
                <tr>
                  <th scope="col" className="text-center">Rank</th>
                  <th scope="col">Name</th>
                  <th scope="col" className="text-center">Driver</th>
                </tr>
              </thead>
              <tbody className="table-striped">
                {this.props.firefighters.map( (firefighter) => {
                  if(firefighter.status === 'On Duty') {
                    return (
                      <tr className="table-success" key={firefighter.id} id={firefighter.id} onClick={ (e) => {this.showModal(e)}}>
                        <th className="text-center">{firefighter.rank}</th>
                        <td>{firefighter.firstName} {firefighter.lastName}</td>
                        <td className="text-center">{firefighter.isDriver ? <i className="fas fa-truck"></i> : ''}</td>
                      </tr>
                    )
                  };
                  return null;
                })
                }
                {this.props.firefighters.map( (firefighter) => {
                  if(firefighter.status === 'Available') {
                    return (
                      <tr key={firefighter.id} id={firefighter.id} onClick={ (e) => {this.showModal(e)}}>
                        <th className="text-center">{firefighter.rank}</th>
                        <td>{firefighter.firstName} {firefighter.lastName}</td>
                        <td className="text-center">{firefighter.isDriver ? <i className="fas fa-truck"></i> : ''}</td>
                      </tr>
                    )
                  }
                  return null;
                })
                }
              </tbody>
            </table>
          </div>
          <br />
          <div className="col-lg">
            <h3 className="text-center pt-3">Unavailable - {this.props.un}</h3>
            <hr />
            <table className="table table-striped table-hover ">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col" className="text-center">Rank</th>
                    <th scope="col">Name</th>
                    <th scope="col" className="text-center">Driver</th>
                  </tr>
                </thead>
                <tbody className="table-striped">
                  {this.props.firefighters.map( (firefighter) => {
                    if(firefighter.status === 'Unavailable') {
                      return (
                        <tr key={firefighter.id} id={firefighter.id} onClick={ (e) => {this.showModal(e)}}>
                          <th className="text-center">{firefighter.rank}</th>
                          <td>{firefighter.firstName} {firefighter.lastName}</td>
                          <td className="text-center">{firefighter.isDriver ? <i className="fas fa-truck"></i> : ''}</td>
                        </tr>
                      )
                    }
                    return null;
                  })
                  }
                </tbody>
            </table>
          </div>
          <br />
          <div className="col-lg">
            <h3 className="text-center pt-3">Leave - {this.props.lv}</h3>
            <hr />
            <table className="table table-striped table-hover ">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col" className="text-center">Rank</th>
                    <th scope="col">Name</th>
                    <th scope="col" className="text-center">Driver</th>
                  </tr>
                </thead>
                <tbody className="table-striped">
                  {this.props.firefighters.map( (firefighter) => {
                    if(firefighter.status === 'Leave') {
                      return (
                        <tr key={firefighter.id} id={firefighter.id} onClick={ (e) => {this.showModal(e)}}>
                          <th className="text-center">{firefighter.rank}</th>
                          <td>{firefighter.firstName} {firefighter.lastName}</td>
                          <td className="text-center">{firefighter.isDriver ? <i className="fas fa-truck"></i> : ''}</td>
                        </tr>
                      )
                    }
                    return null;
                  })
                  }
                </tbody>
            </table>
          </div>
        </div>
        
        <div className="static-modal">
          <Modal visible={this.state.modalVisible} onClickBackdrop={this.hideModal}>
            <div className="modal-header bg-dark">
              <h3 className="modal-title text-light" id="modelTitleId">Change Status</h3>
              <button type="button" className="close text-light" onClick={this.hideModal} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body pb-0">
              <p className="text-center">Update status for:</p>
              <h3 className="text-center" id='person-name'>{this.state.selectedFirefighter.firstName} {this.state.selectedFirefighter.lastName}</h3>
            </div>
            <div className="modal-body pt-0">
              <hr />
              <button className="btn btn-primary btn-block" onClick={() => this.setStatus('Available')}>Available</button>
              <button className="btn btn-success btn-block" onClick={() => this.setStatus('On Duty')}>On Duty</button>
              <button className="btn btn-warning btn-block" onClick={() => this.setStatus('Unavailable')}>Unavailable</button>
              <button className="btn btn-danger btn-block" onClick={() => this.setStatus('Leave')}>Leave</button>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

export default Status;