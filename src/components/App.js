import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Status from './status';
import Login from './login';
import Admin from './admin';
import Home from './home';
import Navigation from './navigation';
import { db, auth } from '../firebase';

class App extends Component {
  constructor(props) {
    super(props);
    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.logoutCurrentUser = this.logoutCurrentUser.bind(this);
    this.state = {
      authUser: false,
      loginAlertVisible: false,
      loginAlertMessage: "",
      liveUpdate: true
    };
  }

  componentDidMount() {
    // Monitors the authentication state, if it changes the authUser state is chnaged
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.setState({ authUser});
      } 
    });
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
  
  render() {
    return (
      <Router>
        <div className="App">
          <Navigation user={this.state.authUser} logout={this.logoutCurrentUser}/>
          <div className="text-center">
          <Route path='/' exact component={Home} />
          <Route path='/gallery' exact render={() => { return (<h1>Brigade Photos</h1>)}}/>
          <Route path='/members' exact render={() => { return (<h1>Members</h1>)}}/>
          <Route path='/firesafety' exact render={() => { return (<h1>Smoke Alarms</h1>)}}/>
          <Route path='/contact' exact render={() => { return (<h1>Contact</h1>)}}/>
          <Route path='/status' exact render={() => this.state.authUser ? <Status user={this.state.authUser} live={this.state.liveUpdate}/> : <Redirect to='/auth'/>}/>
          <Route path='/admin' exact render={() => this.state.authUser ? <Admin/> : <Redirect to='/auth'/>}/>
          <Route path='/auth' exact render={() => this.state.authUser ? <Redirect to='/status'/> : <Login login={this.loginWithEmail} error={this.state.loginAlertVisible} errorMessage={this.state.loginAlertMessage} /> } />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
