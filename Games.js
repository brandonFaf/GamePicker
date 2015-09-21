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
  ListView,
  TouchableHighlight,
  TabBarIOS,
  ActivityIndicatorIOS,
  ScrollView,
  Image,
} = React;

//array of months and days for date
var months = ["Jan","Feb","Mar","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];
var days = ["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];

var Select = require('./Select');
var QuickSelect = require('./QuickSelect');
var ParseHelper = require('./ParseHelper');
var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash')

class Games extends React.Component{
  constructor(props){
    //perform base constructor
    super(props);
    //setup getting the section data from the datasource datablob
    var getSectionData = (dataBlob, sectionID) => {
        return dataBlob[sectionID];
    }
    //setup what the row data key will be in the datasourse datablob
    var getRowData = (dataBlob, sectionID, rowID) => {
        return dataBlob[sectionID + ':' + rowID];
    }

    //set up the datasource for the list view
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 != r2,
      sectionHeaderHasChanged: (s1, s2) => s1 != s2,
      getRowData: getRowData,
      getSectionData: getSectionData,
    });
    //set initial state
    this.state = {
      dataSource: ds,
      selectedTab:'list',
      images:props.images,
      loading:true,
      showError:false,
    }
  }

  //Invoked when a component is receiving new props. This method is not called for the initial render.
  //Use this to update datasource when transitioning back from a selection
  componentWillReceiveProps(nextProps){
    //check if there was a change made in selection and if the state of the component is ready to update. 
    if(nextProps.update && this.state.update){
      //grab the game that changed from the dataSource array
      var changed = _.findIndex(this.state.ds, 'objectID',nextProps.updatedGame);
      //make a copy of the datasource array
      var newDs = this.state.ds.slice();
      //clear out the changed object in the copied array, otherwise the object will change in the datasouce too and it won't rerender
      newDs[changed] = {};
      //go through the props of the game and copy all except for the selection
      for(var prop in this.state.ds[changed]){
        if(prop != "Selection"){
          newDs[changed][prop] = this.state.ds[changed][prop];
        }
        else{
          newDs[changed][prop] = nextProps.updatedSelection;
        }
      }
      //set the new objects selection and double properties based on the incoming selection
      newDs[changed].SelectionId = nextProps.selectionId;
      newDs[changed].isDouble = nextProps.isDouble;

      //if the game is double remove any other double star
      if (nextProps.isDouble) {
        //find the first double in the datasource
        var otherDouble = _.findIndex(this.state.ds,'isDouble', true);
        //if the double found is the same as the one we are trying to set, look from the other direction
        if (otherDouble == changed && otherDouble != -1) {
          otherDouble = _.findLastIndex(this.state.ds,'isDouble',true);
        };
        //if there is another double
        if (otherDouble != changed && otherDouble != -1) {
          //clear out the old double so the datasource will realize its changed
          newDs[otherDouble] = {};
          //go through the props of the old double and copy all except for the double property
          for(var prop in this.state.ds[otherDouble]){
            if(prop != "isDouble"){
              newDs[otherDouble][prop] = this.state.ds[otherDouble][prop];
            }
            else{
              newDs[otherDouble][prop] = false;
            }
          }
        };
      };
      //set the dataSource to the new array
      this.setDataSource(newDs);
      //set the state to false so it isn't updated when the user goes to a new game
      this.state.update = false;
    }else{
      //set the stae to true so that the list is updated when it comes back
      this.state.update= true;
    }
  }

  //get the list of games for that week as well as athe users selections from the Parse Database
  getGames(){
    //the columns to get from the database
    var columns = ['Week','HomeTeam','AwayTeam', 'Winner','Date','Time'];
    var dataSource;
    //call the method in the parse helper to get the games, pass the week to get and tre so that it is taken from the local datastore
    ParseHelper.parseQuery('Games','Week',this.props.week, true, columns)
    .then((dataSourceResult) =>{
      //set the datasource variable to the results
      dataSource = dataSourceResult
      //use the ParseHelper to get the users selections.
      return ParseHelper.parseQuery('Selections','User',null,false,['Game','Selection','isDouble'],)
    })
    .then((selections) =>{
        // var selections = [];
        //for each game
        dataSource.forEach((n,i)=>{
          //make a data object with the games date and time
          n.GameTime = new Date(n.Date + ' ' + n.Time);
          //set the index
          n.Index = i;
          //check if the user has made a selection for the game
          var choice = _.find(selections,'Game', n.objectID);
          //if they have set the details about the selection on the game 
          if (choice) {
            n.Selection = choice.Selection;
            n.SelectionId = choice.objectID;
            n.isDouble = choice.isDouble;
          }else{
            n.Selection = "";
            n.SelectionId = "";
            n.isDouble = false;
          }
        });
        //set the games array as the datasource
        this.setDataSource(dataSource);
      });
  }

  setDataSource(dataSource){
    //sort the games based on date
    dataSource.sort(function(a,b){
      return new Date(a.GameTime) - new Date(b.GameTime)
    }) 
    //get each unique date
    var dates = _.uniq(dataSource, true, function(n){
      return n.GameTime.getTime();
    });
    var sectionIds = [];
    var rowIds =[];
    var dataBlob = {};
    //for each of the dates,
    dates.forEach((n,i)=>{ 
        //add the date to the sectionId array
        sectionIds.push(i);
        //figure out if the game is AM or PM
        var afternoon = n.GameTime.getHours() <12 ? "AM" : "PM";
        //add the date string to the blob object
        dataBlob[i] = days[n.GameTime.getDay()] + " " + months[n.GameTime.getMonth()]+" " + n.GameTime.getDate() + " " + n.GameTime.getHours()%12 + ":"+("0"+n.GameTime.getMinutes()).slice(-2)+" "+ afternoon;

        //find games with that time
        var games = dataSource.filter(function(obj){
          return obj.GameTime.getTime() == n.GameTime.getTime();
        })
        rowIds[i] = [];
        //sort the game by their index to keep the dates showing up in the same order everytime
        games.sort(function(a,b){
          return a.Index - b.Index
        })
        //foreach game
        games.forEach((m,j)=>{
          //set the key of the game to be the key of the rowIds
          rowIds[i].push(m.objectID);
          //add the game object to the datablob object
          dataBlob[i+":"+m.objectID] = m
        })
      
    })
    //set the components state datasource 
    this.setState({
      loading:false,
      ds:dataSource,
      dataSource: this.state.dataSource.cloneWithRowsAndSections(dataBlob,sectionIds,rowIds),
    });
  }

  //run when the component is loaded
  componentDidMount(){
    //check to see if local games needs to be updated
    ParseHelper.updateSchedule(()=>{ 
      this.getGames();
    });
  }

  //what happens when user selects a game
  pressRow(rowData){
    //set the update property of the components state
    this.state.update = false;
    //push on the select component for that game
    this.props.navigator.push({
      title: 'Game',
      component: Select,
      passProps:{
        gameData:rowData,
        update:false,
        actAsAdmin:this.props.actAsAdmin,
        league:this.props.league
      }
    })
  }

  //how a row should look on the list view
  renderRow(rowData){
    //if double is selected add the star
    var double = <View/>
    if (rowData.isDouble) {
      double = <Image source = {require("image!StarSelected")} style = {{width:20, height:20}}/>
    };
    //figrue out if the selection was correct
    let correct = rowData.Selection == rowData.Winner;
    return (
      <TouchableHighlight
        onPress={()=> this.pressRow(rowData)}
        underlayColor = '#ddd'>
        <View style ={[styles.row,this.props.actAsAdmin&&{backgroundColor: '#333'}]}>
          <Text style={{fontSize:18}}>{rowData.AwayTeam} @ {rowData.HomeTeam} </Text>
          <View style={{flex:1, flexDirection:'row'}}>
            {double}
            <Text style={[styles.dateText, correct && styles.correct, (!correct && (rowData.Winner!="" && rowData.Winner != undefined)) && styles.incorrect]}>{rowData[rowData.Selection]}</Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
  //how the section header should look
  renderSectionHeader(sectionData, sectionID) {
        return (
            <View style={styles.section}>
                <Text style={styles.text}>{sectionData}</Text>
            </View>
        ); 
    }
  render(){
    //show loader while getting games
    if (this.state.loading) {
      return(
        <View style = {styles.loadingContainer}>
          <ActivityIndicatorIOS
            size = 'large'
            animated = {true}
          />
        </View>
      )
    }
     if (this.state.showError) {
      return(
        <View style = {styles.loadingContainer}>
          <Text style = {styles.errorText}>There was an error when trying to retrieve the games for this week. Do you have internet?</Text>
        </View>
      )
    }
    //what the majority of the component should look like
    var renderMeat;
    renderMeat = <View/>
    
      renderMeat = <ListView
            dataSource = {this.state.dataSource}
            renderRow = {this.renderRow.bind(this)}
            renderSectionHeader = {this.renderSectionHeader.bind(this)}>

          </ListView>

    return (
      <View style = {styles.container}>
      {renderMeat}
      </View>
    );
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  row:{
    flex:1,
    flexDirection:'row',
    padding:18,
    borderBottomWidth: 1,
    borderColor: '#d7d7d7',
  },
  loadingContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  dateText:{
    flex:1,
    fontSize:15,
    paddingTop:3,
    color:'#b5b5b5',
    textAlign:'right',
  },
  correct:{
   color: 'green',
  },
  rowText:{
    flex:1,
  },
  todo:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding:30
  },
  button:{
    height: 50,
    backgroundColor: 'green',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent:'center',
  },
  buttonText:{
    fontSize:22,
    color:'#FFF',
    alignSelf:'center',
    justifyContent:'center'
  },
  incorrect:{
    color:'red',
  },
  section: {
    flex:1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 6,
    backgroundColor: '#ddd'
    },
  errorText:{
    borderWidth:1,
    margin:10,
    padding:5,
    borderRadius:10,
    color:'red',
    borderColor:'red'
  },
}); 

module.exports = Games