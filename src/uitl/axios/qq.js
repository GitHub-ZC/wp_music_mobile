import axios from 'axios';

// WP_MUSIC地址映射
import WP_MUSIC_URL from '../../uitl/urlMapConstant';

export default async (mid, br='128') => {
    let result = (await axios.get(WP_MUSIC_URL.QQ_SONG, {
        params: {
            mid,
            br
        }
    })).data;
    return JSON.stringify(result.data.url) === '{}' ? '' : result.data.url;
}