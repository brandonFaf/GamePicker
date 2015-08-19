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
  Animated,
  TabBarIOS
} = React;

var Games = require('./Games');
var Scores = require('./Scores');
var TeamImages = require('./TeamImages');
var ParseHelper = require('./ParseHelper');

class Week extends React.Component{
  constructor(props){
    super(props);
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 != r2
    });

    this.state = {
      dataSource: ds.cloneWithRows([{week:'1',date:'Sept 9'},{week:2,date:'Sept 10'},{week:3,date:'Sept 11'},{week:4,date:'Sept 12'},{week:5,date:'Sept 13'},]),
      selectedTab:'pick',
      images : TeamImages
    }
  }
  pressRow(rowData){
    ParseHelper.getScoreForCurrentUser(rowData.week)
    .then(score =>{
      this.props.navigator.push({
        title: 'Week '+ rowData.week + '   Score: '+score,
        component: Games,
        passProps:{
          week:rowData.week,
          images:this.state.images,
          actAsAdmin:this.state.selectedTab == 'results'

        }
      })
      console.log('show games for week ' + rowData.week);
    })
  }

  renderRow(rowData){
    return (
      <TouchableHighlight
        onPress={()=> this.pressRow(rowData)}
        underlayColor = '#ddd'>
        <View style ={[styles.row,this.state.selectedTab == 'results' &&{backgroundColor: '#333'}]}>
          <Text style={{fontSize:18}}>Week {rowData.week}</Text>
          <View style ={styles.rowText}>
             <Text style ={styles.dateText}>{rowData.date}</Text>
           </View>
         </View>
      </TouchableHighlight>
    )
  }
  render(){
    var adminControls;
    if (this.props.isAdmin) {
      adminControls= 
        <TabBarIOS.Item
          title = 'Enter Results'
          selected = {this.state.selectedTab == 'results'}
          onPress = {() => this.setState({selectedTab:'results'}) }>
          <View style = {styles.container}>
            <ListView
              dataSource = {this.state.dataSource}
              renderRow = {this.renderRow.bind(this)}>
            </ListView>
          </View>
        </TabBarIOS.Item>;
    };
    return (
      <TabBarIOS>
        <TabBarIOS.Item
          title= 'Pick'
          selected = {this.state.selectedTab == 'pick'}
          onPress = {()=>this.setState({selectedTab: 'pick'})}>
      <View style = {styles.container}>
        <ListView
          dataSource = {this.state.dataSource}
          renderRow = {this.renderRow.bind(this)}>
        </ListView>
      </View>
       </TabBarIOS.Item>
        <TabBarIOS.Item
          title = 'Scores'
          selected = {this.state.selectedTab == 'scores'}
          onPress = {()=>this.setState({selectedTab:'scores'})}>
          <Scores/>
        </TabBarIOS.Item>
        {adminControls}
      </TabBarIOS>
    );
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:40,
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
    color:'#b5b5b5',
    textAlign:'right'
  },
  rowText:{
    flex:1,
  }
}); 

module.exports = Week