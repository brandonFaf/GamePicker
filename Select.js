'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  Image,
  Component,
  ListView,
  TouchableHighlight,
} = React;

var TeamImages = require('./TeamImages');
var ParseHelper = require('./ParseHelper');
class Select extends Component{
  constructor(props){
    super(props);
    this.state = {
      gameData: props.gameData,
      images: TeamImages,
      awaySelected:props.gameData.Selection == 'AwayTeam',
      homeSelected:props.gameData.Selection == 'HomeTeam',
    }
  }

  selectAndSave(selection){
    if (selection == 'AwayTeam') {
      this.setState({awaySelected:true, homeSelected:false});
    }else{
      this.setState({awaySelected:false, homeSelected:true});
    }
    ParseHelper.saveSelection(this.state.gameData.objectID, selection, ()=>{
      var Games = require('./Games');
      this.props.navigator.replacePreviousAndPop({
        title: 'Week '+ this.state.gameData.Week,
        component: Games,
        passProps:{
          week: this.state.gameData.Week,
          update:true,
          updatedSelection:selection,
          updatedGame:this.state.gameData.objectID,
        }
      })
    })

  }

  render(){
    return(
      <View style = {styles.container}>
        <View style = {styles.teamContainer}>
          <TouchableHighlight
            onPress= {() => this.selectAndSave('AwayTeam')}
            underlayColor = '#F5FCFF'
          >
            <Image
              source = {this.state.images["Baltimore"]}
              style = {[styles.pic, this.state.awaySelected && styles.selected]} />
          </TouchableHighlight>
          <Text style = {styles.teamText}>{this.state.gameData.AwayTeam}</Text>
        </View>
          <Text style = {{fontSize:60, padding:10, top:10}}>@</Text>
        <View style = {styles.teamContainer}>
          <TouchableHighlight
            onPress= {() => this.selectAndSave('HomeTeam')}
            underlayColor = '#F5FCFF'
          >
            <Image
              source = {this.state.images.Denver}
              style = {[styles.pic, this.state.homeSelected &&styles.selected]} />  
          </TouchableHighlight>
          <Text style = {styles.teamText}>{this.state.gameData.HomeTeam}</Text>
        </View>
      </View>
    )
  
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems:'flex-start',
    paddingTop: 140,
  },
  teamText:{
    paddingTop:10,
    fontSize:20
  },
  teamContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  pic:{
    height:120,
    width:120,
    borderRadius:60,
    backgroundColor:'#333'
  },
  selected:{
    borderWidth:3,
    borderColor:"#a7bc32"
  }
});
module.exports = Select; 