import React, { Component } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
// Load the module

import { connect } from "react-redux";

const mapStateToProps = (state) => {
    return {
        activeUri: state.AudioState.activeUri,            // 音乐的播放地址
        activeSinger: state.AudioState.activeSinger,      //正在播放的歌手
        activeSong: state.AudioState.activeSong,         //正在播放的歌
        activeAlbum: state.AudioState.activeAlbum,       //正在播放的专辑
        activeImage: state.AudioState.activeImage,        //正在播放的专辑图像
        currentTime: state.AudioState.currentTime,      //当前播放的时间
        duration: state.AudioState.duration,             //总时长
        paused: state.AudioState.paused,                //播放、暂停
        audioRef: state.AudioState.audioRef,    // 音乐播放列表
        activeId: state.AudioState.activeId,    // 音乐播放列表
        Function_flush_playsonglist: state.CommonState.Function_flush_playsonglist
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
        // setList: () => {
        //     dispatch((() => {
        //         return async dispatch => {
        //             //ajax
        //             let result = await (await axios.get(`http://iecoxe.top:5000/v1/qq/search?key=许嵩`)).data;
        //             console.log(result);
        //             //ajax
        //             dispatch({
        //                 type: 'setList',
        //                 data: result.data.song.list
        //             })
        //         }
        //     })());
        // }
    };
}

class Audio extends Component {
    constructor(props) {
        super(props);
        // console.log(props);
    }


    render() {
        return (
            <View style={styles.AndioStyle}>
                {/* 歌曲信息 专辑图像 start */}
                <TouchableOpacity style={styles.SongInfo} onPress={() => {
                    if (this.props.activeId.length === 0) {
                        return;
                    }
                    this.props.navigation.navigate('SongDetails');
                }}>
                    <Image
                        style={styles.ALbumImage}
                        source={{
                            uri: this.props.activeImage.length === 0 ? 'https://iecoxe.gitee.io/music-app/defaultAlbum.jpg' : this.props.activeImage,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0'
                            }
                        }}
                        onError={({ nativeEvent: { error } }) => {}}
                    />
                    <View>
                        <Text numberOfLines={1} style={styles.SongInfoText}>{this.props.activeSong}</Text>
                        {/* <Text> - </Text> */}
                        <Text numberOfLines={1} style={{...styles.SongInfoText, opacity: 0.5, marginTop: 6, fontSize: 12}}>{this.props.activeSinger}</Text>
                    </View>
                </TouchableOpacity>
                {/* 歌曲信息 专辑图像 end */}
                {/* 歌曲控制按钮 start */}
                <View style={styles.IconStyle}>
                    <TouchableOpacity onPress={this.props.audioRef.stepbackward}>{/* 上一首歌曲 */}
                        <AntDesign style={styles.IconInnerStyle} name="stepbackward" size={24} color="black"></AntDesign>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.setAudioCommonState('setPaused', !this.props.paused)}>{/* 播放 暂停 */}
                        {
                            this.props.paused
                                ? <AntDesign style={styles.IconInnerStyle} name="pausecircleo" size={40} color="black"></AntDesign>
                                : <AntDesign style={styles.IconInnerStyle} name="playcircleo" size={40} color="black"></AntDesign>
                        }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.props.audioRef.stepforward}>{/* 下一首歌曲 */}
                        <AntDesign style={styles.IconInnerStyle} name="stepforward" size={24} color="black"></AntDesign>
                    </TouchableOpacity>
                    {/* 打开播放列表， Function_flush_playsonglist 播放列表的刷新函数，通过redux引用得到，目前咋不知道这种写法可有问题*/}
                    <TouchableOpacity onPress={() => {this.props.setAudioCommonState('setPlaySongListVisible', true); this.props.Function_flush_playsonglist()}}>{/* 歌曲播放列表 */}
                        <MaterialCommunityIcons style={styles.IconInnerStyle} name="playlist-music-outline" size={32} color="black"></MaterialCommunityIcons>
                    </TouchableOpacity>
                </View>
                {/* 歌曲控制按钮 end */}
            </View>
        );
    }
}

// Later on in your styles..
var styles = StyleSheet.create({
    /* Audio Component styles start */
    AndioStyle: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FFFFFF',
        // borderTopWidth: 1,
        height: 65,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    /* Audio Component styles end */
    /* Audio Icon Component styles start */
    IconStyle: {
        // backgroundColor: 'red',
        flexDirection: 'row',
        marginRight: 20,   /* 控制播放 上下按钮 marginRight 10 */
        alignItems: 'center'    /* 按钮图标 垂直居中 */
    },
    IconInnerStyle: {
        paddingLeft: 13
    },
    /* Audio Icon Component styles end */
    /* Audio SongInfo Component styles start */
    SongInfo: {
        // backgroundColor: 'green',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        marginLeft: 10,  /* 歌曲信息 专辑土图片 marginLeft 10 */
        width: '46%'
    },
    SongInfoText: {
        marginLeft: 8,
        // backgroundColor: 'red',
        width: 120
    },
    ALbumImage: {
        width: 45,
        height: 45,
        borderRadius: 14,
        resizeMode: 'stretch',
    }
    /* Audio SongInfo Component styles end */
});

export default connect(mapStateToProps, mapDispatchToProps)(Audio);