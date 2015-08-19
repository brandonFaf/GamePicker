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

class Scores extends React.Component{
  constructor(props){
    super(props);
    this.state = {score:0, isLoading:true};

  }

  componentDidMount(){
    ParseHelper.getAllScores()
    .then(results=>{
      console.log(results);
      this.setState({
        score:results,
        isLoading:false,
      })
    });
  }
  render() {
    if (this.state.isLoading) {
      return(
        <View style = {styles.container}>
          <ActivityIndicatorIOS
            animating = {true}
            size = 'small'
            />
        </View>
        )
    };
    return (
      <View style = {styles.container}>
        {this.state.score.map(function(n){
          return <Text>{n[0]}:{n[1]}</Text>
        })}
      </View>
    );
  }
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

module.exports = Scores