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
    //perform base constructor
    super(props);
    //set the properties of the DataSource
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 != r2
    });
    //set the state, including the starting tab and the initial week data (hardcoded since weeks don't change)
    this.state = {
      dataSource: ds.cloneWithRows([{week:'1',date:'Sept 10'},{week:2,date:'Sept 17'},{week:3,date:'Sept 14'},{week:4,date:'Oct 1'},{week:5,date:'Oct 8'},{week:6,date:'Oct 15'},{week:7,date:'Oct 22'},{week:8,date:'Nov 1'},{week:9,date:'Nov 5'},{week:10,date:'Nov 12'},{week:11,date:'Nov 19'},{week:12,date:'Nov 26'},{week:13,date:'Dec 3'},{week:14,date:'Dec 10'},{week:15,date:'Dec 17'},{week:16,date:'Dec 24'},{week:17,date:'Jan 3'}, ]),
      selectedTab:'pick',
      images : TeamImages
    }
  }
  //handle when a user presses a row
  pressRow(rowData){
    //get the score of that user for the week the user pushed, returns a promise with the score
    ParseHelper.getScoreForCurrentUser(rowData.week)
    .then(score =>{
      //push a new Games 'scene' onto the navigator, pass info about the user as props
      this.props.navigator.push({
        title: 'Week '+ rowData.week + '   Score: '+score,
        component: Games,
        passProps:{
          week:rowData.week,
          images:this.state.images,
          actAsAdmin:this.state.selectedTab == 'results',
          league:this.props.league

        }
      })
    })
  }
  //what each row should look like
  renderRow(rowData){
    return (
      //make the rows touchable and tell it to do the pressRow function when pressed
      //show the week number, and the date. Use styles to position the info.
      //if the user is an Admin and we are in the results tab, then make the background a different color.
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
    //define a variable that will be the results tab if the user is an admin, otherwise will be empty and will not show.
    var adminControls;
    if (this.props.isAdmin) {
      //declare what the results tab would look like. 
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
    //declare what the component will look like.
    //define the tab bad and the 2 items that will be in the tab bar and what each will look like when selected
    //if scores is selected, show a Scores Component
    //if user isAdmin, adminControls will contain an react component and will be displayed with the other tabs
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
          <Scores username = {this.props.username} league = {this.props.league}/>
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