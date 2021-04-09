import React, { Component } from 'react';
import { Text, FlatList, StyleSheet, View, Image, RefreshControl, TouchableNativeFeedback, ActivityIndicator, TouchableWithoutFeedback, ToastAndroid, Pressable, Dimensions, Alert } from 'react-native';

import storage from '../../storage';
import AntDesign from 'react-native-vector-icons/AntDesign';

import { connect } from "react-redux";
import Qgroup from '../../uitl/Qgroup';

// WP_MUSIC地址映射
import PlayListInput from '../../component/PlayListInput';

import get_kg_url from '../../uitl/axios/kg';
import get_wy_url from '../../uitl/axios/wy';
import get_qq_url from '../../uitl/axios/qq';
import get_mg_url from '../../uitl/axios/mg';
import get_kw_url from '../../uitl/axios/kw';

import axios from 'axios';


const mapDispatchToProps = (
    dispatch
) => {
    return {
        setCommonState: (type, data) => {
            dispatch({
                type,
                data
            });
        },
        /* 播放歌曲 */
        playSong: async (item) => {
            try {
                if (item.musicSource === 'QQ') {
                    var URL = await get_qq_url(item.id);
                } else if (item.musicSource === 'WY') {
                    var URL = await get_wy_url(item.id);
                } else if (item.musicSource === 'KG') {
                    var { URL, img } = await get_kg_url(item.id, item.albumId);
                    dispatch({ type: 'setActiveAlbumId', data: item.albumId });
                    item.songImage = img;
                } else if (item.musicSource === 'MG') {
                    var URL = await get_mg_url(item.id);
                } else if (item.musicSource === 'KW') {
                    var URL = await get_kw_url(item.id);
                }
            } catch (error) {
                ToastAndroid.show("数据请求错误，请刷新重试", ToastAndroid.SHORT);
                return;
            }

            // 判断音乐有无链接
            if (URL.length === 0) {
                ToastAndroid.show("无音乐资源", ToastAndroid.SHORT);
                return;
            }

            // 为app底部的播放框提供歌曲信息
            dispatch({ type: 'setActiveUri', data: URL });
            dispatch({ type: 'setActiveMusicSource', data: item.musicSource });
            dispatch({ type: 'setActiveId', data: item.id });
            dispatch({ type: 'setActiveSong', data: item.songName });
            dispatch({ type: 'setActiveSinger', data: item.songSinger });
            dispatch({ type: 'setActiveAlbum', data: item.songAlbum });
            dispatch({ type: 'setActiveImage', data: item.songImage });
            dispatch({ type: 'setPaused', data: true });
        }
    };
}

