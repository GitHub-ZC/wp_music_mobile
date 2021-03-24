import axios from "axios";
import React, { PureComponent } from "react";
import {
    Modal,
    Text,
    TouchableNativeFeedback,
    TouchableWithoutFeedback,
    View,
    ToastAndroid,
    TextInput
} from "react-native";

import { connect } from "react-redux";
import storage from '../storage';
// WP_MUSIC地址映射
import WP_MUSIC_URL from '../uitl/urlMapConstant';

// 映射state属性
const mapStateToProps = (state) => {
    return {
        PlayListInputVisible: state.CommonState.PlayListInputVisible,            // 是否打开歌曲的模态
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

class PlayListInput extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            inputValue: ''
        };
    }

    getSearchParams = (url) => {

    }

    // 新建歌单
    addPlayList = async () => {
        if (this.props.title === '导入歌单') {
            let re_wy_id = /id=(.*?)&/;

            let re_qq_id = /\/(\d*?)\.htm/;

            let wy_domain = this.state.inputValue.indexOf('music.163.com');
            let qq_domain = this.state.inputValue.indexOf('qq.com');

            if (qq_domain !== -1) {
                if (re_qq_id.exec(this.state.inputValue).length >= 2) {
                    let pid = re_qq_id.exec(this.state.inputValue)[1];
                    try {
                        let result = await axios.get(WP_MUSIC_URL.QQ_SONGDETAIL, {
                            params: {
                                pid: pid
                            }
                        });

                        if (result.data.code === 10) {
                            ToastAndroid.show("歌单不存在，请检查URL重试", ToastAndroid.SHORT);
                            return;
                        }

                        if (result.data.cdlist[0].songlist.length === 0) {
                            ToastAndroid.show("歌单歌曲数量为空", ToastAndroid.SHORT);
                            return;
                        }

                        this.props.setCommonState('setPlayListInputVisible', false);

                        let ret = [];
                        // 添加QQ歌曲
                        for (let song of result.data.cdlist[0].songlist) {
                            ret.push({
                                id: song.songmid,
                                songName: song.songname ? song.songname : '',
                                songAlbum: song.albumname ? song.albumname : '',
                                songSinger: song.singer ? song.singer.map(value => value.name).join('·') : '',
                                songImage: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.albummid}.jpg`,
                                musicSource: 'QQ'
                            })
                        }
                        storage.save({
                            key: 'playlist',
                            id: result.data.cdlist.length !== 0 ? result.data.cdlist[0].dissname : '导入歌单无名称 默认名字',
                            data: ret
                        });
                        this.props.GetStorageData();/* 刷新父组件 */
                        ToastAndroid.show(`${result.data.cdlist[0].dissname} 导入成功`, ToastAndroid.SHORT);
                        this.setState({ inputValue: '' });
                        ret = null;
                    } catch (error) {
                        ToastAndroid.show("网络请求错误,请重试", ToastAndroid.SHORT);
                    }
                }
                return;
            }

            // 网易云音乐 歌单导入
            if (wy_domain !== -1) {
                //  提取 id 参数
                if (re_wy_id.exec(this.state.inputValue + '&').length >= 2) {
                    let id = re_wy_id.exec(this.state.inputValue + '&')[1];
                    try {
                        let result = await axios.get(WP_MUSIC_URL.WY_PLAYLIST, {
                            params: {
                                id: id
                            }
                        });
                        if (result.data.playlist.trackIds.length === 0) {
                            ToastAndroid.show("歌单歌曲数量为空", ToastAndroid.SHORT);
                            return;
                        }
                        let queryString = result.data.playlist.trackIds.map(value => value.id).join(',');
                        let songDetail = await axios.get(WP_MUSIC_URL.WY_SONGDETAIL, {
                            params: {
                                ids: queryString
                            }
                        });
                        this.props.setCommonState('setPlayListInputVisible', false);

                        let ret = [];
                        // 添加网易云歌曲
                        for (let song of songDetail.data.songs) {
                            ret.push({
                                id: song.id,
                                songName: song.name,
                                songAlbum: song.al ? song.al.name : '',
                                songSinger: song.ar ? song.ar.map(value => value.name).join('·') : '',
                                songImage: song.al ? song.al.picUrl : 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3390212471,1883165446&fm=26&gp=0.jpg',
                                musicSource: 'WY'
                            })
                        }
                        storage.save({
                            key: 'playlist',
                            id: result.data.playlist.name ? result.data.playlist.name : '导入歌单无名称 默认名字',
                            data: ret
                        });
                        this.props.GetStorageData();/* 刷新父组件 */
                        ToastAndroid.show(`${result.data.playlist.name} 导入成功`, ToastAndroid.SHORT);
                        this.setState({ inputValue: '' });
                        ret = null;
                    } catch (error) {
                        ToastAndroid.show("网络请求错误,请重试", ToastAndroid.SHORT);
                    }
                }
                return;
            }

            ToastAndroid.show("URL 格式错误", ToastAndroid.SHORT);

        // 新建歌单部分
        } else if (this.props.title === '新建歌单') {
            if (this.state.inputValue.trim() === '') {
                ToastAndroid.show("名称不能为空", ToastAndroid.SHORT);
                return;
            }
            try {
                await storage.load({
                    key: 'playlist',
                    id: this.state.inputValue.trim(),
                });
                ToastAndroid.show("歌单重名 请修改内容重试", ToastAndroid.SHORT);
            } catch (error) {
                storage.save({
                    key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                    id: this.state.inputValue.trim(), // 注意:请不要在id中使用_下划线符号!
                    data: []
                });
                this.props.GetStorageData();/* 刷新父组件 */
                this.props.setCommonState('setPlayListInputVisible', false);
                ToastAndroid.show(`歌单 ${this.state.inputValue.trim()} 新建成功`, ToastAndroid.SHORT);
                this.setState({ inputValue: '' });
            }
        }
    }

    // 删除自定义歌单
    delPlayList = async () => {
        try {
            storage.remove({
                key: 'playlist',
                id: this.props.title,
            });
            this.props.GetStorageData();/* 刷新父组件 */
            this.props.setCommonState('setPlayListInputVisible', false);
            this.setState({ inputValue: '' });
            ToastAndroid.show("歌单删除成功", ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show(`歌单删除错误`, ToastAndroid.SHORT);
        }
    }

    // 编辑自定义歌单
    modifyPlayList = async () => {
        if (this.state.inputValue.trim() === '') {
            ToastAndroid.show("名称不能为空", ToastAndroid.SHORT);
            return;
        }
        if (this.state.inputValue.trim() === this.props.title) {
            ToastAndroid.show("当前名称并未修改", ToastAndroid.SHORT);
            return;
        }
        try {
            let ret = await storage.load({
                key: 'playlist',
                id: this.props.title,
            });

            storage.save({
                key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                id: this.state.inputValue.trim(), // 注意:请不要在id中使用_下划线符号!
                data: ret
            });

            storage.remove({
                key: 'playlist',
                id: this.props.title,
            });
        } catch (error) {
            storage.save({
                key: 'playlist', // 注意:请不要在key中使用_下划线符号!
                id: this.state.inputValue.trim(), // 注意:请不要在id中使用_下划线符号!
                data: []
            });
        }
        this.props.GetStorageData();/* 刷新父组件 */
        this.props.setCommonState('setPlayListInputVisible', false);
        ToastAndroid.show("修改成功", ToastAndroid.SHORT);
        this.setState({ inputValue: '' });
    }

    render() {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.props.PlayListInputVisible}
                onRequestClose={() => {
                    this.props.setCommonState('setPlayListInputVisible', false);
                    this.setState({ inputValue: '' });
                }}
                style={{ justifyContent: 'center', alignItems: 'center' }}
            >
                <TouchableWithoutFeedback onPress={() => { this.props.setCommonState('setPlayListInputVisible', false); this.setState({ inputValue: '' }) }}>
                    <View style={{ position: 'absolute', bottom: 0, top: 0, right: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                    </View>
                </TouchableWithoutFeedback>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{
                        height: 200,
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
                        alignItems: 'center',
                        justifyContent: 'space-evenly'
                    }}>
                        {/* 头部 */}
                        <View style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}>
                            {
                                (() => {
                                    if (this.props.title === '新建歌单') return <Text style={{ fontSize: 16 }}>新建歌单</Text>
                                    if (this.props.title === '导入歌单') return <Text style={{ fontSize: 16 }}>导入歌单</Text>
                                    return <Text style={{ fontSize: 16 }}>编辑歌单</Text>
                                })()
                            }
                        </View>
                        {/* 头部 */}
                        {/* 输入框 */}
                        <TextInput
                            style={{ height: 45, width: '90%', borderRadius: 10, paddingLeft: 10, fontSize: 15, backgroundColor: '#EEEEEE', zIndex: 1000 }}
                            onChangeText={text => this.setState({ inputValue: text })}
                            value={this.state.inputValue}
                            autoFocus={true}
                            blurOnSubmit={true}
                            returnKeyType={'search'}
                            placeholder={this.props.title === '导入歌单' ? '请填写 QQ 或 网易的歌单网址 URL' : this.props.title}
                        />
                        {/* 输入框 */}
                        {/* 确认按钮 */}
                        {
                            (this.props.title === '新建歌单' || this.props.title === '导入歌单') ?
                                <TouchableNativeFeedback onPress={this.addPlayList}>
                                    <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16 }}>确认</Text>
                                    </View>
                                </TouchableNativeFeedback>
                                :
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableNativeFeedback onPress={this.delPlayList}>
                                        <View style={{ height: 50, width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 16 }}>删除歌单</Text>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback onPress={this.modifyPlayList}>
                                        <View style={{ height: 50, width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 16 }}>确认修改</Text>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                        }
                        {/* 确认按钮 */}
                    </View>
                </View>
            </Modal>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayListInput);