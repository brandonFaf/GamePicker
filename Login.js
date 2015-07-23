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
  TouchableHighlight,
  ActivityIndicatorIOS,
  AlertIOS
} = React;

var SimpleAuthService = require('./SimpleAuthService');

class Login extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showProgress:false
    }
  }
  loginTwiter(){
    this.setState = {
      showProgress:true
    }
    SimpleAuthService.authorize()
      .then( info => {
        AlertIOS.alert(
          'Complete',
          'Welcome to Game Picker')
        this.props.onLogin();
      })
      .catch(error=>{
        AlertIOS.alert(
          'error',
          error.description)
        console.log(error);
      })
  }

  render(){
    return (
      <View style = {styles.container}>
        <Text style = {styles.heading}>Game Picker</Text>
        <TouchableHighlight
          style= {styles.button}
          onPress = {this.loginTwiter.bind(this)}
        >
          <Text style = {styles.buttonText}> Login with Twiter </Text>
        </TouchableHighlight>
        <ActivityIndicatorIOS
          animating = {this.state.showProgress}
          size='large'
          style = {styles.loader}
        />
      </View>
    );
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems:'center',
  },
  heading:{
    fontSize:30,
  },
  button:{
    height: 50,
    backgroundColor: '#0091CA',
    alignSelf: 'stretch',
    margin: 10,
    justifyContent:'center',
  },
  buttonText:{
    fontSize:22,
    color:'#FFF',
    alignSelf:'center',
    justifyContent:'center'
  },
}); 

module.exports = Login