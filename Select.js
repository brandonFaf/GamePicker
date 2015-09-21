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

//pull in team images
var TeamImages = require('./TeamImages');
var ParseHelper = require('./ParseHelper');
//make self variable to keep track of this in the different methods
var self
class Select extends Component{
  constructor(props){
    super(props);
    //set self to this to use in later code
    self = this;
    //set state object
    this.state = {
      gameData: props.gameData,
      images: TeamImages,
      awaySelected:props.gameData.Selection == 'AwayTeam',
      homeSelected:props.gameData.Selection == 'HomeTeam',
      showError:false,
      isDouble:props.gameData.isDouble,
      selectedAway:[],
      selectedHome:[],
      league:props.league
    }
  }

//when the componet is loaded
  componentDidMount(){
    //create arrays that will hold the other users selected values
    let selectedHome = [];
    let selectedAway = [];
    //call parse helper method that gets other users picks
    ParseHelper.getOthersPicks(this.state.gameData.objectID,this.state.league)
    .then(results =>{
      //for each of the picks decide if the user goes in the home or away selected arrays
      results.forEach(n=>{
        if (n[1] == "AwayTeam") {
          //add user
          selectedAway.push(n[0]);
          //add blank spot to other array
          selectedHome.push("");
        }
        else{
          //add user
          selectedHome.push(n[0]);
          //add blank spot to other array
          selectedAway.push("");
        }
      })
      //set the arrays to the state object
      this.setState({
        selectedAway:selectedAway,
        selectedHome:selectedHome
      })
    })
  }
  //function to select the team and save it to parse either as winner or use selection
  selectAndSave(selection){
    //if the user comes in as admin then store as winner
    if (this.props.actAsAdmin) {
      //figure out which was selected
      if (selection == 'AwayTeam') {
        this.setState({awaySelected:true, homeSelected:false});
      }else{
        this.setState({awaySelected:false, homeSelected:true});
      }
      //call parse method to save the result as winner
      ParseHelper.saveResult(this.state.gameData.objectID, selection, this.returnToGame);
    }
    else{
      //make sure the game hasn't started
      if(Date.now()< new Date(this.state.gameData.GameTime)){
        //figure out which was selected
        if (selection == 'AwayTeam') {
          this.setState({awaySelected:true, homeSelected:false});
        }else{
          this.setState({awaySelected:false, homeSelected:true});
        }
        //call parse method to save the result as a selection
        ParseHelper.saveSelection(this.state.gameData.objectID, this.state.gameData.SelectionId, selection, this.state.isDouble, this.returnToGame);
      }
      //if the game has started show error saying game can't be saved
      else{
        this.setState({showError:true})
      }
    };
  }

  //function to be used as callback function to go back to games screen
  returnToGame(savedId, selection){
    //require games again, needs to be in this function otherwise won't work
    var Games = require('./Games');
      // use transition to get to games component
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

  //function to select the team as double
  doDouble(){
    //make sure there is a selection
    if (!this.state.awaySelected && !this.state.homeSelected) {
      //set state to show error if no selection is made
      this.setState({
        showDoubleError:true,
      })
    }
    else{
      //figure out what the selection was
      var selection = this.state.awaySelected ? "AwayTeam" : "HomeTeam"
      //make sure the game hasn't been started
      if(Date.now()< new Date(this.state.gameData.GameTime)){
        //if its not already a double
        if (!this.state.isDouble) {
          //check if the team has already been selected
          ParseHelper.checkIfDoubleIsLegal(this.state.gameData[selection])
          .then((cont)=>{
            //if we get a result then the team is legal and we can continue to add it to the array
            if (cont) {
              //call parse helper function to cadd the team to the user's double array
              return ParseHelper.changeDoubleArray(true,this.state.gameData[selection])
            }
            else{
              //else throw an error
              throw{message:"Double already exists"};
            }
          })
          .then(()=>{
                //call parse helper method to set the current game as a 
                return ParseHelper.setDouble(this.state.gameData.Week, this.state.gameData.SelectionId)
              })
          .then(()=>{
                  //change the state of this game
                  self.state.isDouble=!this.state.isDouble;
                  //run callback Function to go to the games screen with the new info
                  this.returnToGame(this.state.gameData.SelectionId,selection);
          }).catch(err=>{
            //set state to show error
              this.setState({showDoubleSelectedError:true})
          });
        }
        else{
          //undo the double
          ParseHelper.setDouble(this.state.gameData.Week, "", () => {
            //change the state of the game
            self.state.isDouble = !this.state.isDouble
            //run callback function to go to the games screen with the new info
            this.returnToGame(this.state.gameData.SelectionId, selection);
          })
        }
      }
      else{
        //show error that game has already stated. 
        this.setState({showError:true})
      }
    }
  }
  render(){
    var possibleError = <View/>
    //error that game has already started
    if (this.state.showError) {
      possibleError =  <Text style = {styles.errorText}>There was an error when trying to save the selection. Is it past the start time?</Text>
    };
    //error that a selection hasn't been made before choosing a double
    if(this.state.showDoubleError){
      possibleError = <Text style = {styles.errorText}>Please select who you think will win before selecting this as your double</Text>
    }
    //error that team has already been selected
    if (this.state.showDoubleSelectedError) {
      possibleError = <Text style = {styles.errorText}>You have already selected that team as a double</Text>      
    };
    var image;
    //get the double star image
    if (this.state.isDouble) {
      image = require('image!StarSelected')
    }
    else{
      image = require('image!Star')
    };

    return(
      <View style = {{flex:1,flexDirection:'column'}}>
         <View style = {{top:60, paddingBottom:60, paddingTop:15,alignItems:'center'}}>
          <TouchableHighlight
            onPress = {() =>this.doDouble()}
            underlayColor = '#fff'>
            <Image source = {image} style = {{ height:60, width:60}}/>
          </TouchableHighlight>
            <Text>Double</Text>
          {possibleError}
        </View>
        <View style = {styles.container}>
          <View style = {styles.teamContainer}>
            <Text style = {styles.teamText}>{this.state.gameData.AwayTeam}</Text>
            <TouchableHighlight
              onPress= {() => this.selectAndSave('AwayTeam')}
              underlayColor = '#F5FCFF'
            >
              <Image
                source = {this.state.images[this.state.gameData.AwayTeam]}
                style = {[styles.pic, this.state.awaySelected && styles.selected]} />
            </TouchableHighlight>
            {this.state.selectedAway.map(n =>{
              return <Text style = {{padding:10, fontSize:15}}>{n}</Text>
            })}
          </View>
            <Text style = {{fontSize:60, padding:10, top:10}}>@</Text>
          <View style = {styles.teamContainer}>
            
            <Text style = {styles.teamText}>{this.state.gameData.HomeTeam}</Text>
            <TouchableHighlight
              onPress= {() => this.selectAndSave('HomeTeam')}
              underlayColor = '#F5FCFF'
            >
              <Image
                source = {this.state.images[this.state.gameData.HomeTeam]}
                style = {[styles.pic, this.state.homeSelected &&styles.selected]} />  
            </TouchableHighlight>
            {this.state.selectedHome.map(n =>{
              return <Text style = {{padding:10, fontSize:15}}>{n}</Text>
            })}
          </View>
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
  },
  teamText:{
    paddingBottom:10,
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
    borderWidth:8,
    borderColor:"#45dd55"
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