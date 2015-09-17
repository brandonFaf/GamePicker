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
  AlertIOS,
  TextInput,
} = React;

var SimpleAuthService = require('./SimpleAuthService');

class Login extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showProgress:false,
      username:"",
      league:"",
    }
  }
  loginTwiter(){
    if (this.state.username == "" || this.state.league == "")
    {
      AlertIOS.alert(
          'Invalid Info',
          "Be sure you have provided a display name and league name"); 
      return;
    }
    this.setState({
      showProgress:true
    });
    SimpleAuthService.authorize(this.state.username,this.state.league)
      .then(result => {
        AlertIOS.alert(
          'Complete',
          `Welcome to KTB Pick 'em ${result.username}`);
        this.props.onLogin(result);
      })
      .catch(error=>{
        AlertIOS.alert(
          'error',
          "Be sure you are logged into Twitter in your settings") 
        console.log(error);
      })
  }

  render(){
    return (
      <View style = {styles.container}>
        <Text style = {styles.heading}>KTB Pick 'em</Text>
         <ActivityIndicatorIOS
          animating = {this.state.showProgress}
          size='large'
          style = {styles.loader}
        />
        <Text>Pick a display name:</Text>        
        <TextInput onChangeText = {(text)=> this.setState({username:text})} style = {styles.input} placeholder = "Display Name" />
        <Text>Please enter your leage name:</Text>        
        <TextInput onChangeText = {(text)=> this.setState({league:text})} style = {styles.input} placeholder = "League Name" />
        <TouchableHighlight
          style= {styles.button}
          onPress = {this.loginTwiter.bind(this)}
        >
          <Text style = {styles.buttonText}> Login with Twiter </Text>
        </TouchableHighlight>
        
      </View>
    );
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop:100,
    alignItems:'center',
  },
  heading:{
    fontSize:40,
  },
  button:{
    height: 50,
    backgroundColor: '#0091CA',
    alignSelf: 'stretch',
    margin: 10,
    justifyContent:'center',
  },
  input:{
    height: 50,
    marginTop: 10,
    padding:4,
    fontSize:18,
    borderWidth:1,
    borderColor: '#48bbec',
    margin:10,

  },
  buttonText:{
    fontSize:22,
    color:'#FFF',
    alignSelf:'center',
    justifyContent:'center'
  },
}); 

module.exports = Login