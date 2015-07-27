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
      rowHasChanged: (r1, r2) => r1.Selection != r2.Selection
    });
    this.state = {
      dataSource: ds,
      selectedTab:'list',
      images:props.images
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.update){
      console.log(nextProps.updatedSelection);
      this.getGames();
    }else{
      // console.log("nothing");
    }
  }

  getGames(){
    console.log("network query");
    ParseHelper.parseQuery('Games','Week',this.props.week,['Week','HomeTeam','AwayTeam'], (dataSource) =>{
      ParseHelper.parseQuery('Selections','User',null,['Game','Selection'], (selections) =>{
        dataSource.forEach((n,i)=>{
          var choice = _.result(_.find(selections,'Game', n.objectID),'Selection');
          if (choice) {
            n.Selection = choice;
          }else{
            n.Selection = "";
          }
        });
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(dataSource),
        });
      });
    });
  }

  componentDidMount(){
    // console.log("componentDidMount");
    this.getGames();
  }
  pressRow(rowData){
    this.props.navigator.push({
      title: 'Game',
      component: Select,
      passProps:{
        gameData:rowData,
      }
    })
  }
  pressButton(){
    this.props.navigator.push({
      title:'Quick Select',
      component:QuickSelect,
      passProps:{
      }
    })
  }

  renderRow(rowData){
    return (
      <TouchableHighlight
        onPress={()=> this.pressRow(rowData)}
        underlayColor = '#ddd'>
        <View style ={styles.row}>
          <Text style={{fontSize:18}}>{rowData.AwayTeam} @ {rowData.HomeTeam} </Text>
          <View style={{flex:1}}>
            <Text style={styles.dateText}>{rowData[rowData.Selection]}</Text>
          </View>
        </View>
      </TouchableHighlight>

    )
  }
  render(){
    return (
      <TabBarIOS >
        <TabBarIOS.Item
          title='List'
          style={styles.container}
          selected = {this.state.selectedTab == 'list'}
          onPress={()=>this.setState({selectedTab: 'list'})}>
          <ListView
            dataSource = {this.state.dataSource}
            renderRow = {this.renderRow.bind(this)}>
          </ListView>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title='Quick'
          selected = {this.state.selectedTab == 'quick'}
          onPress={()=>this.setState({selectedTab: 'quick'})}>
          <View style={styles.todo}>
          <Text style = {styles.heading}>Click the button to start the quick select process</Text>
          <TouchableHighlight onPress= {() =>this.pressButton()} style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableHighlight>
          </View>
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop:40,
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
}); 

module.exports = Games