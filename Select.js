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

class Select extends Component{
  constructor(props){
    super(props);
    this.state = {
      pushEvent: props.pushEvent,
      images: TeamImages,
      awaySelected:false,
      homeSelected:false,
    }
  }
  render(){
    return(
      <View style = {styles.container}>
        <TouchableHighlight
          onPress= {() => this.setState({awaySelected:true, homeSelected:false})}
          underlayColor = '#F5FCFF'
        >
          <Image
            source = {this.state.images["Baltimore"]}
            style = {[styles.pic, this.state.awaySelected && styles.selected]} />
        </TouchableHighlight>
          <Text style = {{fontSize:60, padding:10, top:10}}>@</Text>
        <TouchableHighlight
          onPress= {() => this.setState({awaySelected:false, homeSelected:true})}
          underlayColor = '#F5FCFF'
        >
          <Image
            source = {this.state.images.Denver}
            style = {[styles.pic, this.state.homeSelected &&styles.selected]} />  
        </TouchableHighlight>
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
    backgroundColor: '#F5FCFF',
  },
  pic:{
    height:120,
    width:120,
    borderRadius:60,
    backgroundColor:'#333'
  },
  selected:{
    borderWidth:3,
    borderColor:"#47c6b2"
  }
});
module.exports = Select; 