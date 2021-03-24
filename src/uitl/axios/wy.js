import axios from 'axios';

// WP_MUSIC地址映射
import WP_MUSIC_URL from '../../uitl/urlMapConstant';

export default async (id) => {
    let result = (await axios.get(WP_MUSIC_URL.WY_SONG, {
        params: {
            id
        }
    })).data;
    return result.data[0].url === null ? '' : result.data[0].url;
}