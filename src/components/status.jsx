import React, { Component } from 'react';
import {db} from '../firebase';
import Modal from 'react-bootstrap4-modal';

// Used for sorting DB queries by firefighter rank
const ranks = {
  CFO: 1,
  DCFO: 2,
  SSO: 3,
  SO: 4,
  SFF: 5,
  QFF: 6,
  FF: 7,
  RFF: 8,
  OS: 9
}

class Status extends Component {
  constructor() {
    super();
    this.state = {
      firefighters: [],
      available: 0,
      onduty: 0,
      unavailable: 0,
      leave: 0,
      modalVisible: false,
      selectedFirefighter: {}
    }
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.compareRank = this.compareRank.bind(this);
  };

  componentDidMount() {
    // live is set to false when the user logs out to stop the DB snapshot
    // from continuing to try and execute which results in Firebase errors due to 
    // there being no current authenticated user.
    if (this.props.live) {

      // Continuously monitors the firefighters collection on Firebase Firestore
      // If any attribute changes for any firefighter then the DB updates the 
      // firefighters state with a new copy of data from the Firestore DB.
      db.collection('firefighters').onSnapshot( (snap) => {
        let temp = [];
        let av = 0;
        let od = 0;
        let un = 0;
        let lv = 0;
        snap.forEach( (doc) => {
          let data = doc.data();
          data.id = doc.id;
          temp.push(data);

          // Counts the number of each status of firefigter
          switch(doc.data().status) {
            case 'Available':
              av++;
              break;
            case 'On Duty':
              od++;
              break;
            case 'Unavailable':
              un++;
              break;
            case 'Leave':
              lv++;
              break;
            default:
              break;
          }
        });

        // Sorts the DB query by Ranks specified in the ranks const
        let sortedFirefighters = temp.sort(this.compareRank);

        this.setState({
          firefighters: sortedFirefighters,
          available: av,
          onduty: od,
          unavailable: un,
          leave: lv
        })
      }, function(error) {
        console.log('Stopped listening for live status updates.  User has logged out.');
      });
    } else {
      // If user has logged out stop monitoring Firestore for data changes.
      db.collection('firefighters').onSnapshot(() => {});
    }
  }

  compareRank( left, right ){
    // Compares ranks from DB object to assist in sorting from highest to lowest rank.
    return ranks[left.rank] - ranks[right.rank]
  }

  showModal(e) {
    // Gets the ID from the id= html tag of the clicked table row or other DOM element.  
    // Searches for the ID in the firefighters array that contains all firefighters from the initial
    // DB pull.  Takes the object from the found firefighter at sets it's object at the selectedFirefighter state.
    // Then displays a bootstrap modal by changing modalVisible to true.  Modal is then used to change current status.
    this.setState({selectedFirefighter: this.state.firefighters.find(x => x.id === e.currentTarget.id)});
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
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg">
            <h3 className="text-center pt-3">Available - {this.state.available + this.state.onduty}</h3>
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
                {this.state.firefighters.map( (firefighter) => {
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
                {this.state.firefighters.map( (firefighter) => {
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
            <h3 className="text-center pt-3">Unavailable - {this.state.unavailable}</h3>
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
                  {this.state.firefighters.map( (firefighter) => {
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
            <h3 className="text-center pt-3">Leave - {this.state.leave}</h3>
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
                  {this.state.firefighters.map( (firefighter) => {
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