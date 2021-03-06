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
  NavigatorIOS,
} = React;

var Weeks = require('./Weeks');

class AppContainer extends React.Component{
  
  render() {
    //show a navagtor component with the Weeks component inside
    //pass properties of the user as props.
    return (
      <NavigatorIOS style = {{ flex:1}}
        initialRoute = {{
          component:Weeks,
          title:"Weeks",
          passProps:{
             isAdmin:this.props.isAdmin,
             username:this.props.username,
             league:this.props.league
          },
          }}/>
       
    );
  }
};

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

module.exports = AppContainer