/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var AsyncStorage = require('react-native').AsyncStorage
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS,
  TouchableHighlight,
  AlertIOS
} = React;

var userNameKey = 'userName';
var isAdminKey = 'isAdmin';
var leagueNameKey = 'leagueName';

var ParseHelper = require('./ParseHelper');
var _ = require('lodash');

class Scores extends React.Component{
  constructor(props){
    //perform base constructor
    super(props);
    //set initial state
    this.state = {score:0, isLoading:true};

  }

  componentDidMount(){
    //call parse helper method to get all scores
    ParseHelper.getAllScores(this.props.league)
    .then(results=>{
      //sort based on score
      results.sort((a,b)=>{
        return b[1]-a[1];
      });
      //get reference to props (for debugging)
      var p= this.props;
      //find the current user in the results
      var userStats = _.find(results, (info)=>{
        return info[0] == this.props.username;
      })
      //update state with scores and double array
      this.setState({
        score:results,
        isLoading:false,
        doubles:userStats[2]||[],
      })
    });
  }
  //removes saved data from asyncStorage
  logOut(){
    //remove keys
    AsyncStorage.multiRemove([userNameKey,isAdminKey,leagueNameKey],
        (err)=>
        {
          if(err){
            AlertIOS.alert(
            'error',
            "not logged out " + err);
            return;
          }
          AlertIOS.alert(
          'Logged Out',
          "You are logged out. Please close the app and open it again");
        })
  }
  render() {
    //show loading screen while getting scores
    if (this.state.isLoading) {
      return(
        <View style = {{flex:1, justifyContent:'center', alignItems:'center'}}>
          <ActivityIndicatorIOS
            animating = {true}
            size = 'small'
            />
        </View>
        )
    };
    //set up the string to dispaly the doubles
    var doublesString = "";
    this.state.doubles.forEach(n=>{doublesString += n + ", "});
    return (
      <View>
      <View style = {styles.container}>
        <Text style = {styles.title}>Leaderboard</Text>
        {this.state.score.map(function(n,i,){
          return <View style = {styles.textView}><Text style = {[styles.text, n[0] == this.props.username && styles.bold]}>{i+1}. {n[0]}: {n[1]}</Text></View>
        }, this)}
      </View>
      <View style = {styles.differentContainer}>
        <Text style = {styles.title}>Doubles Used</Text>
        <Text style = {[styles.text,{textAlign:'center'}]}>{doublesString == "" ? "None" : doublesString}</Text>
        <TouchableHighlight
          style= {styles.button}
          onPress = {this.logOut.bind(this)}
        >
          <Text style = {styles.buttonText}> Logout </Text>
        </TouchableHighlight>
      </View>
      </View>
    );
  }
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    top:60,
  },
  differentContainer: {
    flex: 1,
    justifyContent: 'center',
    top:60,
    height:300,
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
  },
  textView:{
    padding:8,
    borderBottomWidth:1,
    borderColor: '#d7d7d7',
  },
  text:{
    textAlign:'left',
    fontSize:20,
    margin:10,
  },
  bold: {
    fontWeight:'bold'
  },
    button:{
    height: 50,
    backgroundColor: '#0091CA',
    alignSelf: 'stretch',
    margin: 10,
    top:30,
    justifyContent:'center',
  },
    buttonText:{
    fontSize:22,
    color:'#FFF',
    alignSelf:'center',
    justifyContent:'center'
  },
});

module.exports = Scores