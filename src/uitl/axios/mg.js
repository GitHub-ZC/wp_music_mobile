import axios from 'axios';

// WP_MUSIC地址映射
import WP_MUSIC_URL from '../../uitl/urlMapConstant';

export default async (cid, br='320') => {
    switch(br) {
        case '128': br = 1; break;
        case '320': br = 2; break;
        case 'flac': br = 3; break;
    }
    let result = (await axios.get(WP_MUSIC_URL.MIGU_SONG, {
        params: {
            cid,
            br
        }
    })).data;
    
    if (!result.data) {
        return '';
    }

    return result.data.playUrl ? `http:${result.data.playUrl}` : '';
}