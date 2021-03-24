const WP_MUSIC_HOST = 'http://iecoxe.top:5000';

const QQ = '/v1/qq';
const KUWO = '/v1/kuwo';
const MIGU = '/v1/migu';
const KUGOU = '/v1/kugou';

const SEARCH = '/search';
const HOTSEARCH = '/hotSearch';
const SUGGESTSEARCH = '/suggestSearch';

const SONG = '/song';

const LYRIC = '/lyric';

const TOPCATEGORY = '/topCategory';
const TOP = '/top';
export default {
    // 搜索
    QQ_SEARCH: WP_MUSIC_HOST + QQ + SEARCH,
    KUGOU_SEARCH: WP_MUSIC_HOST + KUGOU + SEARCH,
    KUWO_SEARCH: WP_MUSIC_HOST + KUWO + SEARCH,
    MIGU_SEARCH: WP_MUSIC_HOST + MIGU + SEARCH,
    WY_SEARCH: 'http://iecoxe.top:3000/cloudsearch',
    // 热搜
    QQ_HOTSEARCH: WP_MUSIC_HOST + QQ + HOTSEARCH,
    KUGOU_HOTSEARCH: WP_MUSIC_HOST + KUGOU + HOTSEARCH,
    KUWO_HOTSEARCH: WP_MUSIC_HOST + KUWO + HOTSEARCH,
    MIGU_HOTSEARCH: WP_MUSIC_HOST + MIGU + HOTSEARCH,
    WY_HOTSEARCH: 'http://iecoxe.top:3000/search/hot/detail',
    // 搜索建议
    QQ_SUGGESTSEARCH: WP_MUSIC_HOST + QQ + SUGGESTSEARCH,
    KUGOU_SUGGESTSEARCH: WP_MUSIC_HOST + KUGOU + SUGGESTSEARCH,
    KUWO_SUGGESTSEARCH: WP_MUSIC_HOST + KUWO + SUGGESTSEARCH,
    MIGU_SUGGESTSEARCH: WP_MUSIC_HOST + MIGU + SUGGESTSEARCH,
    // 获取歌曲播放地址
    QQ_SONG: WP_MUSIC_HOST + QQ + SONG,
    KUGOU_SONG: WP_MUSIC_HOST + KUGOU + SONG,
    KUWO_SONG: WP_MUSIC_HOST + KUWO + SONG,
    MIGU_SONG: WP_MUSIC_HOST + MIGU + SONG,
    WY_SONG: 'http://iecoxe.top:3000/song/url',
    // 获取歌词
    QQ_LYRIC: WP_MUSIC_HOST + QQ + LYRIC,
    // KUGOU_LYRIC: WP_MUSIC_HOST + KUGOU + LYRIC,
    KUWO_LYRIC: WP_MUSIC_HOST + KUWO + LYRIC,
    MIGU_LYRIC: WP_MUSIC_HOST + MIGU + LYRIC,
    WY_LYRIC: 'http://iecoxe.top:3000/lyric',
    // 获取排行榜分类
    QQ_TOPCATEGORY: WP_MUSIC_HOST + QQ + TOPCATEGORY,
    KUGOU_TOPCATEGORY: WP_MUSIC_HOST + KUGOU + TOPCATEGORY,
    KUWO_TOPCATEGORY: WP_MUSIC_HOST + KUWO + TOPCATEGORY,
    MIGU_TOPCATEGORY: WP_MUSIC_HOST + MIGU + TOPCATEGORY,
    WY_TOPCATEGORY: 'http://iecoxe.top:3000/toplist/detail',
    // 获取排行榜详情
    QQ_TOP: WP_MUSIC_HOST + QQ + TOP,
    KUGOU_TOP: WP_MUSIC_HOST + KUGOU + TOP,
    KUWO_TOP: WP_MUSIC_HOST + KUWO + TOP,
    MIGU_TOP: WP_MUSIC_HOST + MIGU + TOP,
    WY_TOP: 'http://iecoxe.top:3000/playlist/detail',

    WY_PLAYLIST: 'http://iecoxe.top:3000/playlist/detail',
    WY_SONGDETAIL: 'http://iecoxe.top:3000/song/detail',

    QQ_SONGDETAIL: WP_MUSIC_HOST + QQ + '/playlist/info'
}