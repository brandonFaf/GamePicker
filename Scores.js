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
  ActivityIndicatorIOS,
} = React;

var ParseHelper = require('./ParseHelper');
var _ = require('lodash');

class Scores extends React.Component{
  constructor(props){
    super(props);
    this.state = {score:0, isLoading:true};

  }

  componentDidMount(){
    ParseHelper.getAllScores()
    .then(results=>{
      console.log(results);
      results.sort((a,b)=>{
        return b[1]-a[1];
      });
      var p= this.props;
      var userStats = _.find(results, (info)=>{
        console.log(this.props.username);
        return info[0] == this.props.username;
      })
      this.setState({
        score:results,
        isLoading:false,
        doubles:userStats[2]||[],
      })
    });
  }
  render() {
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
});

module.exports = Scores