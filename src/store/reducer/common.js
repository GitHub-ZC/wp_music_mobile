const defaultState = {
    musicSource: 'QQ',          // 音乐源 TX/MG/WY/KG/KW
    modalVisible: false,        // 歌曲模态框是否开启，默认不开启
    modalImage: '',             // 可以给张默认图片
    modalSongName: '',          // 模态框的歌曲名
    modalSongAlbum: '',         // 模态框的专辑名
    modalSinger: '',            // 模态框的歌手名
    modalId: '',                // 下载的歌曲Id
    modalMusicSource: '',       // 判断音乐源，不可使用audio store中的音乐源，因为不统一，
    modalAlbumId: '',           // 酷狗专用albumId
    PlaySongListVisible: false, // 播放列表是否显示
    PlayListInputVisible: false,
    Function_flush_playsonglist: null,
    Function_flush_playlist: null,
    Function_flush_getcolor: null,
    Function_flush_getlyric: null
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case 'setFunction_flush_getcolor': return {
            ...state,
            Function_flush_getcolor: action.data
        };
        case 'setFunction_flush_getlyric': return {
            ...state,
            Function_flush_getlyric: action.data
        };
        case 'setFunction_flush_playsonglist': return {
            ...state,
            Function_flush_playsonglist: action.data
        };
        case 'setFunction_flush_playlist': return {
            ...state,
            Function_flush_playlist: action.data
        };
        case 'setMusicSource': return {
            ...state,
            musicSource: action.data
        };
        case 'setPlayListInputVisible': return {
            ...state,
            PlayListInputVisible: action.data
        };
        case 'setModalVisible': return {
            ...state,
            modalVisible: action.data
        };
        case 'setModalImage': return {
            ...state,
            modalImage: action.data
        };
        case 'setModalSongName': return {
            ...state,
            modalSongName: action.data
        };
        case 'setModalSongAlbum': return {
            ...state,
            modalSongAlbum: action.data
        };
        case 'setModalSinger': return {
            ...state,
            modalSinger: action.data
        };
        case 'setModalId': return {
            ...state,
            modalId: action.data
        };
        case 'setModalMusicSource': return {
            ...state,
            modalMusicSource: action.data
        };
        case 'setModalAlbumId': return {
            ...state,
            modalAlbumId: action.data
        };
        case 'setPlaySongListVisible': return {
            ...state,
            PlaySongListVisible: action.data
        };
        default: return state;
    }
};