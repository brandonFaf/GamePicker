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
var self
class Select extends Component{
  constructor(props){
    super(props);
    self = this;
    this.state = {
      gameData: props.gameData,
      images: TeamImages,
      awaySelected:props.gameData.Selection == 'AwayTeam',
      homeSelected:props.gameData.Selection == 'HomeTeam',
      showError:false
    }
  }

  selectAndSave(selection){
    if (selection == 'AwayTeam') {
      this.setState({awaySelected:true, homeSelected:false});
    }else{
      this.setState({awaySelected:false, homeSelected:true});
    }
    if (this.props.actAsAdmin) {
      ParseHelper.saveResult(this.state.gameData.objectID, selection, this.returnToGame);
    }
    else{
      if(Date.now()< new Date(this.state.gameData.GameTime)){
        ParseHelper.saveSelection(this.state.gameData.objectID, selection, this.returnToGame);
      }
      else{
        this.setState({showError:true})
      }
    };
  }

  returnToGame(selection){
    var Games = require('./Games');
      self.props.navigator.replacePreviousAndPop({
        title: 'Week '+ self.state.gameData.Week,
        component: Games,
        passProps:{
          week: self.state.gameData.Week,
          update:selection != self.props.gameData.Selection,
          updatedSelection:selection,
          updatedGame:self.state.gameData.objectID,
          actAsAdmin:self.props.actAsAdmin
        }
    });
  }

  render(){
    var possibleError = <View/>
    if (this.state.showError) {
      possibleError =  <Text style = {styles.errorText}>There was an error when trying to save the selection. Is it past the start time?</Text>
    };
    return(
      <View style = {{flex:1, flexDirection:'column'}}>
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
      <View style = {{flex:1}}>
        {possibleError}
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
  },
  errorText:{
    borderWidth:1,
    margin:10,
    padding:5,
    borderRadius:10,
    color:'red',
    borderColor:'red'
  }
});
module.exports = Select; 