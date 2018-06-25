import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Status from './status';
import Login from './login';
import Admin from './admin/admin';
import Home from './home';
import Members from './members';
import Contact from './contact';
import FireSafety from './firesafety';
import Navigation from './navigation';
import Photos from './gallery';
import { db, auth } from '../firebase';

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

class App extends Component {
  constructor(props) {
    super(props);
    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.logoutCurrentUser = this.logoutCurrentUser.bind(this);
    this.compareRank = this.compareRank.bind(this);
    this.getFullRank = this.getFullRank.bind(this);
    this.state = {
      authUser: false,
      loginAlertVisible: false,
      loginAlertMessage: "",
      firefighters: [],
      available: 0,
      onduty: 0,
      unavailable: 0,
      leave: 0,
    };
  }

  componentDidMount() {
    // Monitors the authentication state, if it changes the authUser state is chnaged
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.setState({ authUser});
      } 
    });
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
        if(this.getFullRank(doc.data().rank)) {data.fullRank = this.getFullRank(doc.data().rank)}
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
  }

  compareRank( left, right ){
    // Compares ranks from DB object to assist in sorting from highest to lowest rank.
    return ranks[left.rank] - ranks[right.rank]
  }

  logoutCurrentUser() {
    // liveUpdate false stops the Child Status.jsx from monitoring Firestore for
    // live data changes
    this.setState({liveUpdate: false});

    // Sign the user out and set authUser to a non truthy value.
    auth.signOut().then(() => {
      this.setState({authUser: false});
    });
  }

  loginWithEmail(email, password) {
    // Log the provided creds in with Firebase Auth email.
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        // Firebase Auth does not currently have the ability to create a display name for an
        // email user when created through the Firebase Console.  If the user does not have a 
        // display name then search for their email in the 'firefighters' collection and set the
        // display name to firstName + lastName.  Would cause problems if two users had the same email.
        // Requires an email field to be added to each firefighter with their intended email address for login
        if (!auth.currentUser.displayName) {
          // No display name saved for user
          db.collection('firefighters').where('email', '==', email)
            .get()
            .then((snap) => {
              snap.forEach((doc) => {
                auth.currentUser.updateProfile({displayName: `${doc.data().firstName} ${doc.data().lastName}`}).then(() => {
                  // Force component to refresh to displayed changed displayName
                  this.forceUpdate();
                })
              })
            }).catch(() => {
              // Somehow a user has created an account and logged in without us adding their email to the 
              // 'firefighters' DB collection.  This shouldn't happen so log them out!
              this.logoutCurrentUser();
            })
        }
        // All is well log then in, start live query to DB and hide any previous login errors
        this.setState({authUser: true, loginAlertVisible: false, loginAlertMessage: '', liveUpdate: true});
      })
      .catch(() => {
        // Username or password are incorrect, show bootstrap alert from Child Login.jsx
        this.setState({loginAlertVisible: true, loginAlertMessage: 'Invalid email or password'})
      })
    }
  
  getFullRank(rank) {
    switch(rank) {
      case 'CFO':
        return 'Chief Fire Officer';
      case 'DCFO':
        return 'Deputy Chief Fire Officer';
      case 'SSO':
        return 'Senior Station Officer';
      case 'SO':
        return 'Station Officer';
      case 'SFF':
        return 'Senior Firefighter';
      case 'QFF':
        return 'Qualified Firefighter';
      case 'FF':
        return 'Firefighter';
      case 'RFF':
        return 'Recruit Firefighter';
      case 'OS':
        return 'Operational Support';
      default:
        return null
    }
  }
  
  render() {
    return (
      <Router>
        <div className="App bg-secondary">
          <Navigation user={this.state.authUser} logout={this.logoutCurrentUser}/>
          <div className="text-center">
          <Route path='/' exact component={Home} />
          <Route path='/gallery' exact render={() => <Photos /> }/>
          <Route path='/members' exact render={() => <Members firefighters={this.state.firefighters} /> }/>
          <Route path='/firesafety' exact render={() => <FireSafety /> }/>
          <Route path='/contact' exact render={() => <Contact /> }/>
          <Route path='/status' exact render={() => this.state.authUser ? <Status firefighters={this.state.firefighters} av={this.state.available} od={this.state.onduty} un={this.state.unavailable} lv={this.state.leave}/> : <Redirect to='/auth'/>}/>
          <Route path='/admin' exact render={() => this.state.authUser ? <Admin firefighters={this.state.firefighters}/> : <Redirect to='/auth'/>}/>
          <Route path='/auth' exact render={() => this.state.authUser ? <Redirect to='/status'/> : <Login login={this.loginWithEmail} error={this.state.loginAlertVisible} errorMessage={this.state.loginAlertMessage} /> } />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
