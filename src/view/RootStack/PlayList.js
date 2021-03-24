import React, { PureComponent } from 'react';
import { Text, FlatList, StyleSheet, View, ToastAndroid, RefreshControl, TouchableNativeFeedback, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';

import { connect } from "react-redux";

import Audio from '../../component/Audio';
import SongModal from "../../component/SongModal";
import Entypo from 'react-native-vector-icons/Entypo';
import storage from '../../storage';

import WP_MUSIC_URL from '../../uitl/urlMapConstant';
import get_kg_url from '../../uitl/axios/kg';
import get_wy_url from '../../uitl/axios/wy';
import get_qq_url from '../../uitl/axios/qq';
import get_mg_url from '../../uitl/axios/mg';
import get_kw_url from '../../uitl/axios/kw';

import axios from 'axios';


const mapStateToProps = (state) => {
    return {
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
        // 播放音乐
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

            // 无音乐资源直接弹出提示
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
        },
        // 每次点击打开模态框，传递相关的歌曲信息
        setModal: async (item) => {
            dispatch({ type: 'setModalImage', data: item.songImage });
            dispatch({ type: 'setModalSongName', data: item.songName });
            dispatch({ type: 'setModalSinger', data: item.songSinger });
            dispatch({ type: 'setModalId', data: item.id });
            dispatch({ type: 'setModalMusicSource', data: item.musicSource });
            dispatch({ type: 'setModalSongAlbum', data: item.songAlbum });
            if (item.musicSource === 'KG') {
                try {
                    let result = await axios.get(WP_MUSIC_URL.KUGOU_SONG, {
                        params: {
                            hash: item.id
                        }
                    });
                    let img = result.data.data.img;
                    dispatch({ type: 'setModalImage', data: img });
                } catch (error) {
                    dispatch({ type: 'setModalImage', data: 'https://iecoxe.gitee.io/music-app/defaultAlbum.jpg' });
                }
                dispatch({ type: 'setModalAlbumId', data: item.albumId });
            }
        }
    };
}

class PlayList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            //网络请求状态
            error: false,
            errorInfo: "",
            dataArray: [],
            isRefreshing: false,//下拉控制
        }
    }

    GetStroageData = async () => {
        try {
            let ret = await storage.load({
                key: 'playlist',
                id: this.props.route.params.title,
                autoSync: false,
                syncInBackground: false
            });
            this.setState({ dataArray: ret, isLoading: false, isRefreshing: false });
        } catch (error) {
            ToastAndroid.show("歌单列表获取失败", ToastAndroid.SHORT);
            this.setState({ isLoading: false, isRefreshing: false });
        }
    }

    componentDidMount() {
        //请求数据
        this.GetStroageData();
    }

    // UNSAFE_componentWillUpdate() {
    //     console.log("排行榜更新");
    // }

    /* 组件销毁中清理异步操作和取消请求 */
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        }
        // 刷新首页歌单数据
        this.props.Function_flush_playlist();
    }

    handleRefresh = () => {
        this.setState({
            isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
            // dataArray:[]
        });
        this.GetStroageData();
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

    _keyExtractor = (item, index) => `${item.id}${index}`;
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
        );
    }

    //返回itemView
    _renderItemView = ({ item, index }) => {
        return (
            <TouchableNativeFeedback onPress={() => {
                this.props.playSong(item);
                storage.save({
                    key: 'playlist',
                    id: '播放列表',
                    data: this.state.dataArray
                });
            }}>
                <View style={styles.songBox}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.songIndex}>
                            <Text style={styles.songIndexText}>{parseInt(index) + 1}</Text>
                        </View>
                        <View style={{ alignSelf: 'center', width: '70%' }}>
                            <Text numberOfLines={1} style={styles.title}>{item.songName}</Text>
                            <Text numberOfLines={1} style={styles.content}>{`${item.songSinger} - ${item.songAlbum}`}</Text>
                        </View>
                    </View>
                    <TouchableNativeFeedback onPress={() => { this.props.setModal(item); this.props.setCommonState('setModalVisible', true) }} background={TouchableNativeFeedback.Ripple('#DDDDDD', true, 24)}>
                        <View style={{ width: 50, height: 60, justifyContent: 'center', alignItems: 'center' }}>
                            <Entypo name="dots-three-vertical" size={18} color="black"></Entypo>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </TouchableNativeFeedback>
        );
    }

    renderData() {
        return (
            <>
                {/* 自定义头部导航栏 */}
                <View style={{
                    height: 50,
                    width: '100%',
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    zIndex: 100,
                    marginLeft: '14%'
                }}>
                    <Text style={{ fontSize: 18 }}>{ this.props.route.params.title }</Text>
                </View>
                {/* 自定义头部导航栏 */}
                <FlatList
                    // contentContainerStyle={{alignItems: 'center'}}
                    data={this.state.dataArray}
                    getItemLayout={(data, index) => (
                        { length: 60, offset: 60 * index, index }
                    )}
                    renderItem={this._renderItemView}
                    ListFooterComponent={this._renderFooter}
                    // ListHeaderComponent={this._renderHeader}
                    // onEndReached={this._onEndReached.bind(this)}
                    // onEndReachedThreshold={0.1}
                    // ItemSeparatorComponent={this._separator}
                    keyExtractor={this._keyExtractor}
                    initialNumToRender={12}
                    // windowSize={10}
                    //为刷新设置颜色
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.handleRefresh}//因为涉及到this.state
                            progressBackgroundColor="#ffffff"
                        />
                    }
                />
                <Audio navigation={this.props.navigation}></Audio>
                <SongModal GetStroageData={this.GetStroageData} playlistflag={true} title={this.props.route.params.title}></SongModal>
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

    _renderFooter = () => {
        return (
            <View style={{ height: 90, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
                <Text>没有更多数据了</Text>
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
    songBox: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
        height: 60
    },
    songIndex: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 60,
        alignItems: 'center',
        opacity: 0.5
    },
    songIndexText: {
        justifyContent: 'center'
    },
    title: {
        fontSize: 15,
        // color: '#ffa700'
    },
    footer: {
        flexDirection: 'row',
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    content: {
        fontSize: 14,
        color: 'black',
        opacity: 0.4,
        marginTop: 4
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayList);