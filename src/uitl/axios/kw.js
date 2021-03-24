import axios from 'axios';

// WP_MUSIC地址映射
import WP_MUSIC_URL from '../../uitl/urlMapConstant';

export default async (rid, br='320') => {
    if (br === 'flac') {
        var result = (await axios.get(`http://iecoxe.top:5500`, {
            params: {
                rid
            }
        })).data;
    } else {
        var result = (await axios.get(WP_MUSIC_URL.KUWO_SONG, {
            params: {
                rid,
                br
            }
        })).data;
    }
    return result.url ? result.url : '';
}