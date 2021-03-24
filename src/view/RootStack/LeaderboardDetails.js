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
        playSong: async (item, musicSource) => {
            try {
                if (musicSource === 'QQ') {
                    var URL = await get_qq_url(item.id);
                } else if (musicSource === 'WY') {
                    var URL = await get_wy_url(item.id);
                } else if (musicSource === 'KG') {
                    var { URL, img } = await get_kg_url(item.id, item.albumId);
                    dispatch({ type: 'setActiveAlbumId', data: item.albumId });
                    item.songImage = img;
                } else if (musicSource === 'MG') {
                    var URL = await get_mg_url(item.id);
                } else if (musicSource === 'KW') {
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
            dispatch({ type: 'setActiveMusicSource', data: musicSource });
            dispatch({ type: 'setActiveId', data: item.id });
            dispatch({ type: 'setActiveSong', data: item.songName });
            dispatch({ type: 'setActiveSinger', data: item.songSinger });
            dispatch({ type: 'setActiveAlbum', data: item.songAlbum });
            dispatch({ type: 'setActiveImage', data: item.songImage });
            dispatch({ type: 'setPaused', data: true });
        },
        // 每次点击打开模态框，传递相关的歌曲信息
        setModal: async (item, musicSource) => {
            dispatch({ type: 'setModalImage', data: item.songImage });
            dispatch({ type: 'setModalSongName', data: item.songName });
            dispatch({ type: 'setModalSinger', data: item.songSinger });
            dispatch({ type: 'setModalId', data: item.id });
            dispatch({ type: 'setModalMusicSource', data: musicSource });
            dispatch({ type: 'setModalSongAlbum', data: item.songAlbum });
            if (musicSource === 'KG') {
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

class LeaderboardDetails extends PureComponent {
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
    //网络请求——获取数据
    AxiosGetData = async () => {
        try {
            // console.log(this.props.route.params.musicSource);
            let LeaderboardArray = [];
            /* 排行榜详情，判断 当前属于哪一个音乐源 */
            if (this.props.route.params.musicSource === 'QQ') {
                let result = await axios.get(WP_MUSIC_URL.QQ_TOP, {
                    params: {
                        topId: this.props.route.params.topId,
                        limit: 300
                    }
                });
                result.data.detail.data.songInfoList.map(song => {
                    LeaderboardArray.push({
                        id: song.mid,
                        songName: song.name,
                        songAlbum: song.album ? song.album.name : '',
                        songSinger: song.singer.map(value => value.name).join('·'),
                        songImage: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg`,
                        musicSource: 'QQ'
                    })
                })
            } else if (this.props.route.params.musicSource === 'WY') {
                let result = await axios.get(WP_MUSIC_URL.WY_TOP, {
                    params: {
                        id: this.props.route.params.topId
                    }
                });
                result.data.playlist.tracks.map(song => {
                    LeaderboardArray.push({
                        id: song.id,
                        songName: song.name,
                        songAlbum: song.al ? song.al.name : '',
                        songSinger: song.ar ? song.ar.map(value => value.name).join('·') : '',
                        songImage: song.al ? song.al.picUrl : 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3390212471,1883165446&fm=26&gp=0.jpg',
                        musicSource: 'WY'
                    })
                })
            } else if (this.props.route.params.musicSource === 'KG') {
                let result = await axios.get(WP_MUSIC_URL.KUGOU_TOP, {
                    params: {
                        topId: this.props.route.params.topId
                    }
                });
                /* 获取酷狗音乐的总歌曲数，因为酷狗排行榜后端走的爬虫接口，默认30首歌曲 */
                let page = Math.ceil(parseInt(result.data.total) / 30);

                if (page >= 6) {
                    page = 6;
                }

                result.data.data.map(song => {
                    LeaderboardArray.push({
                        id: song.hash,
                        songName: song.songname,
                        songAlbum: song.album_name,
                        songSinger: song.singername,
                        albumId: song.album_id,
                        musicSource: 'KG'
                    })
                });

                for (let i = 2; i <= page; i++) {
                    let result = await axios.get(WP_MUSIC_URL.KUGOU_TOP, {
                        params: {
                            topId: this.props.route.params.topId,
                            offset: i
                        }
                    });
                    result.data.data.map(song => {
                        LeaderboardArray.push({
                            id: song.hash,
                            songName: song.songname,
                            songAlbum: song.album_name,
                            songSinger: song.singername,
                            albumId: song.album_id,
                            musicSource: 'KG'
                        })
                    });
                }
            } else if (this.props.route.params.musicSource === 'KW') {
                let result = await axios.get(WP_MUSIC_URL.KUWO_TOP, {
                    params: {
                        topId: this.props.route.params.topId,
                        limit: 100
                    }
                });
                /* 酷我排行榜分类处理 */
                result.data.data.musicList.map(song => {
                    LeaderboardArray.push({
                        id: song.rid,
                        songName: song.name,
                        songAlbum: song.album,
                        songSinger: song.artist,
                        songImage: song.albumpic,
                        musicSource: 'KW'
                    })
                })
            } else if (this.props.route.params.musicSource === 'MG') {
                let result = await axios.get(WP_MUSIC_URL.MIGU_TOP, {
                    params: {
                        topId: this.props.route.params.topId
                    }
                });
                /* 酷我排行榜分类处理 */
                result.data.songs.items.map(song => {
                    LeaderboardArray.push({
                        id: song.copyrightId,
                        songName: song.name,
                        songAlbum: song.album ? song.album.albumName : '',
                        songSinger: song.singers ? song.singers.map(value => value.name).join('·') : '',
                        songImage: `http:${song.mediumPic}`,
                        musicSource: 'MG'
                    })
                })
            }

            this.setState({
                dataArray: LeaderboardArray,
                isLoading: false,
                isRefreshing: false
            });
            LeaderboardArray = null;
        } catch (error) {
            this.setState({
                error: true,
                errorInfo: error.toString()
            })
        }
    }

    componentDidMount() {
        //请求数据
        this.AxiosGetData();
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
        this.AxiosGetData();
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
                this.props.playSong(item, this.props.route.params.musicSource);
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
                    <TouchableNativeFeedback onPress={() => { this.props.setModal(item, this.props.route.params.musicSource); this.props.setCommonState('setModalVisible', true) }} background={TouchableNativeFeedback.Ripple('#DDDDDD', true, 24)}>
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
                <SongModal></SongModal>
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
            <View style={{ height: 90, alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#FFFFFF' }}>
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

export default connect(mapStateToProps, mapDispatchToProps)(LeaderboardDetails);