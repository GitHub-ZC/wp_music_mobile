import React, { Component } from 'react';
import { StyleSheet, ToastAndroid } from 'react-native';
import Video from 'react-native-video';


import { connect } from "react-redux";
import storage from '../storage';

import get_kg_url from '../uitl/axios/kg';
import get_wy_url from '../uitl/axios/wy';
import get_qq_url from '../uitl/axios/qq';
import get_mg_url from '../uitl/axios/mg';
import get_kw_url from '../uitl/axios/kw';

// 映射state属性
const mapStateToProps = (state) => {
    return {
        activeId: state.AudioState.activeId,
        activeUri: state.AudioState.activeUri,            // 音乐的播放地址
        activeSinger: state.AudioState.activeSinger,      //正在播放的歌手
        activeSong: state.AudioState.activeSong,         //正在播放的歌
        activeAlbum: state.AudioState.activeAlbum,       //正在播放的专辑
        activeImage: state.AudioState.activeImage,        //正在播放的专辑图像
        currentTime: state.AudioState.currentTime,      //当前播放的时间
        duration: state.AudioState.duration,             //总时长
        paused: state.AudioState.paused,                //播放、暂停
        // songPlaylist: state.AudioState.songPlaylist,     // 音乐播放列表
        // playTypes: state.AudioState.playTypes,          // 音乐播放类型
        // repeat: state.AudioState.repeat,
        playInBackground: state.AudioState.playInBackground, // 当app转到后台运行的时候，播放是否暂停, false 代表暂停
        audioRef: state.AudioState.audioRef, // 当app转到后台运行的时候，播放是否暂停, false 代表暂停
        Function_flush_getcolor: state.CommonState.Function_flush_getcolor,
        Function_flush_getlyric: state.CommonState.Function_flush_getlyric
    }
}

// 映射修改state方法
const mapDispatchToProps = (
    dispatch
    // ownProps
) => {
    return {
        setAudioCommonState: (type, data) => {
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
                dispatch({ type: 'setPaused', data: false });
                return;
            }

            // 判断音乐有无链接
            // if (URL.length === 0) {
            //     ToastAndroid.show("无音乐资源,3s后自动下一首 ", ToastAndroid.SHORT);
            // }

            // 为app底部的播放框提供歌曲信息
            dispatch({ type: 'setActiveUri', data: URL.length === 0 ? 'https://baidu.com' : URL });
            dispatch({ type: 'setActiveId', data: item.id });
            dispatch({ type: 'setActiveSong', data: item.songName });
            dispatch({ type: 'setActiveSinger', data: item.songSinger });
            dispatch({ type: 'setActiveAlbum', data: item.songAlbum });
            dispatch({ type: 'setActiveMusicSource', data: item.musicSource });
            dispatch({ type: 'setActiveImage', data: item.songImage });
            dispatch({ type: 'setPaused', data: true });
        }
    };
}

// 音乐核心组件
class AudioCore extends Component {

    constructor(props) {
        super(props);
    }

    // 进度控制，每250ms调用一次，以获取视频播放的进度, 当视频在播放时的回调，一般用来传出视频播放到的当前时间，currentTime值为当前时间，单位为秒，通过该回调同步进度条与视频的进度，若做时间显示需要对时间进行格式化
    setCurrentTime = ({ currentTime }) => {
        this.props.setAudioCommonState('setCurrentTime', currentTime);
        // if (this.props.Function_flush_setValueChange) {
        //     this.props.Function_flush_setValueChange(currentTime);
        // }
    }

    // 当视频加载完毕时的回调函数, 视频加载完成准备播放时调用，duration为这个视频的总时长
    setDuration = ({ duration }) => {
        this.props.setAudioCommonState('setDuration', duration);
        // 初始化歌词，选择这个地方触发这个函数，是有意义的，因为要考虑redux的异步问题
        if (this.props.Function_flush_getlyric) {
            this.props.Function_flush_getlyric();
        }
        // 颜色获取
        if (this.props.Function_flush_getcolor) {
            this.props.Function_flush_getcolor();
        }
    }

