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
      showError:false,
      isDouble:props.gameData.isDouble,
    }
  }

  selectAndSave(selection){
    if (selection == 'AwayTeam') {
      this.setState({awaySelected:true, homeSelected:false});
    }else{
      this.setState({awaySelected:false, homeSelected:true});
    }
    if (this.props.actAsAdmin) {
      ParseHelper.saveResult(this.state.gameDate.objectID, selection, this.returnToGame);
    }
    else{
      if(Date.now()< new Date(this.state.gameData.GameTime)){
        ParseHelper.saveSelection(this.state.gameData.objectID, this.state.gameData.SelectionId, selection, this.state.isDouble, this.returnToGame);
      }
      else{
        this.setState({showError:true})
      }
    };
  }

  returnToGame(savedId, selection){
    var Games = require('./Games');
      self.props.navigator.replacePreviousAndPop({
        title: 'Week '+ self.state.gameData.Week,
        component: Games,
        passProps:{
          week: self.state.gameData.Week,
          update:(selection != self.props.gameData.Selection||self.state.isDouble != self.state.gameData.isDouble),
          updatedSelection:selection,
          updatedGame:self.state.gameData.objectID,
          selectionId:savedId,
          actAsAdmin:self.props.actAsAdmin,
          isDouble:self.state.isDouble
        }
    });
  }
  doDouble(){
    if (!this.state.awaySelected && !this.state.homeSelected) {
      this.setState({
        showDoubleError:true,
      })
    }
    else{
      var selection = this.state.awaySelected ? "AwayTeam" : "HomeTeam"
      if(Date.now()< new Date(this.state.gameData.GameTime)){
        if (!this.state.isDouble) {
          ParseHelper.checkIfDoubleIsLegal(this.state.gameData[selection])
          .then((cont)=>{
            if (cont) {
              return ParseHelper.changeDoubleArray(true,this.state.gameData[selection])
            }
            else{
              throw{message:"Double already exists"};
            }
          })
          .then(()=>{
                return ParseHelper.setDouble(this.state.gameData.Week, this.state.gameData.SelectionId)
              })
          .then(()=>{
                  self.state.isDouble=!this.state.isDouble;
                  this.returnToGame(this.state.gameData.SelectionId,selection);
          }).catch(err=>{
              this.setState({showDoubleSelectedError:true})
          });
        }
        else{
          ParseHelper.setDouble(this.state.gameData.Week, "", () => {
            self.state.isDouble = !this.state.isDouble
            this.returnToGame(this.state.gameData.SelectionId, selection);
          })
        }
      }
      else{
        this.setState({showError:true})
      }
    }
  }
  render(){
    var possibleError = <View/>
    if (this.state.showError) {
      possibleError =  <Text style = {styles.errorText}>There was an error when trying to save the selection. Is it past the start time?</Text>
    };
    if(this.state.showDoubleError){
      possibleError = <Text style = {styles.errorText}>Please select who you think will win before selecting this as your double</Text>
    }
    if (this.state.showDoubleSelectedError) {
      possibleError = <Text style = {styles.errorText}>You have already selected that team as a double</Text>      
    };
    var image;
    if (this.state.isDouble) {
      image = require('image!StarSelected')
    }
    else{
      image = require('image!Star')
    };

    return(
      <View style = {{flex:1,flexDirection:'column'}}>
      <View style = {styles.container}>
        <View style = {styles.teamContainer}>
          <TouchableHighlight
            onPress= {() => this.selectAndSave('AwayTeam')}
            underlayColor = '#F5FCFF'
          >
            <Image
              source = {this.state.images[this.state.gameData.AwayTeam]}
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
              source = {this.state.images[this.state.gameData.HomeTeam]}
              style = {[styles.pic, this.state.homeSelected &&styles.selected]} />  
          </TouchableHighlight>
          <Text style = {styles.teamText}>{this.state.gameData.HomeTeam}</Text>
        </View>
      </View>
      <View style = {{flex:2.5,alignItems:'center'}}>
        <TouchableHighlight
          onPress = {() =>this.doDouble()}
          underlayColor = '#fff'>
          <Image source = {image} style = {{ height:60, width:60}}/>
        </TouchableHighlight>
          <Text>Double</Text>
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