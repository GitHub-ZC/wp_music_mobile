import React, { Component } from "react";
import {
    Modal,
    Text,
    TouchableNativeFeedback,
    TouchableWithoutFeedback,
    View,
    ToastAndroid,
    TouchableOpacity,
    FlatList,
    RefreshControl
} from "react-native";

import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from "react-redux";

import get_kg_url from '../uitl/axios/kg';
import get_wy_url from '../uitl/axios/wy';
import get_qq_url from '../uitl/axios/qq';
import get_mg_url from '../uitl/axios/mg';
import get_kw_url from '../uitl/axios/kw';
import storage from '../storage';


const mapStateToProps = (state) => {
    return {
        PlaySongListVisible: state.CommonState.PlaySongListVisible,
        Function_flush_playlist: state.CommonState.Function_flush_playlist
    }
}

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
                    dispatch({ type: 'activeAlbumId', data: item.albumId });
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
            dispatch({ type: 'setActiveId', data: item.id });
            dispatch({ type: 'setActiveSong', data: item.songName });
            dispatch({ type: 'setActiveSinger', data: item.songSinger });
            dispatch({ type: 'setActiveAlbum', data: item.songAlbum });
            dispatch({ type: 'setActiveImage', data: item.songImage });
            dispatch({ type: 'setPaused', data: true });
        }
    };
}

class PlaySongList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            //网络请求状态
            error: false,
            errorInfo: "",
            dataArray: [],
            isRefreshing: false,//下拉控制
            playModel: ''
        }
    }

    GetStorageData = async () => {
        try {
            this.props.setCommonState('setFunction_flush_playsonglist', this.GetStorageData);
            let ret = await storage.load({
                key: 'playlist',
                id: '播放列表',
                autoSync: false,
                syncInBackground: false
            });
            let playModel = await storage.load({
                key: 'audio',
                id: 'playModel',
                autoSync: false,
                syncInBackground: false
            });
            this.setState({ dataArray: ret, isRefreshing: false, playModel: playModel === 'list' ? '列表循环' : '单曲循环' });
        } catch (error) {
            this.setState({ isRefreshing: false });
            // ToastAndroid.show('播放列表读取错误，清空缓存重试，实在不行重装APP', ToastAndroid.SHORT);
        }
    }

    componentDidMount() {
        //请求数据
        this.GetStorageData();
    }

    // shouldComponentUpdate(newProps,newState) {
    //     console.log(newProps, newState);
    //     return true;
    // }

    handleRefresh = () => {
        this.setState({
            isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
            // dataArray: []
        });
        this.GetStorageData();
    }

    delFromPlaylist = async (id) => {
        try {
            var songPlaylist = await storage.load({
                key: 'playlist',
                id: '播放列表',
                autoSync: false,
                syncInBackground: false
            });
        } catch (error) {
            ToastAndroid.show('播放列表读取错误，清空缓存重试，实在不行重装APP', ToastAndroid.SHORT);
        }
        // 循环匹对id
        for (let index in songPlaylist) {
            if (songPlaylist[index].id === id) {
                songPlaylist.splice(parseInt(index), 1);
                storage.save({
                    key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                    id: "播放列表", // 注意:请不要在id中使用_下划线符号!
                    data: songPlaylist
                });
                this.setState({ dataArray: songPlaylist });
                return;
            }
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
    _keyExtractor = (item, index) => `${item.topId}${index}`;

    //加载失败view
    renderErrorView() {
        return (
            <>
                <MusicSourceSwitch setStateMusicSource={this.setStateMusicSource} _musicSource={this.state.musicSource}></MusicSourceSwitch>
                <TouchableWithoutFeedback onPress={
                    () => {
                        this.setState({
                            error: false,
                            dataArray: [],
                            isLoading: true
                        });
                        this.AxiosGetData();
                    }
                }>
                    <View style={styles.container}>
                        <Text>
                            {this.state.errorInfo}
                        </Text>
                        <Text>点击刷新</Text>
                    </View>
                </TouchableWithoutFeedback>
            </>
        );
    }

    //返回itemView
    _renderItemView = ({ item }) => {
        return (
            <TouchableNativeFeedback onPress={() => this.props.playSong(item)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 40, paddingHorizontal: 20 }}>
                    <Text numberOfLines={1} style={{ width: '85%' }}>{item.songName} - {item.songSinger}</Text>
                    <TouchableNativeFeedback
                        background={TouchableNativeFeedback.Ripple('rgb(0,0,0,0.3)', true, 20)}
                        onPress={() => this.delFromPlaylist(item.id)}
                    >
                        <View style={{ height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}>
                            <AntDesign name="closecircleo" size={18} color="black"></AntDesign>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </TouchableNativeFeedback>
        );
    }

    _renderFooter = () => {
        return (
            <View style={{ height: 30, alignItems: 'center', justifyContent: 'flex-start' }}>
            </View>
        );
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                hardwareAccelerated={true}
                visible={this.props.PlaySongListVisible}
                onRequestClose={() => {
                    this.props.setCommonState('setPlaySongListVisible', false);
                    // 刷新首页歌单数据
                    this.props.Function_flush_playlist();
                }}
            >
                <TouchableWithoutFeedback onPress={() => {
                    this.props.setCommonState('setPlaySongListVisible', false); // 刷新首页歌单数据
                    this.props.Function_flush_playlist();
                }}>
                    <View style={{ position: 'absolute', bottom: 0, top: 0, right: 0, left: 0 }}>
                    </View>
                </TouchableWithoutFeedback>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{
                        height: '60%',
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5
                    }}>
                        {/* 播放列表头部 */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 60, alignItems: 'center', paddingHorizontal: 20 }}>
                            <TouchableOpacity onPress={async () => {
                                try {
                                    let ret = await storage.load({
                                        key: 'audio',
                                        id: 'playModel',
                                        autoSync: false,
                                        syncInBackground: false
                                    });
                                    if (ret === 'list') {
                                        storage.save({
                                            key: 'audio',
                                            id: 'playModel',
                                            data: 'single'
                                        });
                                        this.setState({ playModel: '单曲循环' });
                                    } else {
                                        storage.save({
                                            key: 'audio',
                                            id: 'playModel',
                                            data: 'list'
                                        });
                                        this.setState({ playModel: '列表循环' });
                                    }
                                } catch (error) {
                                    ToastAndroid.show(`播放顺序获取错误`, ToastAndroid.SHORT);
                                }
                            }} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                {
                                    this.state.playModel === '列表循环' ? <AntDesign name="bars" size={20} color="black"></AntDesign>
                                        : <AntDesign name="sync" size={16} color="black"></AntDesign>
                                }
                                <Text>{this.state.playModel}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                storage.save({
                                    key: 'playlist',
                                    id: '播放列表',
                                    data: []
                                });
                                this.setState({ dataArray: [] });
                            }}>
                                <AntDesign name="delete" size={20} color="black"></AntDesign>
                            </TouchableOpacity>
                        </View>
                        {/* 播放列表头部 */}
                        {/* 歌曲部分 */}
                        <FlatList
                            // contentContainerStyle={{ marginHorizontal: 20}}
                            data={this.state.dataArray}
                            renderItem={this._renderItemView}
                            ListFooterComponent={this._renderFooter}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={(data, index) => (
                                { length: 40, offset: 40 * index, index }
                            )}
                            //为刷新设置颜色
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.isRefreshing}
                                    onRefresh={this.handleRefresh}//因为涉及到this.state
                                    progressBackgroundColor="#ffffff"
                                />
                            }
                        />
                        {/* 歌曲部分 */}
                    </View>
                </View>
            </Modal>
        );
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(PlaySongList);