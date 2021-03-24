import React, { Component } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';


import Homepage from './Homepage';
import About from "./RootStack/About";
import { View } from 'react-native';

const Drawer = createDrawerNavigator();

class Root extends Component {
    render() {
        return (
            <Drawer.Navigator initialRouteName="主页" drawerContentOptions={{
                itemStyle: {
                    marginLeft: 0,
                    marginRight: 0
                }
            }}
            >
                <Drawer.Screen name="主页" component={Homepage} />
                {/* <Drawer.Screen name="设置" component={NotificationsScreen} /> */}
                <Drawer.Screen name="关于" component={About} />
            </Drawer.Navigator>
        );
    }
}

export default Root;