class Me extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            //网络请求状态
            error: false,
            errorInfo: "",
            dataArray: [],
            isRefreshing: false,//下拉控制
            modalInputTitle: '新建歌单'
        }
    }

    GetStorageData = async () => {
        try {
            let ids = await storage.getIdsForKey('playlist');
            let ret = await storage.getAllDataForKey('playlist');

            let item = [];
            for (let i in ret) {
                item.push({
                    name: ids[i],
                    image: ret[i][0] ? ret[i][0].songImage : 'https://iecoxe.gitee.io/music-app/album.png',
                    sum: ret[i].length
                })
            }

            this.setState({ dataArray: item, isLoading: false, isRefreshing: false });
            ids = null;
            ret = null;
            item = null;
        } catch (error) {
            this.setState({ isLoading: false, isRefreshing: false });
            ToastAndroid.show('歌单列表读取错误，清空缓存重试，实在不行重装APP', ToastAndroid.SHORT);
        }
    }

    async componentDidMount() {
        this.props.setCommonState('setFunction_flush_playlist', this.GetStorageData);
        let result = await axios.get('https://iecoxe.gitee.io/music-app/version.json', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0',
                'Cache-Control': 'no-cache'
            }
        });
        try {
            await storage.load({ key: 'playlist', id: '新建歌单' });
            await storage.load({ key: 'playlist', id: '导入歌单' });
            // storage.clearMap();
        } catch (error) {
            ToastAndroid.show('初始化APP', ToastAndroid.SHORT);
            storage.save({
                key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                id: '新建歌单', // 注意:请不要在id中使用_下划线符号!
                data: [{ songImage: 'https://iecoxe.gitee.io/music-app/newPlayList.png' }]
            });
            storage.save({
                key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                id: '导入歌单', // 注意:请不要在id中使用_下划线符号!
                data: [{ songImage: 'https://iecoxe.gitee.io/music-app/import.png' }]
            });
            storage.save({
                key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                id: '播放列表', // 注意:请不要在id中使用_下划线符号!
                data: []
            });
            storage.save({
                key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                id: '播放历史', // 注意:请不要在id中使用_下划线符号!
                data: []
            });
            storage.save({/* 播放顺序 */
                key: 'audio',
                id: 'playModel',
                data: 'list'
            });
            Alert.alert(
                `版本介绍`,
                result.data.message.join('\n')
            );
        }

        if (result.data.version !== 'v1.31') {
            // 强制更新
            if (result.data.ForcedToUpgrade) {
                Alert.alert('', '强制更新', []);
                Alert.alert(
                    `最新版：${result.data.version}`,
                    result.data.message.join('\n'),
                    [
                        {
                            text: "加入QQ群",
                            onPress: () => Qgroup.joinQQGroup('xsxTwqp27yXEFDdAkv8AtZxYz466qykY')
                        }
                    ]
                );
                return;
            }
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

        //请求数据
        this.GetStorageData();
    }

    /* 组件销毁中清理异步操作和取消请求 */
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        }
    }

    handleRefresh = () => {
        this.setState({
            isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
            // dataArray: []
        });
        this.GetStorageData();
    }

    itemClick = (name) => {
        if (name === '新建歌单' || name === '导入歌单') {
            this.setState({ modalInputTitle: name });
            this.props.setCommonState('setPlayListInputVisible', true);
        } else {
            this.props.navigation.navigate('PlayList', { title: name });
        }
    }

    itemLongClick = (name) => {
        if (name === '新建歌单' || name === '导入歌单') {
            return;
        } else if (name === '播放列表' || name === '播放历史') {
            ToastAndroid.show('默认歌单不可以修改', ToastAndroid.SHORT);
        } else {
            this.setState({ modalInputTitle: name });
            this.props.setCommonState('setPlayListInputVisible', true);
        }
    }

    // 添加歌曲到播放列表，并且播放第一首歌曲
    addPlayList = async (name) => {
        try {
            let ret = await storage.load({
                key: 'playlist',
                id: name,
                autoSync: false,
                syncInBackground: false
            });

            if (ret.length === 0) {
                ToastAndroid.show(`${name} 歌单为空`, ToastAndroid.SHORT);
                return;
            }

            if (name !== '播放列表') {
                storage.save({
                    key: 'playlist',
                    id: '播放列表',
                    data: ret
                });
                // 添加歌单到播放列表，刷新组件
                this.GetStorageData();
            }

            this.props.playSong(ret[0]);
        } catch (error) {
            ToastAndroid.show(`${name} 歌曲列表读取错误`, ToastAndroid.SHORT);
        }
    }

    //加载等待页
    renderLoadingView() {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    animating={true}
                    color='#000000'
                    size="large"
                />
            </View>
        );
    }

    // 用于设置虚拟dom的key
    _keyExtractor = (item, index) => `${item}${index}`;

    //加载失败view
    renderErrorView() {
        return (
            <TouchableWithoutFeedback onPress={
                () => {
                    this.setState({
                        error: false,
                        dataArray: [],
                        isLoading: true
                    });
                    this.GetStorageData();
                }
            }>
                <View style={styles.container}>
                    <Text>
                        {this.state.errorInfo}
                    </Text>
                    <Text>点击刷新</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    //返回itemView
    _renderItemView = ({ index, item }) => {
        return (
            <Pressable
                style={{ backgroundColor: '#FFFFFF', width: '88%', borderRadius: 10 }}
                android_ripple={{ color: 'rgb(0,0,0,0.3)' }}
                delayLongPress={700}
                onPress={() => this.itemClick(item.name)}
                onLongPress={() => this.itemLongClick(item.name)}
            >
                <View style={styles.PlayListBox}>
                    <View style={{ width: '80%', flexDirection: 'row' }}>
                        <Image
                            style={styles.PlayListImage}
                            source={{
                                uri: item.image ? item.image : 'https://iecoxe.gitee.io/music-app/album.png',
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0'
                                }
                            }}
                            onError={({ nativeEvent: { error } }) => console.log(error)}
                        />
                        <View style={styles.PlayListView}>
                            <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
                            {
                                item.name !== '导入歌单' && item.name !== '新建歌单' &&
                                <Text numberOfLines={1} style={styles.content}>{item.sum}首</Text>
                            }
                        </View>
                    </View>
                    {
                        item.name !== '导入歌单' && item.name !== '新建歌单' &&
                        <TouchableNativeFeedback
                            onPress={() => this.addPlayList(item.name)}
                            background={TouchableNativeFeedback.Ripple('rgb(0,0,0,0.3)', true, 30)}
                        >
                            <View style={{ width: '20%', height: 70, justifyContent: 'center', alignItems: 'center' }}>
                                <AntDesign name="playcircleo" size={26} color="black"></AntDesign>
                            </View>
                        </TouchableNativeFeedback>
                    }
                </View>
            </Pressable>
        );
    }

    renderData = () => {
        return (
            <>
                <FlatList
                    contentContainerStyle={{ marginTop: 10, marginBottom: 50, alignItems: 'center' }}
                    data={this.state.dataArray}
                    extraData={this.state.extraData}
                    renderItem={this._renderItemView}
                    ListFooterComponent={this._renderFooter}
                    ItemSeparatorComponent={this._separator}
                    keyExtractor={this._keyExtractor}
                    //为刷新设置颜色
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.handleRefresh}//因为涉及到this.state
                            progressBackgroundColor="#ffffff"
                        />
                    }
                />
                <PlayListInput GetStorageData={this.GetStorageData} title={this.state.modalInputTitle}></PlayListInput>
            </>
        );
    }

    render() {
        //第一次加载等待的view
        if (this.state.isLoading && !this.state.error) {
            return this.renderLoadingView();
        } else if (this.state.error) {
            //请求失败view
            return this.renderErrorView();
        }
        //加载数据
        return this.renderData();
    }
    _separator() {
        return <View style={{ height: 10, backgroundColor: 'transparent' }} />;
    }
    _renderFooter = () => {
        return (
            <View style={{ height: 90, alignItems: 'center', justifyContent: 'flex-start' }}>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        padding: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 16,
        color: 'black',
        opacity: 0.8
    },
    content: {
        fontSize: 14,
        color: 'black',
        opacity: 0.5
    },
    PlayListBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: Dimensions.get("window").width - 40,
        height: 60,
        borderRadius: 10
    },
    PlayListImage: {
        width: 57,
        height: 57,
        marginLeft: 3,
        borderRadius: 10
    },
    PlayListView: {
        paddingLeft: 10,
        width: '70%',
        justifyContent: 'space-around'
    }
});

export default connect(null, mapDispatchToProps)(Me);