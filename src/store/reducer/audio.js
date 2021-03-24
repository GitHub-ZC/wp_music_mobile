const defaultState = {
    activeId: '',                  //正在播放的歌曲 ID
    activeSinger: '',      //正在播放的歌手
    activeSong: '',      //正在播放的歌
    activeAlbum: '',     //正在播放的专辑
    activeAlbumId: '',
    activeMusicSource: '',  //正在播放的音乐源
    activeImage: 'https://iecoxe.gitee.io/music-app/album.png',     //正在播放的专辑图像
    activeUri: 'https://freetyst.nf.migu.cn/public%2Fproduct5th%2Fproduct34%2F2019%2F05%2F3118%2F2009%E5%B9%B406%E6%9C%8826%E6%97%A5%E5%8D%9A%E5%B0%94%E6%99%AE%E6%96%AF%2F%E5%85%A8%E6%9B%B2%E8%AF%95%E5%90%AC%2FMp3_64_22_16%2F60054701913.mp3',
    currentTime: 0,       //当前播放的时间
    duration: 100,          //总时长
    paused: false,              //播放、暂停
    // playTypes: 'list',          // single, list, order, random
    playInBackground: true,    // 当app转到后台运行的时候，播放是否暂停, false 代表暂停
    // repeat: false,              // 是否重复播放一首歌曲
    audioRef: {}
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case 'setActiveSong': return {
            ...state,
            activeSong: action.data
        };
        case 'setActiveAlbumId': return {
            ...state,
            activeAlbumId: action.data
        };
        case 'setActiveMusicSource': return {
            ...state,
            activeMusicSource: action.data
        };
        case 'setActiveAlbum': return {
            ...state,
            activeAlbum: action.data
        };
        case 'setActiveImage': return {
            ...state,
            activeImage: action.data
        };
        case 'setCurrentTime': return {
            ...state,
            currentTime: action.data
        };
        case 'setDuration': return {
            ...state,
            duration: action.data
        };
        case 'setPaused': return {
            ...state,
            paused: action.data
        };
        case 'setActiveUri': return {
            ...state,
            activeUri: action.data
        };
        case 'setActiveSinger': return {
            ...state,
            activeSinger: action.data
        };
        case 'setPlayInBackground': return {
            ...state,
            playInBackground: action.data
        };
        case 'setAudioRef': return {
            ...state,
            audioRef: action.data
        };
        case 'setActiveId': return {
            ...state,
            activeId: action.data
        };
        case 'setRepeat': return {
            ...state,
            repeat: action.data
        };
        default: return state;
    }
};