/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS
} = React;

//Bring in Authentication module and next screen modules
var SimpleAuthService = require('./SimpleAuthService');
var AppContainer  = require('./AppContainer');
var Login = require('./Login');

var GamePicker = React.createClass({
  //constructor essentially
  getInitialState:function(){
    return{
      isLoggedIn:false,
      checkingAuth: true,
    }
  },
  componentDidMount:function(){
    //check if the user has logged in before and auth info is already saved
    SimpleAuthService.getAuthInfo((err,username, isAdmin, leagueName)=>{
      //set state with info recievied, if username is not null then user is logged in. 
        this.setState({
          checkingAuth:false,
          isLoggedIn:username != null,
          username:username,
          isAdmin:isAdmin,
          league:leagueName
      });
    })
  },
  render:function() {
    //show a spinner while checking to see if logged in already.
    if(this.state.checkingAuth){
      return(
        <View style = {styles.container}>
          <ActivityIndicatorIOS
            size = 'large'
            animating = {true}
            />
        </View>
      )
    }
    //if logged in, go right to main app screen
    if(this.state.isLoggedIn){
      return (
        <AppContainer isAdmin = {this.state.isAdmin} username = {this.state.username} league = {this.state.league}/>
      );
    }
    //in not logged in, go to the login screen. Pass the onLogin function as a prop to set the state after being logged in.
    else{
      return(
        <Login onLogin = {this.onLogin} />
      )
    }
  },
  //set the state object when logged in.
  onLogin:function(result){
    this.setState({isLoggedIn:true, isAdmin:result.isAdmin, username:result.username, league: result.league})
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('GamePicker', () => GamePicker);
