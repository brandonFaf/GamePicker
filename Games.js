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
      this.setState({
        ds: newDs,
        dataSource: this.state.dataSource.cloneWithRows(newDs)
      })
      this.state.update = false;
    }else{
      this.state.update= true;
    }
  }

  getGames(fromLocal = true){
    console.log("network query");
    var columns = ['Week','HomeTeam','AwayTeam', 'Winner','Date','Time'];
    ParseHelper.parseQuery('Games','Week',this.props.week, fromLocal, columns, (dataSource) =>{
      ParseHelper.parseQuery('Selections','User',null,false,['Game','Selection'], (selections) =>{
        dataSource.forEach((n,i)=>{
          n.GameTime = new Date(n.Date + ' ' + n.Time);
          var choice = _.result(_.find(selections,'Game', n.objectID),'Selection');
          if (choice) {
            n.Selection = choice;
          }else{
            n.Selection = "";
          }
        });
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
      });
    });
  }

  componentDidMount(){
    ParseHelper.updateSchedule((update)=>{
      var needsUpdate = update != null 
      this.getGames(!needsUpdate);
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
  pressButton(){
    // ParseHelper.callCloudMethod();
  }

  renderRow(rowData){

    console.log("GameTime " + rowData.GameTime);
    let correct = rowData.Selection == rowData.Winner;
    return (
      <TouchableHighlight
        onPress={()=> this.pressRow(rowData)}
        underlayColor = '#ddd'>
        <View style ={[styles.row,this.props.actAsAdmin&&{backgroundColor: '#333'}]}>
          <Text style={{fontSize:18}}>{rowData.AwayTeam} @ {rowData.HomeTeam} </Text>
          <View style={{flex:1}}>
            <Text style={[styles.dateText, correct && styles.correct, (!correct && rowData.Winner != undefined) && styles.incorrect]}>{rowData[rowData.Selection]}</Text>
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
    if (this.props.actAsAdmin) {
    renderMeat = <TabBarIOS >
        <TabBarIOS.Item
          title='List'
          style={[styles.container, {paddingTop:40}]}
          selected = {this.state.selectedTab == 'list'}
          onPress={()=>this.setState({selectedTab: 'list'})}>
          <ListView
            dataSource = {this.state.dataSource}
            renderRow = {this.renderRow.bind(this)}>
          </ListView>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title='Finalize'
          selected = {this.state.selectedTab == 'Finalize'}
          onPress={()=>this.setState({selectedTab: 'Finalize'})}>
          <View style={styles.todo}>
          <Text style = {styles.heading}>Click the button to start the quick select process</Text>
          <TouchableHighlight onPress= {() =>this.pressButton()} style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableHighlight>
          </View>
        </TabBarIOS.Item>
      </TabBarIOS>
    }
    else{
      renderMeat = <ListView
            dataSource = {this.state.dataSource}
            renderRow = {this.renderRow.bind(this)}
            renderSectionHeader = {this.renderSectionHeader.bind(this)}>

          </ListView>
    }
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
    fontSize:15,
    paddingTop:3,
    color:'#b5b5b5',
    textAlign:'right'
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
  }
}); 

module.exports = Games