import React, { PureComponent } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, StatusBar, AppState, TouchableWithoutFeedback, TouchableOpacity, ToastAndroid } from 'react-native';

import LinearGradinet from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Lyric from 'lyric-parser';
import Lyric_wy from "../../uitl/Lyric_wy";
import WP_MUSIC_URL from '../../uitl/urlMapConstant';



import { connect } from "react-redux";
import axios from 'axios';
import storage from '../../storage';

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
        audioRef: state.AudioState.audioRef,     // 音乐播放列表
        activeAlbumId: state.AudioState.activeAlbumId,
        Function_flush_playsonglist: state.CommonState.Function_flush_playsonglist,
        activeMusicSource: state.AudioState.activeMusicSource
    }
}

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
        }
    };
}

class SongDetails extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            color: '#FFFFFF',
            lyricTxt: '',
            lyric: null,
            slideValue: 0,
            slider_flag: true,
            playModel: '',
            time_slider: null,
            appState: AppState.currentState
        }
    }


    componentDidMount() {
        this.props.setAudioCommonState('setFunction_flush_getlyric', this.getLyric);
        this.props.setAudioCommonState('setFunction_flush_getcolor', this.getMasterColor);

        this.setPlaymodel();
        this.getLyric();
        this.getMasterColor();
        AppState.addEventListener("change", this._handleAppStateChange);
    }

    /* 组件销毁中清理异步操作和取消请求 */
    componentWillUnmount() {
        if (this.state.lyric) {
            this.state.lyric.seek(0);
            this.state.lyric.stop();
        }
        if (this.state.time_slider) {
            clearInterval(this.state.time_slider);
        }

        this.props.setAudioCommonState('setFunction_flush_getlyric', null);
        this.props.setAudioCommonState('setFunction_flush_getcolor', null);
        AppState.removeEventListener("change", this._handleAppStateChange);

        this.setState = (state, callback) => {
            return;
        }
    }

    _handleAppStateChange = nextAppState => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            this.setState({slideValue: this.props.currentTime});
        }
        this.setState({ appState: nextAppState });
    };

    // 获取歌词，歌曲资源完成时，会调用一次，打开歌曲详情时，调用一次
    getLyric = async () => {
        try {
            // 获取当前歌词
            if (this.props.activeMusicSource === 'QQ') {
                let result = await axios.get(WP_MUSIC_URL.QQ_LYRIC, {
                    params: {
                        mid: this.props.activeId
                    }
                });
                var lyricStr = result.data.lyric;
            } else if (this.props.activeMusicSource === 'WY') {
                let result = await axios.get(WP_MUSIC_URL.WY_LYRIC, {
                    params: {
                        id: this.props.activeId
                    }
                });
                var lyricStr = result.data.lrc.lyric;
            } else if (this.props.activeMusicSource === 'MG') {
                let result = await axios.get(WP_MUSIC_URL.MIGU_LYRIC, {
                    params: {
                        cid: this.props.activeId
                    }
                });
                var lyricStr = result.data.lyric;
            } else if (this.props.activeMusicSource === 'KW') {
                let result = await axios.get(WP_MUSIC_URL.KUWO_LYRIC, {
                    params: {
                        rid: this.props.activeId
                    }
                });
                var lyricStr = result.data.lyric_str;
            } else if (this.props.activeMusicSource === 'KG') {
                let result = await axios.get(WP_MUSIC_URL.KUGOU_SONG, {
                    params: {
                        aid: this.props.activeAlbumId,
                        hash: this.props.activeId
                    }
                });
                var lyricStr = result.data.data.lyrics;
            }
            // console.log(lyricStr);

            if (this.state.lyric || this.state.time_slider) {
                clearInterval(this.state.time_slider);
                this.setState({ slideValue: 0 });
                this.state.lyric.seek(0);
                this.state.lyric.stop();
            }
            if (this.props.activeMusicSource === 'WY') {
                var lyric = new Lyric_wy(lyricStr, ({ txt }) => {
                    this.setState({ lyricTxt: txt });
                });
            } else {
                var lyric = new Lyric(lyricStr, ({ txt }) => {
                    this.setState({ lyricTxt: txt });
                });
            }
            let time_slider = null;
            if (this.props.paused) {
                time_slider = setInterval(() => {
                    // 设置slideValue，定时器每隔一秒自动增加 1
                    this.setState((proState) => { return { slideValue: parseInt(proState.slideValue) + 1 } });
                    if (this.state.playModel === '单曲循环') {
                        if (parseInt(this.state.slideValue) === parseInt(this.props.duration)) {
                            this.setState({ slideValue: 0 });
                            this.state.lyric.seek(0);
                            this.props.audioRef.audio.seek(0);
                        }
                    }
                }, 1000);
            }
            this.setState({ lyric: lyric, time_slider: time_slider, slideValue: this.props.currentTime });
            if (this.props.paused) {
                lyric.seek(parseFloat(this.props.currentTime) * 1000);
            }
        } catch (error) {
            if (this.state.lyric || this.state.time_slider) {
                clearInterval(this.state.time_slider);
                this.setState({ slideValue: 0 });
                this.state.lyric.seek(0);
                this.state.lyric.stop();
            }
            let lyric = new Lyric('没有发现歌词', ({ lineNum, txt }) => {
                this.setState({ lyricTxt: txt });
            });
            let time_slider = setInterval(() => {
                // 设置slideValue，定时器每隔一秒自动增加 1
                this.setState((proState) => { return { slideValue: parseInt(proState.slideValue) + 1 } });
                if (this.state.playModel === '单曲循环') {
                    if (parseInt(this.state.slideValue) === parseInt(this.props.duration)) {
                        this.setState({ slideValue: 0 });
                        this.state.lyric.seek(0);
                        this.props.audioRef.audio.seek(0);
                    }
                }
            }, 1000);
            this.setState({ lyric: lyric, time_slider: time_slider, slideValue: this.props.currentTime });
            if (this.props.paused) {
                lyric.seek(parseFloat(this.props.currentTime) * 1000);
            }
        }
    }

    // componentDidUpdate() {
    //     this.getMasterColor();
    // }

    getMasterColor = async () => {
        try {
            let result = await axios.get(`http://iecoxe.top:5000/v1/scavengers/getMasterColor?imgUrl=${encodeURI(this.props.activeImage)}`);
            this.setState({
                color: result.data.color
            })
        } catch (error) {
            this.setState({
                color: '#FFFFFF'
            })
        }
    }

    // 进度条拖动的过程中，不断触发的函数
    // 直接点击进度条，也是会触发这个函数
    onValueChange = () => {
        if (this.state.time_slider) {
            clearInterval(this.state.time_slider);
            this.setState({ time_slider: null });
        }
    }

    // 进度条拖动完毕触发的事件
    onSlidingComplete = (currentTime) => {
        this.props.audioRef.audio.seek(currentTime);
        this.setState({ slideValue: currentTime });
        let time_slider = setInterval(() => {
            // 设置slideValue，定时器每隔一秒自动增加 1
            this.setState((proState) => { return { slideValue: parseInt(proState.slideValue) + 1 } });
            if (this.state.playModel === '单曲循环') {
                if (parseInt(this.state.slideValue) === parseInt(this.props.duration)) {
                    this.setState({ slideValue: 0 });
                    this.state.lyric.seek(0);
                    this.props.audioRef.audio.seek(0);
                }
            }
        }, 1000);
        this.setState({ time_slider: time_slider });
        if (this.props.paused) {
            this.state.lyric.seek(parseFloat(currentTime) * 1000);
        } else {
            this.props.setAudioCommonState('setPaused', true);
            this.state.lyric.seek(parseFloat(currentTime) * 1000);
        }
    }

    // 设置播放顺序
    setPlaymodel = async () => {
        if (this.state.playModel.length === 0) {
            try {
                let ret = await storage.load({
                    key: 'audio',
                    id: 'playModel',
                    autoSync: false,
                    syncInBackground: false
                });
                if (ret === 'list') {
                    this.setState({ playModel: '列表循环' });
                } else {
                    this.setState({ playModel: '单曲循环' });
                }
            } catch (error) {
                this.setState({ playModel: '列表循环' });
            }
            return;
        }
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
    }

    render() {
        return (
            <View>
                <StatusBar backgroundColor={this.state.color} barStyle='light-content'></StatusBar>
                <LinearGradinet
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={[this.state.color, "#FFFFFF"]}
                    style={{
                        /* 获取 移动端导航栏距离 和 手机屏幕总高度  从而实现导航栏的全体渐变色 */
                        height: Dimensions.get('window').height,
                        width: Dimensions.get('window').width,
                        // justifyContent: 'space-around',
                        alignItems: 'center'
                    }}
                >
                    <TouchableWithoutFeedback>
                        <View style={{
                            // backgroundColor: 'red',
                            height: '80%',
                            justifyContent: 'space-evenly'
                        }}>
                            <Image
                                style={styles.ALbumImage}
                                source={{
                                    uri: this.props.activeImage,
                                }}
                            />
                            <View style={{ marginBottom: 20, width: 300 }}>
                                <Text numberOfLines={1} style={{ fontSize: 22, color: 'black', marginBottom: 20, width: '100%' }}>{this.props.activeSong}</Text>
                                <Text numberOfLines={1} style={{ fontSize: 14, color: 'black', marginBottom: 20, width: '100%', opacity: 0.8 }}>{this.props.activeSinger} -- {this.props.activeAlbum}</Text>
                                <Text numberOfLines={1} style={{ fontSize: 14, color: 'black', marginTop: 30, width: '100%', opacity: 0.8 }}>{this.state.lyricTxt}</Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={{
                        height: '20%',
                        width: '100%',
                        alignItems: 'center'
                        // backgroundColor: 'green'
                    }}>
                        <Slider
                            style={{ width: '90%', height: '10%' }}
                            minimumValue={0}
                            maximumValue={this.props.duration}
                            value={this.state.slideValue}
                            onValueChange={this.onValueChange}
                            onSlidingComplete={this.onSlidingComplete}
                            minimumTrackTintColor="#888888"
                            maximumTrackTintColor="#888888"
                            step={1}
                            ref={ref => this.Slider = ref}
                        />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'space-evenly',
                            height: '80%'
                        }}>
                            <TouchableOpacity onPress={this.setPlaymodel}>{/* 播放顺序 */}
                                {
                                    this.state.playModel === '列表循环' ?
                                        <AntDesign style={styles.IconInnerStyle} name="bars" size={30} color="black"></AntDesign> :
                                        <AntDesign style={styles.IconInnerStyle} name="sync" size={30} color="black"></AntDesign>
                                }
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.props.audioRef.stepbackward}>{/* 上一首歌曲 */}
                                <AntDesign style={styles.IconInnerStyle} name="stepbackward" size={30} color="black"></AntDesign>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.props.setAudioCommonState('setPaused', !this.props.paused);
                                if (!this.props.paused) {
                                    this.state.lyric.seek(parseFloat(this.state.slideValue) * 1000);
                                    let time_slider = setInterval(() => {
                                        // 设置slideValue，定时器每隔一秒自动增加 1
                                        this.setState((proState) => { return { slideValue: parseInt(proState.slideValue) + 1 } });
                                        if (this.state.playModel === '单曲循环') {
                                            if (parseInt(this.state.slideValue) === parseInt(this.props.duration)) {
                                                this.setState({ slideValue: 0 });
                                                this.state.lyric.seek(0);
                                                this.props.audioRef.audio.seek(0);
                                            }
                                        }
                                    }, 1000);
                                    this.setState({ time_slider: time_slider });
                                    this.props.audioRef.audio.seek(parseFloat(this.state.slideValue));
                                } else {
                                    this.state.lyric.togglePlay();
                                    if (this.state.lyric) {
                                        clearInterval(this.state.time_slider);
                                    }
                                }
                            }}>{/* 播放 暂停 */}
                                {
                                    this.props.paused
                                        ? <AntDesign style={styles.IconInnerStyle} name="pausecircleo" size={55} color="black"></AntDesign>
                                        : <AntDesign style={styles.IconInnerStyle} name="playcircleo" size={55} color="black"></AntDesign>
                                }
                            </TouchableOpacity>
                            <TouchableOpacity onPress={async () => { await this.props.audioRef.stepforward(); }}>{/* 下一首歌曲 */}
                                <AntDesign style={styles.IconInnerStyle} name="stepforward" size={30} color="black"></AntDesign>
                            </TouchableOpacity>
                            {/* 打开播放列表， Function_flush_playsonglist 播放列表的刷新函数，通过redux引用得到，目前咋不知道这种写法可有问题*/}
                            <TouchableOpacity onPress={() => { this.props.setAudioCommonState('setPlaySongListVisible', true); this.props.Function_flush_playsonglist() }}>{/* 歌曲播放列表 */}
                                <MaterialCommunityIcons style={styles.IconInnerStyle} name="playlist-music-outline" size={34} color="black"></MaterialCommunityIcons>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradinet>
            </View>
        );
    }
}


var styles = StyleSheet.create({
    ALbumImage: {
        height: 300,
        width: 300,
        borderRadius: 20
    },
    IconInnerStyle: {
        paddingLeft: 13
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(SongDetails);