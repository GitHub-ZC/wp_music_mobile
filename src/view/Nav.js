import React, { Component } from 'react';
import { Dimensions, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import Root from './Root';
import Search from './RootStack/Search';
import SongDetails from './RootStack/SongDetails';
import LeaderboardDetails from './RootStack/LeaderboardDetails';
import PlayList from './RootStack/PlayList';


const Stack = createStackNavigator();



function Nav () {
  return (
    <>
      <StatusBar backgroundColor="#FFFFFF" barStyle='dark-content'></StatusBar>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Root" component={Root} options={{
            headerShown: false
          }} />
          <Stack.Screen name="SongDetails" component={SongDetails} options={{
            // headerShown: false,
            headerTransparent: true,
            headerTitle: '',
            // 设置手势从上往下返回上一级路由
            gestureEnabled: true,
            gestureDirection: 'vertical',
            // 手值下滑的响应距离
            gestureResponseDistance: {
              vertical: Dimensions.get('window').height - 160
            }
          }} />
          <Stack.Screen name="Search" component={Search} options={{
            headerTransparent: true,
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              height: 50
            },
            headerBackground:() => (<View style={{backgroundColor: '#FFFFFF', width: '100%', height: 50}}></View>)
            // gestureEnabled: true
          }} />
          <Stack.Screen name="LeaderboardDetails" component={LeaderboardDetails} options={{
            // headerShown: false
            // headerTransparent: true,
            headerTitle: '排行榜'
          }} />
          <Stack.Screen name="PlayList" component={PlayList} options={{
            // headerShown: false
            headerTransparent: true,
            headerTitle: '',
            headerBackground:() => (<View style={{backgroundColor: '#FFFFFF', width: '100%', height: 50, elevation: 1}}></View>),
            headerShown: true,
            headerStyle: {
              height: 50
            }
          }} />
        </Stack.Navigator>
      </NavigationContainer>
      {/* <Audio></Audio> */}
    </>
  );
}

export default Nav;