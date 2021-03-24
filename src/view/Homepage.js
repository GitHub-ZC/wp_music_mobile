import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import EvilIcons from 'react-native-vector-icons/EvilIcons'

import Me from './Homepage/Me';
import Leaderboard from './Homepage/Leaderboard';
import Audio from '../component/Audio';
import PlaySongList from '../component/PlaySongList';


const TopTab = createMaterialTopTabNavigator();

class Homepage extends Component {
    constructor (props) {
        super(props);
        // console.log(props)
    }

    render() {
      return (
        <>
          <TopTab.Navigator backBehavior="none" lazy={true} tabBarOptions={{
            // activeTintColor: '#e91e63',
            labelStyle: {
              fontSize: 12
            },
            tabStyle: {
              width: 120
            },
            style: {
              // backgroundColor: 'powderblue',
              marginLeft: 48
            },
            indicatorStyle: {
              backgroundColor: 'green'
            }
          }}>
            <TopTab.Screen name="我的" component={Me} />
            <TopTab.Screen name="排行榜" component={Leaderboard} />
            {/* <TopTab.Screen name="搜索" component={Search} /> */}
          </TopTab.Navigator>
          {/* 打开侧边导航栏 */}
          <TouchableOpacity onPress={ () => this.props.navigation.navigate('Search') } style={{
            position: 'absolute',
            top: 14,
            right: 20
          }}>
            <EvilIcons name='search' size={26} color='black'></EvilIcons>
          </TouchableOpacity>
          {/* 搜索 */}
          <View style={{
            position: 'absolute',
            height: 48,
            width: 48,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <TouchableOpacity onPress={ () => this.props.navigation.openDrawer() } >
              <EvilIcons name="navicon" size={26} color="black"></EvilIcons>
            </TouchableOpacity>
          </View>
          <Audio navigation={this.props.navigation}></Audio>
          <PlaySongList></PlaySongList>
        </>
      );
    }
  }

  export default Homepage;