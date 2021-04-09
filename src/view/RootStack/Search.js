import React, { Component } from 'react';
import { Text, FlatList, TextInput, StyleSheet, View, RefreshControl, ActivityIndicator, TouchableOpacity, ToastAndroid, TouchableNativeFeedback, TouchableWithoutFeedback } from 'react-native';

import Audio from '../../component/Audio';
import InputMusicSourceSwitch from '../../component/InputMusicSourceSwitch';
import Entypo from 'react-native-vector-icons/Entypo';
import SongModal from "../../component/SongModal";

import WP_MUSIC_URL from "../../uitl/urlMapConstant";
import axios from 'axios';

import get_kg_url from '../../uitl/axios/kg';
import get_wy_url from '../../uitl/axios/wy';
import get_qq_url from '../../uitl/axios/qq';
import get_mg_url from '../../uitl/axios/mg';
import get_kw_url from '../../uitl/axios/kw';

import { connect } from "react-redux";
import storage from '../../storage';

let totalPage = 16;//总的页数

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
            dispatch({ type: 'setActiveId', data: item.id });
            dispatch({ type: 'setActiveMusicSource', data: item.musicSource });
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
    }
}

// 映射state属性
const mapStateToProps = (state) => {
    return {
        musicSource: state.CommonState.musicSource,            // 音乐源
        Function_flush_playlist: state.CommonState.Function_flush_playlist
    }
}


class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            // isLoading: true,
            SearchData: [],/* 热门搜索 */
            HistoryData: [],/* 历史搜索 */
            //网络请求状态
            error: false,
            errorInfo: "",
            dataArray: [],
            showFoot: 0, // 控制foot， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
            isRefreshing: false,//下拉控制
            musicSource: props.musicSource,
            value: ''
        }
    }
    /* 获取每个音乐源的热搜数据 代码开始*/
    AxiosGetHotSearch = async () => {
        try {
            let hotDataArr = [];
            if (this.state.musicSource === 'QQ') {
                let result = await axios.get(WP_MUSIC_URL.QQ_HOTSEARCH);

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: error
                    });
                }
                /* 遍历每个人QQ热搜词对象，提取热搜词和热搜词描述 */
                result.data.map(hotWord => {
                    hotDataArr.push({
                        title: hotWord.title,
                        description: hotWord.description
                    })
                })
            } else if (this.state.musicSource === 'WY') {
                let result = await axios.get(WP_MUSIC_URL.WY_HOTSEARCH);

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: error
                    });
                }
                /* 遍历每个人WY热搜词对象，提取热搜词和热搜词描述 */
                result.data.data.map(hotWord => {
                    hotDataArr.push({
                        title: hotWord.searchWord,
                        description: hotWord.content
                    })
                })
            } else if (this.state.musicSource === 'MG') {
                let result = await axios.get(WP_MUSIC_URL.MIGU_HOTSEARCH);

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: error
                    });
                }
                /* 遍历每个人MG热搜词对象，提取热搜词和热搜词描述 */
                result.data.data.hotwords[0].hotwordList.map(hotWord => {
                    hotDataArr.push({
                        title: hotWord.word,
                        description: ''
                    })
                })
            } else if (this.state.musicSource === 'KW') {
                let result = await axios.get(WP_MUSIC_URL.KUWO_HOTSEARCH);

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: error
                    });
                }
                /* 遍历每个人KW热搜词对象，提取热搜词和热搜词描述 */
                result.data.data.map(hotWord => {
                    hotDataArr.push({
                        title: hotWord.key,
                        description: hotWord.describe
                    })
                })
            } else if (this.state.musicSource === 'KG') {
                let result = await axios.get(WP_MUSIC_URL.KUGOU_HOTSEARCH);

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: error
                    });
                }
                /* 遍历每个人KG热搜词对象，提取热搜词和热搜词描述 */
                result.data.data.list[0].keywords.map(hotWord => {
                    hotDataArr.push({
                        title: hotWord.keyword,
                        description: hotWord.reason
                    })
                })
            }

            /* 同以修改热搜的数组数据 */
            this.setState({
                SearchData: hotDataArr
            })
            hotDataArr = null;
        } catch (error) {
            this.setState({
                error: true,
                errorInfo: error.toString()
            })
        }
    }
    /* 获取每个音乐源的热搜数据 代码结束*/
    /* 网络请求——获取每一个音乐源的歌曲数据  代码开始*/
    AxiosGetData = async () => {
        try {
            let LeaderboardArray = [];

            if (this.state.value.trim().length === 0) {
                this.setState({ isRefreshing: false })
                return;
            }
            // 使用 条件 判断 排行榜当前属于 哪一个音乐源
            if (this.state.musicSource === 'QQ') {/* QQ音乐源的搜索数据处理 */
                let result = await axios.get(WP_MUSIC_URL.QQ_SEARCH, {
                    params: {
                        key: this.state.value,
                        offset: this.state.page
                    }
                });

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: error
                    })
                    return;
                }

                if (result.data.data.song.list.length === 0) {
                    this.setState({
                        showFoot: 1,
                        isRefreshing: false
                    });
                    return;
                }

                result.data.data.song.list.map(songIndex => {
                    LeaderboardArray.push({
                        id: songIndex.songmid,
                        songName: songIndex.songname,
                        songAlbum: songIndex.albumname,
                        songSinger: songIndex.singer.map(value => value.name).join('·'),
                        songImage: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${songIndex.albummid}.jpg`,
                        musicSource: 'QQ'
                    });
                })
            } else if (this.state.musicSource === 'WY') {/* 网易云音乐源的搜索数据处理 */
                let result = await axios.get(WP_MUSIC_URL.WY_SEARCH, {
                    params: {
                        keywords: this.state.value,
                        offset: (this.state.page - 1) * 30
                    }
                });

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: '数据请求失败 下拉刷新'
                    });
                    return;
                }

                if (!result.data.result) {
                    this.setState({
                        showFoot: 1,
                        isRefreshing: false
                    });
                    return;
                }

                if (result.data.result.songCount === 0) {
                    this.setState({
                        showFoot: 1,
                        isRefreshing: false
                    });
                    return;
                }

                result.data.result.songs.map(songIndex => {
                    LeaderboardArray.push({
                        id: songIndex.id,
                        songName: songIndex.name,
                        songAlbum: songIndex.al ? songIndex.al.name : '',
                        songSinger: songIndex.ar ? songIndex.ar.map(value => value.name).join('·') : '',
                        songImage: songIndex.al.picUrl,
                        musicSource: 'WY'
                    })
                })
            } else if (this.state.musicSource === 'KG') {/* 酷狗音乐源的搜索数据处理 */
                let result = await axios.get(WP_MUSIC_URL.KUGOU_SEARCH, {
                    params: {
                        key: this.state.value,
                        offset: this.state.page
                    }
                });

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: '数据请求失败 下拉刷新'
                    })
                    return;
                }

                if (JSON.stringify(result.data.data.lists) === '{}') {
                    this.setState({
                        showFoot: 1,
                        isRefreshing: false
                    });
                    return;
                }

                result.data.data.lists.map(songIndex => {
                    LeaderboardArray.push({
                        id: songIndex.FileHash,
                        songName: songIndex.SongName.replace(/<.?em>/g, ''),
                        songAlbum: songIndex.AlbumName,
                        songSinger: songIndex.SingerName.replace(/<.?em>/g, ''),
                        albumId: songIndex.AlbumID,
                        // songImage: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${songIndex.albummid}.jpg`,
                        musicSource: 'KG'
                    });
                });
            } else if (this.state.musicSource === 'MG') {/* 咪咕音乐源的搜索数据处理 */
                let result = await axios.get(WP_MUSIC_URL.MIGU_SEARCH, {
                    params: {
                        key: this.state.value,
                        offset: this.state.page
                    }
                });

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: '数据请求失败 下拉刷新'
                    });
                    return;
                }

                /* 咪咕搜索的数据为空的条件判断 */
                if (!result.data.musics) {
                    this.setState({
                        showFoot: 1,
                        isRefreshing: false
                    });
                    return;
                }

                result.data.musics.map(songIndex => {
                    LeaderboardArray.push({
                        id: songIndex.copyrightId,
                        songName: songIndex.songName,
                        songAlbum: songIndex.albumName,
                        songSinger: songIndex.singerName,
                        songImage: songIndex.cover,
                        musicSource: 'MG'
                    });
                });
            } else if (this.state.musicSource === 'KW') {/* 酷我音乐源的搜索数据处理 */
                let result = await axios.get(WP_MUSIC_URL.KUWO_SEARCH, {
                    params: {
                        key: this.state.value,
                        offset: this.state.page
                    }
                });

                if (result.status !== 200) {
                    this.setState({
                        error: true,
                        errorInfo: '数据请求失败 下拉刷新'
                    });
                    return;
                }

                if (!result.data.data) {
                    this.setState({
                        showFoot: 1,
                        isRefreshing: false
                    })
                    return;
                }

                result.data.data.list.map(songIndex => {
                    LeaderboardArray.push({
                        id: songIndex.rid,
                        songName: songIndex.name,
                        songAlbum: songIndex.album,
                        songSinger: songIndex.artist,
                        songImage: songIndex.albumpic,
                        musicSource: 'KW'
                    });
                });
            }
            let foot = 0;
            if (this.state.page >= totalPage) {
                foot = 1;//listView底部显示没有更多数据了
            }
            this.setState({
                dataArray: this.state.dataArray.concat(LeaderboardArray),
                isLoading: false,
                showFoot: foot,
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
    /* 网络请求——获取每一个音乐源的歌曲数据  代码结束*/

    onFocus = () => {
        this.AxiosGetHotSearch();
        this.setState({
            page: 1,
            // isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
            showFoot: 0,
            dataArray: []
        });
    }

    setStateMusicSource = (musicsource) => {
        this.setState({
            musicSource: musicsource,
            page: 1
        }, () => {
            this.setState({
                isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
                dataArray: []
            });
            // this.AxiosGetHotSearch();
            this.AxiosGetData();
        });
    }

    onSubmitEditing = () => {
        this.setState({
            page: 1,
            isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
            // dataArray: []
        });
        this.AxiosGetData();
    }

    componentDidMount() {
        //请求热搜数据
        this.AxiosGetHotSearch();
    }

    /* 组件销毁中清理异步操作和取消请求 */
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        }
        // 刷新首页歌单数据
        this.props.Function_flush_playlist();
    }
    // UNSAFE_componentWillUpdate() {
    //     console.log('search updata');
    // }
    handleRefresh = () => {
        this.setState({
            page: 1,
            isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
            dataArray: []
        });
        this.AxiosGetData();
    }

    _keyExtractor = (item, index) => `${item.id}${index}`;
    //加载失败view
    renderErrorView() {
        return (
            <TouchableWithoutFeedback onPress={
                () => {
                    this.setState({
                        page: 1,
                        error: false,
                        dataArray: [],
                        isRefreshing: true
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
    _renderItemView = ({ item }) => {
        return (
            <TouchableOpacity onPress={async () => {
                this.props.playSong(item);
                try {
                    let ret = await storage.load({
                        key: 'playlist',
                        id: '播放列表',
                        autoSync: false,
                        syncInBackground: false
                    });
                    for (let index in ret) {
                        if (ret[index].id === item.id) {
                            return;
                        }
                    }
                    ret.push(item);
                    storage.save({
                        key: 'playlist',
                        id: '播放列表',
                        data: ret
                    });
                } catch (error) {
                    ToastAndroid.show("播放列表读取错误，请刷新重试", ToastAndroid.SHORT);
                }
            }}>
                <View style={styles.songBox}>
                    <Text numberOfLines={1} style={styles.title}>{item.songName}</Text>
                    <Text numberOfLines={1} style={styles.content}>{`${item.songSinger} - ${item.songAlbum}`}</Text>
                    <TouchableNativeFeedback onPress={() => { this.props.setModal(item); this.props.setCommonState('setModalVisible', true) }} background={TouchableNativeFeedback.Ripple('#DDDDDD', true, 24)}>
                        <View style={{ width: 50, height: 60, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 10 }}>
                            <Entypo name="dots-three-vertical" size={18} color="black"></Entypo>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </TouchableOpacity>
        );
    }

    renderData() {
        return (
            <>
                <TextInput
                    style={{ height: 50, width: '72%', borderColor: 'gray', borderBottomWidth: 1, padding: 0, marginLeft: '14%', fontSize: 18, backgroundColor: 'transparent', zIndex: 1000 }}
                    onChangeText={text => this.setState({ value: text })}
                    value={this.state.value}
                    autoFocus={true}
                    blurOnSubmit={true}
                    returnKeyType={'search'}
                    placeholder={'输入你想要的歌曲名'}
                    onSubmitEditing={this.onSubmitEditing}
                    onFocus={this.onFocus}
                />
                <InputMusicSourceSwitch setStateMusicSource={this.setStateMusicSource}></InputMusicSourceSwitch>
                <FlatList
                    // contentContainerStyle={{ alignItems: 'center', marginTop: 10}}
                    data={this.state.dataArray}
                    renderItem={this._renderItemView}
                    ListFooterComponent={this._renderFooter}
                    onEndReached={this._onEndReached}
                    onEndReachedThreshold={0.1}
                    // ItemSeparatorComponent={this._separator}
                    keyExtractor={this._keyExtractor}
                    ListEmptyComponent={this._renderEmpty}
                    //为刷新设置颜色
                    getItemLayout={(data, index) => (
                        { length: 60, offset: 60 * index, index }
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.handleRefresh}//因为涉及到this.state
                            // colors={['#ff0000', '#00ff00','#0000ff','#3ad564']}
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

    // 热搜和搜索推荐的UI组件
    _renderEmpty = () => {
        const _EmptykeyExtractor = (item, index) => `${item.title}${index}`;
        const _renderHeader = () => {
            return (
                <View style={{ backgroundColor: '#FFFFFF', height: 40, justifyContent: 'flex-end', paddingLeft: 10 }}>
                    <Text style={{ fontSize: 16 }}>热门搜索</Text>
                </View>
            )
        };
        const Item = ({ index, title, description }) => (
            <TouchableOpacity style={{
                width: '50%',
                height: 60,
                backgroundColor: '#FFFFFF',
                justifyContent: 'center'
            }}
                onPress={() => { this.setState({ value: title, isRefreshing: true }, () => this.AxiosGetData()) }}
            >
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: 40, height: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 15, color: 'black', opacity: 0.4 }}>{index + 1}</Text>
                    </View>
                    <View style={{ justifyContent: 'center', width: '100%' }}>
                        <Text style={{
                            fontSize: 15,
                            width: '80%'
                        }}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        {description.length !== 0 ? <Text style={{ color: 'black', opacity: 0.4, fontSize: 12, width: '76%' }} numberOfLines={1}>{description}</Text> : null}
                    </View>
                </View>
            </TouchableOpacity>
        );
        return (
            <>
                <FlatList
                    data={this.state.SearchData}
                    numColumns={2}
                    renderItem={({ item, index }) => <Item title={item.title} index={index} description={item.description} />}
                    ListHeaderComponent={_renderHeader}
                    keyExtractor={_EmptykeyExtractor}
                />
            </>
        );
    }

    _renderFooter = () => {
        if (this.state.showFoot === 1) {
            return (
                <View style={{ height: 100, alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#FFFFFF' }}>
                    <Text style={{ color: '#999999', fontSize: 14, marginTop: 5, marginBottom: 5 }}>
                        没有更多数据了
                    </Text>
                </View>
            );
        } else if (this.state.showFoot === 2) {
            return (
                <View style={styles.footer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator
                            animating={true}
                            color='#999999'
                            size="large"
                        />
                        <Text style={{ fontSize: 18, color: '#999999' }}>正在加载更多数据...</Text>
                    </View>
                </View>
            );
        } else if (this.state.showFoot === 0) {
            return (
                <View style={styles.emptyFooter}>
                </View>
            );
        }
    }

    _onEndReached = () => {
        //如果是正在加载中或没有更多数据了，则返回
        if (this.state.showFoot != 0) {
            return;
        }
        //如果当前页大于或等于总页数，那就是到最后一页了，返回
        if ((this.state.page != 1) && (this.state.page >= totalPage)) {
            return;
        } else {
            this.state.page++;
        }
        //底部显示正在加载更多数据
        this.setState({ showFoot: 2 });
        //获取数据，在componentDidMount()已经请求过数据了
        if (this.state.page > 1) {
            this.AxiosGetData();
        }
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
        height: 60,
        backgroundColor: '#FFFFFF',
        paddingLeft: 18,
        justifyContent: 'center'
    },
    title: {
        fontSize: 16,
        color: 'black',
        width: '70%'
    },
    footer: {
        height: 100,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF'
    },
    emptyFooter: {
        height: 100,
        // flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'flex-start',
        backgroundColor: '#FFFFFF'
    },
    content: {
        fontSize: 12,
        color: 'black',
        opacity: 0.4,
        marginTop: 4,
        width: '70%'
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);