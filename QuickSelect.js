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
  Animated,
  PanResponder,
} = React;


var clamp = require('clamp');
var TeamImages = require('./TeamImages');
var SWIPE_THRESHOLD = 120;

var People = [
  'red',
  'green',
  'blue',
  'purple',
  'orange'
]

class QuickSelect extends Component{
  constructor(props){
    super(props);
    this.state = {
      pan: new Animated.ValueXY(),
      enter: new Animated.Value(0.5),
      images: TeamImages,
    }
  }

  componentWillMount(){
    this.leftPanResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture:() => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y:this.state.pan.y._value});
        this.state.pan.setValue({x:0, y:0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),

      onPanResponderRelease: (e, {vx,vy}) => {
        this.state.pan.flattenOffset();
        var velocity;

        if(vx>0){
          velocity = clamp(vx, 3, 5);
        }else if(vx < 0){
          velocity = clamp(vx*-1, 3, 5) *-1;
        }
        var st = this.state;
        if(this.state.pan.x._value > SWIPE_THRESHOLD){
          Animated.spring(this.state.pan,{
            toValue:{x:100, y:0},
            friction:10 
          }).start()
        }else{
          Animated.spring(this.state.pan,{
            toValue: {x:0, y:0},
            friction: 4
          }).start()
        }
      }
    })
    this.rightPanResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture:() => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y:this.state.pan.y._value});
        this.state.pan.setValue({x:0, y:0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),

      onPanResponderRelease: (e, {vx,vy}) => {
        this.state.pan.flattenOffset();
        var velocity;

        if(vx>0){
          velocity = clamp(vx, 3, 5);
        }else if(vx < 0){
          velocity = clamp(vx*-1, 3, 5) *-1;
        }
        var st = this.state;
        if(Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD){
          
          Animated.spring(this.state.pan,{
            toValue:{x:-100, y:0},
            friction:10 
          }).start()
          
        }else{
          Animated.spring(this.state.pan,{
            toValue: {x:0, y:0},
            friction: 4
          }).start()
        }
      }
    })
  }
  _resetState(){
    // this.state.pan.setValue({x:0,y:0});
    // this.state.enter.setValue(0);
  }

  render(){
    let {pan, enter, } = this.state;

    let [translateX, translateY] = [pan.x, pan.y];

    let rotate = pan.x.interpolate({inputRange: [-200,0,200], outputRange:["-30deg", "0deg", "30deg"]});
    let opacityLeft = pan.x.interpolate({inputRange: [-100,0,200], outputRange:[0,1,1]});
    let opacityRight = pan.x.interpolate({inputRange: [-200,0,100], outputRange:[1,1,0]});
    let scaleLeft = pan.x.interpolate({inputRange:[-200,0,200], outputRange:[0.5,1,2]});
    let scaleRight = pan.x.interpolate({inputRange:[-200,0,200], outputRange:[2,1,0.5]});

    let leftCardStyles = {transform:  [{translateX}, {translateY}, {scale:scaleLeft}], opacity:opacityLeft};
    let rightCardStyles = {transform: [{translateX}, {translateY}, {scale:scaleRight}], opacity:opacityRight};

    let shouldMoveLeft= false;
    return(
      <View style = {styles.container}>
        <Animated.Image source ={require('image!Baltimore')} style={[styles.pic, leftCardStyles && shouldMoveLeft]} {...this.leftPanResponder.panHandlers}/>
          <Text style = {{fontSize:60, padding:10, top:10}}>@</Text>
        <Animated.Image source ={require('image!Denver')} style={[styles.pic, rightCardStyles]} {...this.rightPanResponder.panHandlers}/>
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
  pic:{
    height:120,
    width:120,
    borderRadius:60,
    backgroundColor:'#333',
  },
  selected:{
    borderWidth:3,
    borderColor:"#47c6b2"
  }
});
module.exports = QuickSelect; 