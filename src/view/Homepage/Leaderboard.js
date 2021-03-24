import React, { Component } from 'react';
import { Text, FlatList, StyleSheet, View, Image, RefreshControl, TouchableNativeFeedback, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';

import axios from 'axios';

import { connect } from "react-redux";

// WP_MUSIC地址映射
import WP_MUSIC_URL from '../../uitl/urlMapConstant';
import MusicSourceSwitch from '../../component/MusicSourceSwitch';

// 映射state属性
const mapStateToProps = (state) => {
	return {
		musicSource: state.CommonState.musicSource,            // 音乐源
	}
}

class Leaderboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			//网络请求状态
			error: false,
			errorInfo: "",
			dataArray: [],
			isRefreshing: false,//下拉控制
			musicSource: props.musicSource
		}
	}
	//网络请求——获取数据
	AxiosGetData = async () => {
		try {
			let LeaderboardArray = [];

			// 使用 条件 判断 排行榜当前属于 哪一个音乐源
			if (this.state.musicSource === 'QQ') {
				let result = await axios.get(WP_MUSIC_URL.QQ_TOPCATEGORY);

				result.data.topList.data.group.map(cateTop => {
					cateTop.toplist.map(value => {
						LeaderboardArray.push({
							topId: value.topId,
							title: value.title,
							songList: value.song,
							musichallPicUrl: value.musichallPicUrl
						})
					})
				})
			} else if (this.state.musicSource === 'WY') {
				let result = await axios.get(WP_MUSIC_URL.WY_TOPCATEGORY);

				result.data.list.map(cateTop => {
					let songlist = [];
					cateTop.tracks.map(song => {
						songlist.push({
							title: song.first,
							singerName: song.second
						})
					});
					LeaderboardArray.push({
						topId: cateTop.id,
						title: cateTop.name,
						songList: songlist,
						musichallPicUrl: cateTop.coverImgUrl
					})
					songlist = null;
				})
			} else if (this.state.musicSource === 'KG') {
				let result = await axios.get(WP_MUSIC_URL.KUGOU_TOPCATEGORY);

				result.data.data.info.map(cateTop => {

					let songlist = [];
					if (cateTop.songinfo) {
						cateTop.songinfo.map(song => {
							songlist.push({
								title: song.name,
								singerName: song.author
							})
						});
					}

					LeaderboardArray.push({
						topId: cateTop.rankid,
						title: cateTop.rankname,
						songList: songlist,
						musichallPicUrl: cateTop.album_img_9.replace('{size}', '400')
					});
					songlist = null;
				});
			} else if (this.state.musicSource === 'KW') {
				/* 同时请求酷我的PC和WEB两个接口，为了兼容显示官方排行榜的前三首歌曲 */
				let result = await axios.get(WP_MUSIC_URL.KUWO_TOPCATEGORY);
				let result1 = await axios.get(WP_MUSIC_URL.KUWO_TOPCATEGORY, {
					params: {
						from: 'web'
					}
				});

				/* 处理pc端 */
				result.data.data[0].list.map(cateTop => {
					let songlist = [];
					if (cateTop.music_list) {
						cateTop.music_list.map(song => {
							songlist.push({
								title: song.name,
								singerName: song.artist_name
							})
						});
					}
					LeaderboardArray.push({
						topId: cateTop.sourceid,
						title: cateTop.name,
						songList: songlist,
						musichallPicUrl: cateTop.pic
					});
					songlist = null;
				});
				/* 处理web端 */
				result1.data.data.splice(0, 1);
				result1.data.data.map(cateTop => {
					cateTop.list.map(value => {
						LeaderboardArray.push({
							topId: value.sourceid,
							title: value.name,
							songList: [],
							musichallPicUrl: value.pic
						});
					})
				});
			} else if (this.state.musicSource === 'MG') {
				let result = await axios.get(WP_MUSIC_URL.MIGU_TOPCATEGORY);

				result.data.data.topList.map(cateTop => {
					cateTop.list.map(value => {
						LeaderboardArray.push({
							topId: value.topId,
							title: value.topName,
							songList: [],
							musichallPicUrl: value.topImage
						});
					});
				});
			}
			this.setState({
				//复制数据源
				//  dataArray:this.state.dataArray.concat( responseData.results),
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

	/* 组件销毁中清理异步操作和取消请求 */
	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		}
	}

	// UNSAFE_componentWillUpdate() {
	// 	console.log('update');
	// 	// this.AxiosGetData();
	// }

	handleRefresh = () => {
		this.setState({
			isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
			// dataArray: []
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

	// 用于设置虚拟dom的key
	_keyExtractor = (item, index) => `${index}${item.topId}`;

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
			<TouchableNativeFeedback onPress={() => this.props.navigation.navigate('LeaderboardDetails', { topId: item.topId, musicSource: this.state.musicSource })}>
				<View style={styles.LeaderBoardBox}>
					<View style={styles.LeaderBoardSong}>
						<Text numberOfLines={1} style={styles.title}>{item.title}</Text>
						<Text numberOfLines={1} style={styles.content}>{'1. ' + `${item.songList.length >= 1 ? item.songList[0].title : ''}-${item.songList.length >= 1 ? item.songList[0].singerName : ''}`}</Text>
						<Text numberOfLines={1} style={styles.content}>{'2. ' + `${item.songList.length >= 2 ? item.songList[1].title : ''}-${item.songList.length >= 2 ? item.songList[1].singerName : ''}`}</Text>
						<Text numberOfLines={1} style={styles.content}>{'3. ' + `${item.songList.length >= 3 ? item.songList[2].title : ''}-${item.songList.length >= 3 ? item.songList[2].singerName : ''}`}</Text>
					</View>
					<Image
						style={styles.LeaderBoardImage}
						source={{
							uri: item.musichallPicUrl ? item.musichallPicUrl : 'https://iecoxe.gitee.io/music-app/LeaderBoard.jpg',
							headers: {
								'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0'
							}
						}}
						onError={({ nativeEvent: { error } }) => console.log(error)}
					/>
				</View>
			</TouchableNativeFeedback>
		);
	}

	setStateMusicSource = (musicsource) => {
		this.setState({
			musicSource: musicsource
		}, () => {
			this.setState({
				isRefreshing: true,//tag,下拉刷新中，加载完全，就设置成flase
				// dataArray: []
			});
			this.AxiosGetData();
		});
	}

	renderData = () => {
		return (
			<>
				<MusicSourceSwitch setStateMusicSource={this.setStateMusicSource} _musicSource={this.state.musicSource}></MusicSourceSwitch>
				<FlatList
					contentContainerStyle={{ alignItems: 'center', marginTop: 10, marginBottom: 50 }}
					data={this.state.dataArray}
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
		// backgroundColor: '#FFFFFF',
	},
	title: {
		// marginTop:8,
		marginLeft: 8,
		marginRight: 8,
		marginBottom: 8,
		fontSize: 18,
		color: '#ffa700',
	},
	content: {
		marginBottom: 10,
		marginLeft: 8,
		// marginRight:8,
		fontSize: 14,
		color: 'black',
	},
	LeaderBoardBox: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		backgroundColor: "#FFFFFF",
		width: '90%',
		height: 120,
		borderRadius: 10
	},
	LeaderBoardImage: {
		width: 110,
		height: 110,
		borderRadius: 10
	},
	LeaderBoardSong: {
		width: 190
	}
});

export default connect(mapStateToProps)(Leaderboard);