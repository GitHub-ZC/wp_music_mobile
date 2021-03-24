import React, { Component } from "react";
import {
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableNativeFeedback,
    TouchableWithoutFeedback,
    View,
    ToastAndroid,
    PermissionsAndroid,
    Alert,
    RefreshControl
} from "react-native";

import Feather from 'react-native-vector-icons/Feather';
import storage from '../storage';
import { connect } from "react-redux";

import RNFS from 'react-native-fs';
import get_kg_url from '../uitl/axios/kg';
import get_wy_url from '../uitl/axios/wy';
import get_qq_url from '../uitl/axios/qq';
import get_mg_url from '../uitl/axios/mg';
import get_kw_url from '../uitl/axios/kw';

// 映射state属性
const mapStateToProps = (state) => {
    return {
        modalVisible: state.CommonState.modalVisible,            // 是否打开歌曲的模态
        modalImage: state.CommonState.modalImage,            // 可以给张默认图片
        modalSongName: state.CommonState.modalSongName,            // 模态框的歌曲名
        modalSongAlbum: state.CommonState.modalSongAlbum,            // 模态框的专辑名
        modalSinger: state.CommonState.modalSinger,            // 模态框的歌手名
        modalId: state.CommonState.modalId,
        modalAlbumId: state.CommonState.modalAlbumId,
        modalMusicSource: state.CommonState.modalMusicSource,
        Function_flush_playlist: state.CommonState.Function_flush_playlist,
        activeId: state.AudioState.activeId,
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
        }
    };
}

class SongModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // modalVisible: props.modalVisible,
            DLModalVisible: false,
            PSModalVisible: false,
            ImageType: 0,      //0,专辑图片正常加载，1加载错误
            playlist: [],
            isRefreshing: false
        };
    }

    componentDidMount() {
        this.GetStorageData();
    }

    GetStorageData = async () => {
        let ids = await storage.getIdsForKey('playlist');
        this.setState({ playlist: ids, isRefreshing: false });
    }

    // 下载音乐
    downloadMusic = async (br, FORMAT) => {
        try {
            let DOWNLOADPATH = `/音乐WP/`;
            // 判断app是否有写权限
            if (!await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "权限认证",
                        message: '下载音乐需要手机的存储权限',
                        buttonPositive: "确定"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert("权限认证", "你可以下载音乐了");
                } else {
                    Alert.alert("权限认证", "下载音乐 需要您提供存储权限");
                }
                return;
            }

            // 确定下载目录确定是否存在
            if (!await RNFS.exists(RNFS.ExternalStorageDirectoryPath + DOWNLOADPATH + FORMAT)) {
                await RNFS.mkdir(RNFS.ExternalStorageDirectoryPath + DOWNLOADPATH + FORMAT);
            }

            // 确定音乐源，每一个平台分开请求
            let url = '';
            let currentSongName = this.props.modalSongName.length === 0 ? '' : this.props.modalSongName;
            switch (this.props.modalMusicSource) {
                case 'QQ': url = await get_qq_url(this.props.modalId, br); break;
                case 'WY': url = await get_wy_url(this.props.modalId, br); break;
                case 'MG': url = await get_mg_url(this.props.modalId, br); break;
                case 'KW': url = await get_kw_url(this.props.modalId, br); break;
                case 'KG': let { URL } = await get_kg_url(this.props.modalId, this.props.modalAlbumId); url = URL; break;
            }

            if (url.length === 0) {
                ToastAndroid.show(`${currentSongName} 当前音质(无)`, ToastAndroid.SHORT);
                return;
            }

            this.setState({ DLModalVisible: false });

            let contentLength = 0;
            let { promise } = RNFS.downloadFile({
                fromUrl: url,
                toFile: RNFS.ExternalStorageDirectoryPath + DOWNLOADPATH + `${FORMAT}/` + currentSongName + (br === 'flac' ? '.flac' : '.mp3'),
                begin: (res) => {
                    ToastAndroid.show(`${currentSongName}${FORMAT} 开始下载`, ToastAndroid.SHORT);
                    contentLength = res.contentLength;
                    // console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
                }
                // progress: (res) => { //下载进度
                //     let pro = res.bytesWritten / res.contentLength;
                //     console.log(pro, res.bytesWritten, res.contentLength);
                // }
            });

            let result = await promise;
            if (parseInt(result.bytesWritten) === parseInt(contentLength)) {
                ToastAndroid.show(`${currentSongName}${FORMAT} 下载完成`, ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show(`${currentSongName}${FORMAT} 下载失败`, ToastAndroid.SHORT);
        }
    }

    handleRefresh = () => {
        this.setState({
            isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
            // dataArray:[]
        });
        this.GetStorageData();
    }

    // 添加歌曲到相对应的歌单
    addPlaylist = async (id) => {
        try {
            let ret = await storage.load({
                key: 'playlist',
                id: id,
                syncInBackground: false,
                autoSync: false
            });
            // 添加 无法重复添加歌曲, 使用id进行循环判定
            for (let i in ret) {
                if (ret[i].id === this.props.modalId) {
                    ToastAndroid.show("无法重复添加歌曲", ToastAndroid.SHORT);
                    return;
                }
            }
            if (this.props.modalMusicSource === 'KG') {
                ret.push({
                    id: this.props.modalId,
                    songName: this.props.modalSongName,
                    songAlbum: this.props.modalSongAlbum,
                    songSinger: this.props.modalSinger,
                    albumId: this.props.modalAlbumId,
                    songImage: this.props.modalImage,
                    musicSource: this.props.modalMusicSource
                });
            } else {
                ret.push({
                    id: this.props.modalId,
                    songName: this.props.modalSongName,
                    songAlbum: this.props.modalSongAlbum,
                    songSinger: this.props.modalSinger,
                    songImage: this.props.modalImage,
                    musicSource: this.props.modalMusicSource
                });
            }
            storage.save({
                key: 'playlist',
                id: id,
                data: ret
            });
            ToastAndroid.show("添加歌曲成功", ToastAndroid.SHORT);
            // 刷新首页的歌单数据
            this.props.Function_flush_playlist();
        } catch (error) {
            ToastAndroid.show("添加歌曲失败", ToastAndroid.SHORT);
        }
    }

    // 从歌单删除相对应的歌曲
    delFromStorage = async () => {
        try {
            // modal自动隐藏
            this.props.setCommonState('setModalVisible', false);
            let ret = await storage.load({
                key: 'playlist',
                id: this.props.title,
                syncInBackground: false,
                autoSync: false
            });
            for (let index in ret) {
                if (ret[index].id === this.props.modalId) {
                    ret.splice(parseInt(index), 1);
                    storage.save({
                        key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                        id: this.props.title, // 注意:请不要在id中使用_下划线符号!
                        data: ret
                    });
                    ToastAndroid.show("删除歌曲成功", ToastAndroid.SHORT);
                    // 刷新父组件（自定义歌单歌单）
                    this.props.GetStroageData();
                    ret = null;
                    return;
                }
            }
        } catch (error) {
            ToastAndroid.show('播放列表读取错误，清空缓存重试，实在不行重装APP', ToastAndroid.SHORT);
        }
    }

    // 下一首播放
    PlayTheNextOne = async () => {
        try {
            let ret = await storage.load({
                key: 'playlist',
                id: '播放列表',
                autoSync: false,
                syncInBackground: false
            });
            if (ret.length === 0) {
                ret.push({
                    id: this.props.modalId,
                    songName: this.props.modalSongName,
                    songAlbum: this.props.modalSongAlbum,
                    songSinger: this.props.modalSinger,
                    songImage: this.props.modalImage,
                    musicSource: this.props.modalMusicSource
                });
                storage.save({
                    key: 'playlist',
                    id: '播放列表',
                    data: ret
                });
                return;
            }

            for (let i in ret) {
                if (ret[i].id === this.props.modalId) {
                    ret.splice(i, 1);
                }
            }

            for (let i in ret) {
                if (ret[i].id === this.props.activeId) {
                    ret.splice(parseInt(i) + 1, 0, {
                        id: this.props.modalId,
                        songName: this.props.modalSongName,
                        songAlbum: this.props.modalSongAlbum,
                        songSinger: this.props.modalSinger,
                        songImage: this.props.modalImage,
                        musicSource: this.props.modalMusicSource
                    });
                    storage.save({
                        key: 'playlist',
                        id: '播放列表',
                        data: ret
                    });
                    return;
                }
            }

            ret.unshift({
                id: this.props.modalId,
                songName: this.props.modalSongName,
                songAlbum: this.props.modalSongAlbum,
                songSinger: this.props.modalSinger,
                songImage: this.props.modalImage,
                musicSource: this.props.modalMusicSource
            });

            ret = null;
        } catch (error) {
            ToastAndroid.show('播放列表读取错误，清空缓存重试，实在不行重装APP', ToastAndroid.SHORT);
        }
    }

    render() {
        const { DLModalVisible, PSModalVisible } = this.state;
        return (
            <>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.props.modalVisible}
                    onRequestClose={() => {
                        this.props.setCommonState('setModalVisible', false);
                    }}
                >
                    {/* 空白处，点击退出模态 */}
                    <TouchableWithoutFeedback onPress={() => this.props.setCommonState('setModalVisible', false)}>
                        <View style={{ height: '40%' }}></View>
                    </TouchableWithoutFeedback>
                    {/* 空白处，点击退出模态 */}
                    {/* 模态框 */}
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        height: '60%',
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        borderTopStartRadius: 30,
                        borderTopEndRadius: 30,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5
                    }}>
                        {/* 歌曲头部 */}
                        <View style={{
                            borderTopStartRadius: 30,
                            borderTopEndRadius: 30,
                            height: 90,
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center'
                        }}>
                            {/* 专辑封面 */}
                            <Image
                                style={{
                                    height: 60,
                                    width: 60,
                                    marginLeft: 30,
                                    borderRadius: 10
                                }}
                                source={{
                                    uri: this.state.ImageType ? 'https://iecoxe.gitee.io/music-app/defaultAlbum.jpg' : this.props.modalImage,
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0'
                                    }
                                }}
                                onError={() => this.setState({ ImageType: 1 })}
                                onLoad={() => this.setState({ ImageType: 0 })}
                            />
                            {/* 专辑封面 */}
                            <View style={{ marginLeft: 20, height: 40, width: '60%', justifyContent: 'space-between' }}>
                                <Text numberOfLines={1}>{this.props.modalSongName}</Text>
                                <Text numberOfLines={1} style={{ opacity: 0.4, color: 'black' }}>{this.props.modalSinger} - {this.props.modalSongAlbum}</Text>
                            </View>
                        </View>
                        {/* 歌曲头部 */}
                        {/* 歌曲操作部分 */}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* <TouchableNativeFeedback onPress={() => this.props.playSong()}>
                                <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <Feather name="play-circle" size={24} color="black" style={{ marginLeft: 30, opacity: 0.4 }}></Feather>
                                    <Text style={{ fontSize: 16, marginLeft: 30 }}>播放</Text>
                                </View>
                            </TouchableNativeFeedback> */}
                            <TouchableNativeFeedback onPress={this.PlayTheNextOne}>
                                <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <Feather name="pie-chart" size={24} color="black" style={{ marginLeft: 30, opacity: 0.4 }}></Feather>
                                    <Text style={{ fontSize: 16, marginLeft: 30 }}>下一首播放</Text>
                                </View>
                            </TouchableNativeFeedback>
                            <TouchableNativeFeedback onPress={() => { this.setState({ PSModalVisible: true }) }}>
                                <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <Feather name="file-plus" size={24} color="black" style={{ marginLeft: 30, opacity: 0.4 }}></Feather>
                                    <Text style={{ fontSize: 16, marginLeft: 30 }}>添加到歌单</Text>
                                </View>
                            </TouchableNativeFeedback>
                            {
                                this.props.playlistflag &&
                                <TouchableNativeFeedback onPress={this.delFromStorage}>
                                    <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <Feather name="file-plus" size={24} color="black" style={{ marginLeft: 30, opacity: 0.4 }}></Feather>
                                        <Text style={{ fontSize: 16, marginLeft: 30 }}>删除</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            }
                            <TouchableNativeFeedback onPress={() => { this.setState({ DLModalVisible: true }) }}>
                                <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <Feather name="arrow-down-circle" size={24} color="black" style={{ marginLeft: 30, opacity: 0.4 }}></Feather>
                                    <Text style={{ fontSize: 16, marginLeft: 30 }}>下载</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </ScrollView>
                        {/* 歌曲操作部分 */}
                    </View>
                    {/* 模态框 */}
                </Modal>

                {/* 下载音乐的模态框 */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={DLModalVisible}
                    onRequestClose={() => {
                        this.setState({ DLModalVisible: !DLModalVisible });
                    }}
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                    <TouchableWithoutFeedback onPress={() => this.setState({ DLModalVisible: false })}>
                        <View style={{ position: 'absolute', bottom: 0, top: 0, right: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{
                            // height: '36%',
                            width: '80%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 10,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            justifyContent: 'center'
                        }}>
                            {
                                this.props.modalMusicSource !== 'WY' && this.props.modalMusicSource !== 'KG' &&
                                <TouchableNativeFeedback onPress={() => this.downloadMusic('flac', '（FLAC）')}>
                                    <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <Feather name="chrome" size={24} color="black" style={{ opacity: 0.4, marginLeft: 20 }}></Feather>
                                        <Text style={{ fontSize: 16, marginLeft: 20 }}>无损音质（FLAC）</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            }
                            {
                                this.props.modalMusicSource !== 'WY' && this.props.modalMusicSource !== 'KG' &&
                                <TouchableNativeFeedback onPress={() => this.downloadMusic('320', '（320k MP3）')}>
                                    <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <Feather name="chrome" size={24} color="black" style={{ opacity: 0.4, marginLeft: 20 }}></Feather>
                                        <Text style={{ fontSize: 16, marginLeft: 20 }}>极高音质（320k MP3）</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            }
                            {
                                this.props.modalMusicSource !== 'QQ' && this.props.modalMusicSource !== 'MG' && this.props.modalMusicSource !== 'WY' && this.props.modalMusicSource !== 'KG' &&
                                <TouchableNativeFeedback onPress={() => this.downloadMusic('192', '（192k MP3）')}>
                                    <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <Feather name="chrome" size={24} color="black" style={{ opacity: 0.4, marginLeft: 20 }}></Feather>
                                        <Text style={{ fontSize: 16, marginLeft: 20 }}>较高音质（192k MP3）</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            }
                            {
                                this.props.modalMusicSource !== 'WY' &&
                                <TouchableNativeFeedback onPress={() => this.downloadMusic('128', '（128k MP3）')}>
                                    <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <Feather name="chrome" size={24} color="black" style={{ opacity: 0.4, marginLeft: 20 }}></Feather>
                                        <Text style={{ fontSize: 16, marginLeft: 20 }}>标准音质（128k MP3）</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            }
                            {
                                this.props.modalMusicSource == 'WY' &&
                                <TouchableNativeFeedback onPress={() => this.downloadMusic('128', '（MAX MP3）')}>
                                    <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <Feather name="chrome" size={24} color="black" style={{ opacity: 0.4, marginLeft: 20 }}></Feather>
                                        <Text style={{ fontSize: 16, marginLeft: 20 }}>默认最大音质（MAX MP3）</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            }
                        </View>
                    </View>
                </Modal>
                {/* 下载音乐的模态框 */}

                {/* 添加歌单的模态框 */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={PSModalVisible}
                    onRequestClose={() => {
                        this.setState({ PSModalVisible: !PSModalVisible })
                    }}
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                    <TouchableWithoutFeedback onPress={() => this.setState({ PSModalVisible: false })}>
                        <View style={{ position: 'absolute', bottom: 0, top: 0, right: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{
                            height: '42%',
                            width: '78%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 10,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            justifyContent: 'center'
                        }}>
                            {/* 歌单头部的标题 "选择歌单" */}
                            <View style={{ justifyContent: 'center', alignItems: 'center', height: 60 }}>
                                <Text style={{ fontSize: 16 }}>选择歌单</Text>
                            </View>
                            <ScrollView
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.isRefreshing}
                                        onRefresh={this.handleRefresh}//因为涉及到this.state
                                        progressBackgroundColor="#ffffff"
                                    />
                                }
                            >
                                {
                                    this.state.playlist.map((value, index) => (
                                        value === '新建歌单' || value === '导入歌单' || value === "播放历史" ? null :
                                            <TouchableNativeFeedback key={value + index} onPress={() => this.addPlaylist(value)}>
                                                <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start' }}>
                                                    <Feather name="chrome" size={24} color="black" style={{ opacity: 0.4, marginLeft: 20 }}></Feather>
                                                    <Text style={{ fontSize: 16, marginLeft: 20 }}>{value}</Text>
                                                </View>
                                            </TouchableNativeFeedback>
                                    ))
                                }
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
                {/* 添加歌单的模态框 */}
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SongModal);