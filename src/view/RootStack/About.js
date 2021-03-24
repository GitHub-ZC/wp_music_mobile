import axios from 'axios';
import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking, ToastAndroid } from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Qgroup from '../../uitl/Qgroup';

const BLOG = "https://blog.iecoxe.top";


/* 关于软件的信息页面 */
class About extends Component {
    constructor(props) {
        super(props);
    }

    openUrl = async (url) => {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            // Opening the link with some app, if the URL scheme is "http" the web link should be opened
            // by some browser in the mobile
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    }

    version = async () => {
        let result = await axios.get('https://iecoxe.gitee.io/music-app/version.json', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0',
                'Cache-Control': 'no-cache'
            }
        });

        if (result.data.version === 'v1.3') {
            Alert.alert(
                `当前为最新版，无需更新`,
                result.data.message.join('\n')
            );
        } else {
            Alert.alert(
                `最新版：${result.data.version}`,
                result.data.message.join('\n'),
                [
                    {
                        text: "取消"
                    },
                    {
                        text: "加入QQ群",
                        onPress: () => Qgroup.joinQQGroup('xsxTwqp27yXEFDdAkv8AtZxYz466qykY')
                    }
                ]
            );
        }
    }

    render() {
        return (
            <>
                {/* 自定义头部导航栏 */}
                <View style={{
                    height: 50,
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    flexDirection: 'row',
                    alignItems: 'center',
                    elevation: 3
                }}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('主页')}>
                        <AntDesign name="arrowleft" size={24} color="black" style={{ marginLeft: 10 }}></AntDesign>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, marginLeft: 16 }}>关于软件</Text>
                </View>
                {/* 自定义头部导航栏 */}
                <ScrollView>
                    <View style={{ backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', height: 180 }}>
                        <Image
                            style={{
                                height: 100,
                                width: 100
                            }}
                            source={{
                                uri: 'https://iecoxe.gitee.io/music-app/music.png',
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0'
                                }
                            }}
                            onError={({ nativeEvent: { error } }) => ToastAndroid.show(`图片加载错误`, ToastAndroid.SHORT)}
                        />
                        <Text>wp music</Text>
                        <Text>v1.3</Text>
                    </View>
                    <TouchableOpacity onPress={this.version} style={{ backgroundColor: '#FFFFFF', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ marginLeft: 20, fontSize: 16 }}>
                            检查更新
                        </Text>
                        <AntDesign name="right" size={20} color="black" style={{ marginRight: 20 }}></AntDesign>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.openUrl(BLOG)} style={{ backgroundColor: '#FFFFFF', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ marginLeft: 20, fontSize: 16 }}>
                            个人网站
                        </Text>
                        <AntDesign name="right" size={20} color="black" style={{ marginRight: 20 }}></AntDesign>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Qgroup.joinQQGroup("TAHgwfynV6kUS3F-xATilHFZnLvHnbu9")} style={{ backgroundColor: '#FFFFFF', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ marginLeft: 20, fontSize: 16 }}>
                            QQ交流群
                        </Text>
                        <AntDesign name="right" size={20} color="black" style={{ marginRight: 20 }}></AntDesign>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Qgroup.joinQQGroup('xsxTwqp27yXEFDdAkv8AtZxYz466qykY')} style={{ backgroundColor: '#FFFFFF', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ marginLeft: 20, fontSize: 16 }}>
                            APP交流群
                        </Text>
                        <AntDesign name="right" size={20} color="black" style={{ marginRight: 20 }}></AntDesign>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: '#FFFFFF', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ marginLeft: 20, fontSize: 16 }}>
                            拾荒者
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </>
        );
    }
}

export default About;