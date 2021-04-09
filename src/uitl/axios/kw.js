import axios from 'axios';

// WP_MUSIC地址映射
// import WP_MUSIC_URL from '../../uitl/urlMapConstant';

export default async (rid, br = '320') => {

    switch(br) {
        case 'flac': br = '2000'; break;
    }
    
    var result = (await axios.get(`http://iecoxe.top:5500`, {
        params: {
            rid,
            br
        }
    })).data;

    return result.url ? result.url : '';
}