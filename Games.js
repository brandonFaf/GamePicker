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

var months = ["Jan","Feb","Mar","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];
var days = ["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];

var Select = require('./Select');
var QuickSelect = require('./QuickSelect');
var ParseHelper = require('./ParseHelper');
var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash')

class Games extends React.Component{
  constructor(props){
    super(props);
    var getSectionData = (dataBlob, sectionID) => {
        return dataBlob[sectionID];
    }

    var getRowData = (dataBlob, sectionID, rowID) => {
        return dataBlob[sectionID + ':' + rowID];
    }
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 != r2,
      sectionHeaderHasChanged: (s1, s2) => s1 != s2,
      getRowData: getRowData,
      getSectionData: getSectionData,
    });
    this.state = {
      dataSource: ds,
      selectedTab:'list',
      images:props.images,
      loading:true,
      showError:false,
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.update && this.state.update){
      var changed = _.findIndex(this.state.ds, 'objectID',nextProps.updatedGame);
      var newDs = this.state.ds.slice();
      newDs[changed] = {};
      for(var prop in this.state.ds[changed]){
        if(prop != "Selection"){
          newDs[changed][prop] = this.state.ds[changed][prop];
        }
        else{
          newDs[changed][prop] = nextProps.updatedSelection;
        }
      }
      newDs[changed].SelectionId = nextProps.selectionId;
      newDs[changed].isDouble = nextProps.isDouble;
      if (nextProps.isDouble) {
        var otherDouble = _.findIndex(this.state.ds,'isDouble', true);
        if (otherDouble == changed && otherDouble != -1) {
          otherDouble = _.findLastIndex(this.state.ds,'isDouble',true);
        };
        if (otherDouble != changed && otherDouble != -1) {
          newDs[otherDouble] = {};
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
      this.setDataSource(newDs);
      this.state.update = false;
    }else{
      this.state.update= true;
    }
  }

  getGames(){
    console.log("network query");
    var columns = ['Week','HomeTeam','AwayTeam', 'Winner','Date','Time'];
    var dataSource;
    ParseHelper.parseQuery('Games','Week',this.props.week, true, columns)
    .then((dataSourceResult) =>{
      dataSource = dataSourceResult
      return ParseHelper.parseQuery('Selections','User',null,false,['Game','Selection','isDouble'],)
    })
    .then((selections) =>{
        // var selections = [];
        dataSource.forEach((n,i)=>{
          n.GameTime = new Date(n.Date + ' ' + n.Time);
          n.Index = i;
          var choice = _.find(selections,'Game', n.objectID);
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
        this.setDataSource(dataSource);
      });
  }

  setDataSource(dataSource){
    dataSource.sort(function(a,b){
      return new Date(a.GameTime) - new Date(b.GameTime)
    }) 
    var dates = _.uniq(dataSource, true, function(n){
      return n.GameTime.getTime();
    });
    var sectionIds = [];
    var rowIds =[];
    var dataBlob = {};
    dates.forEach((n,i)=>{ 
        sectionIds.push(i);
        var afternoon = n.GameTime.getHours() <12 ? "AM" : "PM";
        dataBlob[i] = days[n.GameTime.getDay()] + " " + months[n.GameTime.getMonth()]+" " + n.GameTime.getDate() + " " + n.GameTime.getHours()%12 + ":"+("0"+n.GameTime.getMinutes()).slice(-2)+" "+ afternoon;

        var games = dataSource.filter(function(obj){
          return obj.GameTime.getTime() == n.GameTime.getTime();
        })
        rowIds[i] = [];
        games.sort(function(a,b){
          return a.Index - b.Index
        })
        games.forEach((m,j)=>{
          rowIds[i].push(m.objectID);
          dataBlob[i+":"+m.objectID] = m
        })
      
    })
    this.setState({
      loading:false,
      ds:dataSource,
      dataSource: this.state.dataSource.cloneWithRowsAndSections(dataBlob,sectionIds,rowIds),
    });
  }

  componentDidMount(){
    // this.getGames(true);
    ParseHelper.updateSchedule(()=>{ 
      this.getGames();
    });
  }
  pressRow(rowData){
    this.state.update = false;
    this.props.navigator.push({
      title: 'Game',
      component: Select,
      passProps:{
        gameData:rowData,
        update:false,
        actAsAdmin:this.props.actAsAdmin
      }
    })
  }

  renderRow(rowData){
    var double = <View/>
    if (rowData.isDouble) {
      double = <Image source = {require("image!StarSelected")} style = {{width:20, height:20}}/>
    };
    console.log("GameTime " + rowData.GameTime);
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
  renderSectionHeader(sectionData, sectionID) {
        return (
            <View style={styles.section}>
                <Text style={styles.text}>{sectionData}</Text>
            </View>
        ); 
    }
  render(){
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