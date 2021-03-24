import axios from 'axios';

// WP_MUSIC地址映射
import WP_MUSIC_URL from '../../uitl/urlMapConstant';

export default async (aid, albumId) => {
    let result = (await axios.get(WP_MUSIC_URL.KUGOU_SONG, {
        params: {
            aid: albumId,
            hash: aid
        }
    })).data;
    return {
        img: result.data.img,
        URL: result.data.play_url,
        lyricStr: result.data.lyrics
    };
}