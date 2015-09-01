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

var SimpleAuthService = require('./SimpleAuthService');
var AppContainer  = require('./AppContainer');
var Login = require('./Login');

var GamePicker = React.createClass({
  componentDidMount:function(){
    SimpleAuthService.getAuthInfo((err,username, isAdmin)=>{
        this.setState({
          checkingAuth:false,
          isLoggedIn: username != null,
          username:username,
          isAdmin:isAdmin
      });
    })
  },
  render:function() {
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
    if(this.state.isLoggedIn){
      return (
        <AppContainer isAdmin = {this.state.isAdmin} username = {this.state.username} />
      );
    }
    else{
      return(
        <Login onLogin = {this.onLogin} />
      )
    }
  },
  onLogin:function(result){
    this.setState({isLoggedIn:true, isAdmin:result.isAdmin, username:result.username})
  },
  getInitialState:function(){
    return{
      isLoggedIn:false,
      checkingAuth: true,
    }
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