    // 音乐播放完毕的回调函数
    onEnd = async () => {
        // 用于判断歌曲的 播放循环 问题
        // 单曲循环
        try {
            let ret = await storage.load({
                key: 'audio',
                id: 'playModel',
                autoSync: false,
                syncInBackground: false
            });
            if (ret === 'single') {
                this.audio.seek(0);
                this.props.setAudioCommonState('setPaused', false);
                this.props.setAudioCommonState('setPaused', true);
                return;
                // 列表循环
            } else if (ret === 'list') {
                this.stepforward();
                // 随机播放
            }/*  else if (this.props.playTypes === '') {
                this.props.setAudioCommonState('setRepeat', false);
                this.stepforward();
            } */
        } catch (error) {
            ToastAndroid.show(`播放顺序获取错误`, ToastAndroid.SHORT);
        }
    }

    // 当音乐不能加载，或出错后的回调函数
    onAudioError = () => {
        this.props.setAudioCommonState('setActiveSinger', '3s后自动下一首');
        this.props.setAudioCommonState('setActiveSong', '无音乐资源');
        this.props.setAudioCommonState('setPaused', false);
        setTimeout(() => this.stepforward(), 3000);
    }

    componentDidMount() {
        this.props.setAudioCommonState('setAudioRef', this);
    }
    /* 非 audio 核心组件 开始 */

    // 下一首歌曲
    stepforward = async () => {
        try {
            var songPlaylist = await storage.load({
                key: 'playlist',
                id: '播放列表',
                autoSync: false,
                syncInBackground: false
            });
        } catch (error) {
            console.log('获取播放列表错误');
            return;
        }

        // 播放列表为空的情况
        if (songPlaylist.length === 0) {
            this.props.setAudioCommonState('setPaused', false);
            return;
        }
        for (let i in songPlaylist) {
            if (songPlaylist[i].id === this.props.activeId) {
                if (parseInt(i) === songPlaylist.length - 1) {
                    this.props.playSong(songPlaylist[0]);
                } else {
                    this.props.playSong(songPlaylist[parseInt(i) + 1]);
                }
                return;
            }
        }
        this.props.playSong(songPlaylist[0]);
    }

    // 上一首歌曲
    stepbackward = async () => {
        try {
            var songPlaylist = await storage.load({
                key: 'playlist',
                id: '播放列表',
                autoSync: false,
                syncInBackground: false
            });
        } catch (error) {
            ToastAndroid.show("获取播放列表出错", ToastAndroid.SHORT);
            return;
        }

        // 播放列表为空的情况
        if (songPlaylist.length === 0) {
            this.props.setAudioCommonState('setPaused', false);
            return;
        }

        for (let i in songPlaylist) {
            if (songPlaylist[i].id === this.props.activeId) {
                if (parseInt(i) === 0) {
                    this.props.playSong(songPlaylist[songPlaylist.length - 1]);
                } else {
                    this.props.playSong(songPlaylist[parseInt(i) - 1]);
                }
                return;
            }
        }
        this.props.playSong(songPlaylist[0]);
    }
    /* 非 audio 核心组件 结束 */

    render() {
        return (
            // {/* 播放器 start */}
            <Video source={{ uri: this.props.activeUri }}   // Can be a URL or a local file.
                ref={(ref) => {
                    this.audio = ref;
                }}                                      // Store reference
                rate={1}                   // 控制播放速度，0 代表暂停paused, 1代表播放normal.
                volume={1.0}
                // 声音的放声音的放大倍数大倍数，0 为静音  ，1 为正常音量 ，更大的数字表示放大的倍数
                muted={false}                  // true代表静音，默认为false.
                paused={this.props.paused ? false : true}                 // true代表暂停，默认为false
                // resizeMode="contain"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                // repeat={this.props.repeat}                 // 是否重复播放
                playInBackground={this.props.playInBackground}       // 当app转到后台运行的时候，播放是否暂停, false 代表暂停
                playWhenInactive={false}       // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                onLoadStart={this.loadStart}   // 当视频开始加载时的回调函数
                onLoad={this.setDuration}      // 当视频加载完毕时的回调函数
                onProgress={this.setCurrentTime}      // 进度控制，每250ms调用一次，以获取视频播放的进度
                onEnd={this.onEnd}             // 当视频播放完毕后的回调函数
                onError={this.onAudioError}      // 当视频不能加载，或出错后的回调函数
                style={styles.backgroundAudio} />
            // {/* 播放器 end */}
        );
    }
}

var styles = StyleSheet.create({
    backgroundAudio: {
        position: 'absolute',
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(AudioCore);