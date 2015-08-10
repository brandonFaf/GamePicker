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
  TabBarIOS
} = React;

var Select = require('./Select');
var QuickSelect = require('./QuickSelect');
var ParseHelper = require('./ParseHelper');
var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash')

class Games extends React.Component{
  constructor(props){
    super(props);
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 != r2
    });
    this.state = {
      dataSource: ds,
      selectedTab:'list',
      images:props.images
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
    ParseHelper.parseQuery('Games','Week',this.props.week, fromLocal, ['Week','HomeTeam','AwayTeam', 'Winner','GameTime'], (dataSource) =>{
      ParseHelper.parseQuery('Selections','User',null,false,['Game','Selection'], (selections) =>{
        dataSource.forEach((n,i)=>{
          var choice = _.result(_.find(selections,'Game', n.objectID),'Selection');
          if (choice) {
            n.Selection = choice;
          }else{
            n.Selection = "";
          }
        });
        this.setState({
          ds:dataSource,
          dataSource: this.state.dataSource.cloneWithRows(dataSource),
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
  render(){
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
            renderRow = {this.renderRow.bind(this)}>
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
  }
}); 

module.exports = Games