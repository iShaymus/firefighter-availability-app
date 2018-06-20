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
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.setState({ authUser});
      } 
    });
  }

  logoutCurrentUser() {
    this.setState({liveUpdate: false});
    auth.signOut().then(() => {
      this.setState({authUser: false});
    });
  }

  loginWithEmail(email, password) {
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        if (!auth.currentUser.displayName) {
          // No display name saved for user
          db.collection('firefighters').where('email', '==', email)
            .get()
            .then((snap) => {
              snap.forEach((doc) => {
                auth.currentUser.updateProfile({displayName: `${doc.data().firstName} ${doc.data().lastName}`}).then(() => {
                  this.forceUpdate();
                })
              })
            }).catch(() => {
              // User not found in firefighters collection
              this.logoutCurrentUser();
            })
        }
        this.setState({authUser: true, loginAlertVisible: false, loginAlertMessage: '', liveUpdate: true});
      })
      .catch(() => {
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
