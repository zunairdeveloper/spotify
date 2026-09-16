/**
 * =========================================================
 * ZUMUT — MUSIC FOR YOUR MOOD
 * Developer: Zunair
 * Playback Engine: Ultra-reliable HTML5 Audio Streaming
 *                  + Instant Dynamic Search & Artist Discographies
 *                  + Local Full Tracks + 1-Click Full YouTube Video
 * =========================================================
 */
;(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────
     GLOBAL STATE
  ──────────────────────────────────────────────────────── */
  let isPlaying        = false;
  let isShuffle        = false;
  let repeatMode       = 'none'; // 'none' | 'all' | 'one'
  let currentView      = 'viewHome';
  let previousView     = 'viewHome';
  let currentSongIndex = 0;
  let activeQueue      = [];
  let lastVolume       = 0.8;
  let searchDebounce   = null;
  const artistCache    = {};

  let likedSongIds = new Set(
    JSON.parse(localStorage.getItem('zumut_liked_songs') || '["bts-1","atif-1","arj-1","diljit-1"]')
  );

  /* DOM references */
  let audio, mainPlayBtn, prevBtn, nextBtn, shuffleBtn, repeatBtn,
      playerTrackThumb, playerTrackTitle, playerTrackArtist, playerThumbGlow,
      playerLikeBtn, seekSlider, seekProgressFill, currentTimeLabel, durationLabel,
      volumeSlider, volumeProgressFill, volumeMuteBtn, volumeIcon, audioEqualizerBars,
      openFullSongBtn,
      globalSearchInput, clearSearchBtn, searchSpinner, navHome, navSearch, navSingers,
      navLiked, brandHomeBtn, likedCountBadge, libLikedCount, libLikedCard,
      featuredArtistsGrid, trendingSongsGrid, desiSongsGrid, globalSongsGrid,
      allSingersGrid, sidebarArtistUl, artistSongsTableBody, artistLoadingSpinner,
      artistSongsTableWrap, artistSongsCountSubtitle, likedSongsTableBody,
      likedEmptyState, likedViewCount, searchQueryEcho, searchTopResultCard,
      searchSongsTableBody, searchArtistsGrid, searchEmptyState,
      creatorModalOverlay, creatorHeaderBtn, creatorBadgeBtn, closeCreatorModalBtn,
      modalDismissBtn, toggleQueueBtn, queueDrawer, closeQueueBtn, queueCurrentCard,
      queueList, sidebar, openSidebarBtn, closeSidebarBtn, toastNotification,
      toastMessage, toastIcon;

  /* ────────────────────────────────────────────────────────
     INITIAL DATA & LOCAL WORKSPACE TRACKS
  ──────────────────────────────────────────────────────── */
  const LOCAL_FILES = [
    {
      id: 'local-1',
      title: 'Kontraa Nasha (Bollywood Pop)',
      artist: 'Kontraa & HitsLab',
      artistId: 'kontraa',
      album: 'Workspace Special',
      duration: '3:45',
      src: 'kontraa-nasha-bollywood-pop-music-451296.mp3',
      cover: 'zumut-logo.png',
      category: 'local',
      isTrending: true
    },
    {
      id: 'local-2',
      title: 'HitsLab Hindi Groove',
      artist: 'Kontraa & HitsLab',
      artistId: 'kontraa',
      album: 'Workspace Special',
      duration: '2:48',
      src: 'hitslab-indian-hindi-song-bollywood-music-351439 (1).mp3',
      cover: 'zumut-logo.png',
      category: 'local',
      isTrending: true
    },
    {
      id: 'local-3',
      title: 'Apalon Indian Beats',
      artist: 'Kontraa & HitsLab',
      artistId: 'kontraa',
      album: 'Workspace Special',
      duration: '3:12',
      src: 'apalonbeats-indian-music-indian-beat-491427.mp3',
      cover: 'zumut-logo.png',
      category: 'local',
      isTrending: false
    }
  ];

  const ARTISTS = [
    { id: 'bts',            name: 'BTS',              searchTerm: 'BTS',            role: 'Global K-Pop Legends',           listeners: '35,800,000', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80', category: 'kpop' },
    { id: 'atif-aslam',     name: 'Atif Aslam',       searchTerm: 'Atif Aslam',     role: 'King of Romantic Ballads',       listeners: '15,400,000', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80', category: 'bollywood' },
    { id: 'arijit-singh',   name: 'Arijit Singh',     searchTerm: 'Arijit Singh',   role: 'Voice of Modern Bollywood',      listeners: '39,200,000', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&q=80', category: 'bollywood' },
    { id: 'diljit-dosanjh', name: 'Diljit Dosanjh',   searchTerm: 'Diljit Dosanjh', role: 'Punjabi Music Global Icon',      listeners: '22,100,000', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80', category: 'punjabi' },
    { id: 'ap-dhillon',     name: 'AP Dhillon',       searchTerm: 'AP Dhillon',     role: 'Modern Punjabi Neo-Pop Pioneer', listeners: '17,500,000', image: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80', category: 'punjabi' },
    { id: 'the-weeknd',     name: 'The Weeknd',       searchTerm: 'The Weeknd',     role: 'Canadian Pop & Dark R&B Titan',  listeners: '116,000,000',image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80', category: 'international' },
    { id: 'taylor-swift',   name: 'Taylor Swift',     searchTerm: 'Taylor Swift',   role: 'Global Pop Cultural Icon',       listeners: '109,000,000',image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&q=80', category: 'international' },
    { id: 'shreya-ghoshal', name: 'Shreya Ghoshal',   searchTerm: 'Shreya Ghoshal', role: 'Queen of Melody - Bollywood',    listeners: '12,400,000', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80', category: 'bollywood' },
    { id: 'sidhu-moosewala',name: 'Sidhu Moosewala',  searchTerm: 'Sidhu Moosewala',role: 'Punjab Da Putt - Legend',         listeners: '10,200,000', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80', category: 'punjabi' },
    { id: 'kontraa',        name: 'Kontraa & HitsLab',searchTerm: 'Bollywood Pop',  role: 'Desi Dance Beats',               listeners: '4,500,000',  image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80', backdrop: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80', category: 'local' }
  ];

  let SONGS = [
    // BTS
    { id: 'bts-1',    title: 'Boy With Luv (feat. Halsey)',  artist: 'BTS',            artistId: 'bts',            album: 'MAP OF THE SOUL: PERSONA',  duration: '3:50', src: 'audio/3J7rt7bkDCY.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/40/d4/93/40d493e3-ac9e-1746-8d4c-f380f27c97cb/193483706238_Cover.jpg/600x600bb.jpg', category: 'kpop',         isTrending: true  },
    { id: 'bts-2',    title: 'FAKE LOVE',                    artist: 'BTS',            artistId: 'bts',            album: 'Love Yourself: Tear',        duration: '4:02', src: 'audio/0tWU94w_3ig.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/02/c5/18/02c518f5-ac06-3321-622e-08d9429fd968/192562556672_Cover.jpg/600x600bb.jpg', category: 'kpop',         isTrending: true  },
    { id: 'bts-3',    title: 'Dynamite',                     artist: 'BTS',            artistId: 'bts',            album: 'BE',                         duration: '3:20', src: 'audio/OiMWFojB9Ok.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/02/c5/18/02c518f5-ac06-3321-622e-08d9429fd968/192562556672_Cover.jpg/600x600bb.jpg', category: 'kpop',         isTrending: true  },
    { id: 'bts-4',    title: 'Butter',                       artist: 'BTS',            artistId: 'bts',            album: 'Butter',                     duration: '2:45', src: 'audio/X70Bq5XDZJk.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6c/fb/8e/6cfb8ef4-6d9b-d7d8-1925-5e581297e6e5/196006880095_Cover.jpg/600x600bb.jpg', category: 'kpop',         isTrending: true  },
    { id: 'bts-5',    title: 'DNA',                          artist: 'BTS',            artistId: 'bts',            album: 'Love Yourself: Her',         duration: '3:43', src: 'audio/SxAvr92fRg4.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/40/d4/93/40d493e3-ac9e-1746-8d4c-f380f27c97cb/193483706238_Cover.jpg/600x600bb.jpg', category: 'kpop',         isTrending: false },
    { id: 'bts-6',    title: 'Spring Day',                   artist: 'BTS',            artistId: 'bts',            album: 'You Never Walk Alone',       duration: '5:29', src: 'audio/xEeFrLSkMm8.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/02/c5/18/02c518f5-ac06-3321-622e-08d9429fd968/192562556672_Cover.jpg/600x600bb.jpg', category: 'kpop',         isTrending: false },
    { id: 'bts-7',    title: 'Permission to Dance',          artist: 'BTS',            artistId: 'bts',            album: 'Permission to Dance',        duration: '3:08', src: 'audio/t17w-JHYA28.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/02/c5/18/02c518f5-ac06-3321-622e-08d9429fd968/192562556672_Cover.jpg/600x600bb.jpg', category: 'kpop',         isTrending: true  },

    // Atif Aslam
    { id: 'atif-1',   title: 'Pehli Nazar Mein',             artist: 'Atif Aslam',     artistId: 'atif-aslam',     album: 'Race',                       duration: '4:42', src: 'audio/SxTYjptEzZs.m4a', cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', category: 'bollywood',    isTrending: true  },
    { id: 'atif-2',   title: 'Tu Jaane Na',                  artist: 'Atif Aslam',     artistId: 'atif-aslam',     album: 'Ajab Prem Ki Ghazab Kahani', duration: '5:35', src: 'audio/rQCP2qLtR7g.m4a', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', category: 'bollywood',    isTrending: true  },
    { id: 'atif-3',   title: 'Tere Sang Yaara',              artist: 'Atif Aslam',     artistId: 'atif-aslam',     album: 'Rustom',                     duration: '4:58', src: 'audio/5mpq_4rzB1U.m4a', cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', category: 'bollywood',    isTrending: false },
    { id: 'atif-4',   title: 'Tera Hone Laga Hoon',          artist: 'Atif Aslam',     artistId: 'atif-aslam',     album: 'Ajab Prem Ki Ghazab Kahani', duration: '3:21', src: 'audio/qpIdoaaPa6U.m4a', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', category: 'bollywood',    isTrending: false },
    { id: 'atif-5',   title: 'Woh Lamhe Woh Baatein',        artist: 'Atif Aslam',     artistId: 'atif-aslam',     album: 'Zeher',                      duration: '5:18', src: 'audio/mX0_1yejIQI.m4a', cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&q=80', category: 'bollywood',    isTrending: true  },

    // Arijit Singh
    { id: 'arj-1',    title: 'Tum Hi Ho',                    artist: 'Arijit Singh',   artistId: 'arijit-singh',   album: 'Aashiqui 2',                 duration: '4:27', src: 'audio/Umqb9KENgmk.m4a', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', category: 'bollywood',    isTrending: true  },
    { id: 'arj-2',    title: 'Kesariya',                     artist: 'Arijit Singh',   artistId: 'arijit-singh',   album: 'Brahmastra',                 duration: '2:52', src: 'audio/BddP6PYo2gs.m4a', cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&q=80', category: 'bollywood',    isTrending: true  },
    { id: 'arj-3',    title: 'Channa Mereya',                artist: 'Arijit Singh',   artistId: 'arijit-singh',   album: 'Ae Dil Hai Mushkil',         duration: '5:45', src: 'audio/bzSTpdcs-EI.m4a', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', category: 'bollywood',    isTrending: false },
    { id: 'arj-4',    title: 'Apna Bana Le',                 artist: 'Arijit Singh',   artistId: 'arijit-singh',   album: 'Bhediya',                    duration: '4:32', src: 'audio/u2NAuswnTKs.m4a', cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&q=80', category: 'bollywood',    isTrending: true  },
    { id: 'arj-5',    title: 'Raataan Lambiyan',             artist: 'Jubin Nautiyal', artistId: 'arijit-singh',   album: 'Shershaah',                  duration: '3:54', src: 'audio/orYf6VDtj_k.m4a', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', category: 'bollywood',    isTrending: true  },

    // Diljit Dosanjh
    { id: 'diljit-1', title: 'Lover',                        artist: 'Diljit Dosanjh', artistId: 'diljit-dosanjh', album: 'MoonChild Era',              duration: '3:07', src: 'audio/aoIhamvZKdQ.m4a', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80', category: 'punjabi',      isTrending: true  },
    { id: 'diljit-2', title: 'Born to Shine',                artist: 'Diljit Dosanjh', artistId: 'diljit-dosanjh', album: 'G.O.A.T.',                   duration: '3:33', src: 'audio/iLHEGrNVf5Y.m4a', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80', category: 'punjabi',      isTrending: true  },
    { id: 'diljit-3', title: 'Naina',                        artist: 'Diljit Dosanjh', artistId: 'diljit-dosanjh', album: 'Shadaa',                     duration: '2:53', src: 'audio/3u6lLWGjFLY.m4a', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80', category: 'punjabi',      isTrending: false },
    { id: 'diljit-4', title: 'Ikk Kudi',                     artist: 'Diljit Dosanjh', artistId: 'diljit-dosanjh', album: 'Udta Punjab',                duration: '3:07', src: 'audio/ZbX_nlzv7uU.m4a', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80', category: 'punjabi',      isTrending: true  },

    // AP Dhillon
    { id: 'ap-1',     title: 'Brown Munde',                  artist: 'AP Dhillon',     artistId: 'ap-dhillon',     album: 'Run-Up Records',             duration: '4:14', src: 'audio/YBTVJ_jWIGk.m4a', cover: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=600&q=80', category: 'punjabi',      isTrending: true  },
    { id: 'ap-2',     title: 'Excuses',                      artist: 'AP Dhillon',     artistId: 'ap-dhillon',     album: 'Hidden Gems',                duration: '3:00', src: 'audio/38Hc9vK5OF4.m4a', cover: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=600&q=80', category: 'punjabi',      isTrending: true  },
    { id: 'ap-3',     title: 'With You',                     artist: 'AP Dhillon',     artistId: 'ap-dhillon',     album: 'With You - Single',          duration: '2:35', src: 'audio/fe9udc210tM.m4a', cover: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=600&q=80', category: 'punjabi',      isTrending: false },
    { id: 'ap-4',     title: 'Dil Nu',                       artist: 'AP Dhillon',     artistId: 'ap-dhillon',     album: 'Dil Nu - Single',            duration: '3:54', src: 'audio/p2EdDiiVHh4.m4a', cover: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=600&q=80', category: 'punjabi',      isTrending: true  },

    // The Weeknd
    { id: 'wknd-1',   title: 'Blinding Lights',              artist: 'The Weeknd',     artistId: 'the-weeknd',     album: 'After Hours',                duration: '3:23', src: 'audio/fHI8X4OXluQ.m4a', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80', category: 'international', isTrending: true  },
    { id: 'wknd-2',   title: 'Starboy (feat. Daft Punk)',    artist: 'The Weeknd',     artistId: 'the-weeknd',     album: 'Starboy',                    duration: '3:51', src: 'audio/Rif-RTvmmss.m4a', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80', category: 'international', isTrending: true  },
    { id: 'wknd-3',   title: 'Save Your Tears',              artist: 'The Weeknd',     artistId: 'the-weeknd',     album: 'After Hours',                duration: '3:37', src: 'audio/u6lihZAcy4s.m4a', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80', category: 'international', isTrending: false },
    { id: 'wknd-4',   title: 'The Hills',                    artist: 'The Weeknd',     artistId: 'the-weeknd',     album: 'Beauty Behind the Madness',  duration: '4:02', src: 'audio/G5XpJP7f_SE.m4a', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80', category: 'international', isTrending: true  },

    // Taylor Swift
    { id: 'ts-1',     title: 'Cruel Summer',                 artist: 'Taylor Swift',   artistId: 'taylor-swift',   album: 'Lover',                      duration: '2:59', src: 'audio/ic8j13piAhQ.m4a', cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80', category: 'international', isTrending: true  },
    { id: 'ts-2',     title: 'Anti-Hero',                    artist: 'Taylor Swift',   artistId: 'taylor-swift',   album: 'Midnights',                  duration: '3:24', src: 'audio/XqN2qFvY64U.m4a', cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80', category: 'international', isTrending: true  },
    { id: 'ts-3',     title: 'Shake It Off',                 artist: 'Taylor Swift',   artistId: 'taylor-swift',   album: '1989',                       duration: '4:02', src: 'audio/nfWlot6h_JM.m4a', cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80', category: 'international', isTrending: false },
    { id: 'ts-4',     title: 'Love Story (Taylor\'s Version)',artist: 'Taylor Swift',  artistId: 'taylor-swift',   album: 'Fearless',                   duration: '4:00', src: 'audio/aXzVF3XeS8M.m4a', cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80', category: 'international', isTrending: true  },

    // Full Studio Local Tracks
    ...LOCAL_FILES
  ];

  activeQueue = [...SONGS];

  /* ────────────────────────────────────────────────────────
     ITUNES SEARCH API VIA JSONP (Direct, instant audio links)
  ──────────────────────────────────────────────────────── */
  function itunesSearch(term, limit = 25) {
    return new Promise(resolve => {
      const cb  = '_zcb_' + Math.random().toString(36).slice(2) + '_' + Date.now();
      const scr = document.createElement('script');
      const timer = setTimeout(() => {
        delete window[cb];
        scr.remove();
        resolve({ resultCount: 0, results: [] });
      }, 7000);

      window[cb] = data => {
        clearTimeout(timer);
        delete window[cb];
        scr.remove();
        resolve(data);
      };

      scr.src = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}&callback=${cb}`;
      scr.onerror = () => {
        clearTimeout(timer);
        delete window[cb];
        scr.remove();
        resolve({ resultCount: 0, results: [] });
      };
      document.head.appendChild(scr);
    });
  }

  /* Resolves direct playable audio URL for any song */
  async function resolveSongSrc(song) {
    if (song.src) return song.src;

    try {
      const query = `${song.title} ${song.artist}`.replace(/[\(\)\[\]\-]/g, ' ').trim();
      const data = await itunesSearch(query, 5);

      if (data.results && data.results.length > 0) {
        // Find best match with previewUrl
        const titleKey = song.title.toLowerCase().split('(')[0].trim();
        const match = data.results.find(r => r.previewUrl && r.trackName.toLowerCase().includes(titleKey))
                   || data.results.find(r => r.previewUrl);

        if (match && match.previewUrl) {
          song.src = match.previewUrl;
          if (match.artworkUrl100) {
            song.cover = match.artworkUrl100.replace('100x100', '600x600');
          }
          return song.src;
        }
      }
    } catch (err) {
      console.warn('resolveSongSrc lookup error:', err);
    }

    // Default fallback to local full song
    const fallback = LOCAL_FILES[0];
    song.src = fallback.src;
    return fallback.src;
  }

  /* ────────────────────────────────────────────────────────
     ARTIST CATALOG (Dynamically loads real songs for any singer)
  ──────────────────────────────────────────────────────── */
  async function fetchArtistSongs(artist) {
    if (artistCache[artist.id]) return artistCache[artist.id];

    if (artist.id === 'kontraa') {
      artistCache[artist.id] = LOCAL_FILES;
      return LOCAL_FILES;
    }

    const knownFullSongs = SONGS.filter(s => s.artistId === artist.id);

    try {
      const data = await itunesSearch(artist.searchTerm || artist.name, 35);
      if (data.results && data.results.length > 0) {
        const playableTracks = data.results
          .filter(r => r.previewUrl)
          .map((r, idx) => ({
            id: `${artist.id}-live-${r.trackId || idx}`,
            title: r.trackName,
            artist: r.artistName,
            artistId: artist.id,
            album: r.collectionName || 'Single / Hit Album',
            duration: formatTime((r.trackTimeMillis || 180000) / 1000),
            src: r.previewUrl,
            cover: (r.artworkUrl100 || artist.image).replace('100x100', '600x600'),
            category: artist.category || 'music',
            isTrending: idx < 6
          }));

        // Put full studio songs at the top, followed by other online songs
        const combined = [...knownFullSongs];
        playableTracks.forEach(pt => {
          const titleKey = pt.title.toLowerCase().split('(')[0].trim();
          if (!combined.some(k => k.title.toLowerCase().includes(titleKey) || titleKey.includes(k.title.toLowerCase().split('(')[0].trim()))) {
            combined.push(pt);
            if (!SONGS.some(s => s.title === pt.title && s.artist === pt.artist)) {
              SONGS.push(pt);
            }
          }
        });

        artistCache[artist.id] = combined;
        return combined;
      }
    } catch (e) {
      console.warn('fetchArtistSongs error:', e);
    }

    artistCache[artist.id] = knownFullSongs.length ? knownFullSongs : LOCAL_FILES;
    return artistCache[artist.id];
  }

  /* ────────────────────────────────────────────────────────
     DOM INITIALIZATION
  ──────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // Audio element
    audio                  = document.getElementById('globalAudio');

    // Controls
    mainPlayBtn            = document.getElementById('mainPlayBtn');
    prevBtn                = document.getElementById('prevBtn');
    nextBtn                = document.getElementById('nextBtn');
    shuffleBtn             = document.getElementById('shuffleBtn');
    repeatBtn              = document.getElementById('repeatBtn');

    // Player Track Info
    playerTrackThumb       = document.getElementById('playerTrackThumb');
    playerTrackTitle       = document.getElementById('playerTrackTitle');
    playerTrackArtist      = document.getElementById('playerTrackArtist');
    playerThumbGlow        = document.getElementById('playerThumbGlow');
    playerLikeBtn          = document.getElementById('playerLikeBtn');

    // Seek Slider & Labels
    seekSlider             = document.getElementById('seekSlider');
    seekProgressFill       = document.getElementById('seekProgressFill');
    currentTimeLabel       = document.getElementById('currentTimeLabel');
    durationLabel          = document.getElementById('durationLabel');

    // Volume & Visualizer
    volumeSlider           = document.getElementById('volumeSlider');
    volumeProgressFill     = document.getElementById('volumeProgressFill');
    volumeMuteBtn          = document.getElementById('volumeMuteBtn');
    volumeIcon             = document.getElementById('volumeIcon');
    audioEqualizerBars     = document.getElementById('audioEqualizerBars');
    openFullSongBtn        = document.getElementById('openFullSongBtn');

    // Search Bar
    globalSearchInput      = document.getElementById('globalSearchInput');
    clearSearchBtn         = document.getElementById('clearSearchBtn');
    searchSpinner          = document.getElementById('searchSpinner');

    // Navigation & Library
    navHome                = document.getElementById('navHome');
    navSearch              = document.getElementById('navSearch');
    navSingers             = document.getElementById('navSingers');
    navLiked               = document.getElementById('navLiked');
    brandHomeBtn           = document.getElementById('brandHomeBtn');
    likedCountBadge        = document.getElementById('likedCountBadge');
    libLikedCount          = document.getElementById('libLikedCount');
    libLikedCard           = document.getElementById('libLikedCard');

    // Grids
    featuredArtistsGrid    = document.getElementById('featuredArtistsGrid');
    trendingSongsGrid      = document.getElementById('trendingSongsGrid');
    desiSongsGrid          = document.getElementById('desiSongsGrid');
    globalSongsGrid        = document.getElementById('globalSongsGrid');
    allSingersGrid         = document.getElementById('allSingersGrid');
    sidebarArtistUl        = document.getElementById('sidebarArtistUl');

    // Artist Detail View
    artistSongsTableBody   = document.getElementById('artistSongsTableBody');
    artistLoadingSpinner   = document.getElementById('artistLoadingSpinner');
    artistSongsTableWrap   = document.getElementById('artistSongsTableWrap');
    artistSongsCountSubtitle = document.getElementById('artistSongsCountSubtitle');

    // Liked View
    likedSongsTableBody    = document.getElementById('likedSongsTableBody');
    likedEmptyState        = document.getElementById('likedEmptyState');
    likedViewCount         = document.getElementById('likedViewCount');

    // Search View
    searchQueryEcho        = document.getElementById('searchQueryEcho');
    searchTopResultCard    = document.getElementById('searchTopResultCard');
    searchSongsTableBody   = document.getElementById('searchSongsTableBody');
    searchArtistsGrid      = document.getElementById('searchArtistsGrid');
    searchEmptyState       = document.getElementById('searchEmptyState');

    // Modals & Drawers
    creatorModalOverlay    = document.getElementById('creatorModalOverlay');
    creatorHeaderBtn       = document.getElementById('creatorHeaderBtn');
    creatorBadgeBtn        = document.getElementById('creatorBadgeBtn');
    closeCreatorModalBtn   = document.getElementById('closeCreatorModalBtn');
    modalDismissBtn        = document.getElementById('modalDismissBtn');
    toggleQueueBtn         = document.getElementById('toggleQueueBtn');
    queueDrawer            = document.getElementById('queueDrawer');
    closeQueueBtn          = document.getElementById('closeQueueBtn');
    queueCurrentCard       = document.getElementById('queueCurrentCard');
    queueList              = document.getElementById('queueList');
    sidebar                = document.getElementById('sidebar');
    openSidebarBtn         = document.getElementById('openSidebarBtn');
    closeSidebarBtn        = document.getElementById('closeSidebarBtn');
    toastNotification      = document.getElementById('toastNotification');
    toastMessage           = document.getElementById('toastMessage');
    toastIcon              = document.getElementById('toastIcon');

    // Setup Audio events
    setupAudioEvents();

    // Volume initial state
    audio.volume = lastVolume;
    updateVolumeSliderUI(lastVolume);

    // Render Initial UI
    setupGreeting();
    renderSidebarArtists();
    renderFeaturedArtists();
    renderSongGrids();
    renderAllSingersGrid();
    updateLikedCounters();

    // Pre-load first song into UI
    loadSongUI(SONGS[0]);

    // Attach user events
    attachEventListeners();
  });

  /* ────────────────────────────────────────────────────────
     AUDIO EVENTS (HTML5 Standard)
  ──────────────────────────────────────────────────────── */
  function setupAudioEvents() {
    if (!audio) return;

    audio.addEventListener('play', () => {
      isPlaying = true;
      if (mainPlayBtn) mainPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      if (playerThumbGlow) playerThumbGlow.style.opacity = '1';
      if (audioEqualizerBars) audioEqualizerBars.classList.add('playing');
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      if (mainPlayBtn) mainPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      if (playerThumbGlow) playerThumbGlow.style.opacity = '0';
      if (audioEqualizerBars) audioEqualizerBars.classList.remove('playing');
    });

    audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(audio.duration) && audio.duration > 0 && seekSlider) {
        seekSlider.max = Math.floor(audio.duration);
        if (durationLabel) durationLabel.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (!isNaN(audio.duration) && audio.duration > 0 && seekSlider) {
        seekSlider.value = Math.floor(audio.currentTime);
        if (currentTimeLabel) currentTimeLabel.textContent = formatTime(audio.currentTime);
        if (durationLabel && (!durationLabel.textContent || durationLabel.textContent === '0:00' || durationLabel.textContent === '--:--')) {
          durationLabel.textContent = formatTime(audio.duration);
        }
        if (seekProgressFill) {
          seekProgressFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        }
      }
    });

    // Continuous Play / Repeat Handling
    audio.addEventListener('ended', () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        _nextSong();
      }
    });

    // Error recovery
    audio.addEventListener('error', async () => {
      console.warn('Audio stream error, attempting fallback...');
      const song = activeQueue[currentSongIndex];
      if (song) {
        song.src = null; // force fresh lookup
        const newSrc = await resolveSongSrc(song);
        audio.src = newSrc;
        audio.load();
        audio.play().catch(console.warn);
      }
    });
  }

  /* ────────────────────────────────────────────────────────
     PLAYER CONTROLS & PLAYBACK ENGINE
  ──────────────────────────────────────────────────────── */
  async function startPlaying(song) {
    if (!song) return;

    loadSongUI(song);

    try {
      // Ensure we have a valid audio stream URL
      const audioUrl = await resolveSongSrc(song);

      if (!audioUrl) {
        showToast('Unable to load audio track', 'unlike');
        return;
      }

      audio.src = audioUrl;
      audio.volume = lastVolume;
      audio.load();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            showToast(`▶ Playing ${song.title}`, 'info');
          })
          .catch(err => {
            console.warn('Playback prevented:', err);
            showToast(`Click Play button to listen`, 'info');
          });
      }
    } catch (err) {
      console.error('Playback error:', err);
      showToast('Error playing song', 'unlike');
    }
  }

  function togglePlayPause() {
    if (isPlaying) {
      audio.pause();
    } else {
      const song = activeQueue[currentSongIndex];
      if (audio.src && audio.src !== window.location.href && !audio.src.endsWith('/')) {
        audio.play().catch(console.warn);
      } else if (song) {
        startPlaying(song);
      }
    }
  }

  async function _nextSong() {
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * activeQueue.length);
    } else {
      nextIdx = currentSongIndex + 1;
      if (nextIdx >= activeQueue.length) nextIdx = 0;
    }
    currentSongIndex = nextIdx;
    await startPlaying(activeQueue[currentSongIndex]);
  }

  async function _prevSong() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prevIdx = currentSongIndex - 1;
    if (prevIdx < 0) prevIdx = activeQueue.length - 1;
    currentSongIndex = prevIdx;
    await startPlaying(activeQueue[currentSongIndex]);
  }

  async function playSpecificSong(song) {
    let idx = activeQueue.findIndex(s => s.id === song.id || (s.title === song.title && s.artist === song.artist));
    if (idx === -1) {
      activeQueue.unshift(song);
      idx = 0;
    }
    currentSongIndex = idx;
    await startPlaying(song);
  }

  function loadSongUI(song) {
    if (!song || !playerTrackTitle) return;
    playerTrackTitle.textContent  = song.title;
    playerTrackArtist.textContent = song.artist;
    playerTrackThumb.src          = song.cover || 'zumut-logo.png';
    playerTrackThumb.onerror      = () => { playerTrackThumb.src = 'zumut-logo.png'; };

    updatePlayerLikeIcon(song.id);
    if (seekSlider) seekSlider.value = 0;
    if (seekProgressFill) seekProgressFill.style.width = '0%';
    if (currentTimeLabel) currentTimeLabel.textContent = '0:00';
    if (durationLabel) durationLabel.textContent = song.duration || '0:00';

    updateQueueDrawerUI();
    highlightActiveRow();
  }

  function highlightActiveRow() {
    const cur = activeQueue[currentSongIndex];
    if (!cur) return;
    document.querySelectorAll('.songs-table tbody tr').forEach(tr => {
      const t = tr.querySelector('.song-row-title');
      tr.classList.toggle('active', !!(t && t.textContent.trim() === cur.title.trim()));
    });
  }

  /* ────────────────────────────────────────────────────────
     UI RENDERING
  ──────────────────────────────────────────────────────── */
  function setupGreeting() {
    const el = document.getElementById('dynamicGreeting');
    if (!el) return;
    const h = new Date().getHours();
    el.textContent = h < 12 ? 'Good Morning, Zunair' : h < 17 ? 'Good Afternoon, Zunair' : 'Good Evening, Zunair';
  }

  function renderSidebarArtists() {
    if (!sidebarArtistUl) return;
    sidebarArtistUl.innerHTML = '';
    ARTISTS.forEach(a => {
      const li = document.createElement('li');
      li.innerHTML = `<div class="artist-avatar-mini">${a.name.charAt(0)}</div><span>${a.name}</span>`;
      li.addEventListener('click', () => {
        openArtistDetail(a.id);
        if (window.innerWidth <= 850 && sidebar) sidebar.classList.remove('mobile-open');
      });
      sidebarArtistUl.appendChild(li);
    });
  }

  function renderFeaturedArtists() {
    if (!featuredArtistsGrid) return;
    featuredArtistsGrid.innerHTML = '';
    ARTISTS.slice(0, 9).forEach(a => featuredArtistsGrid.appendChild(createArtistCard(a)));
  }

  function renderAllSingersGrid() {
    if (!allSingersGrid) return;
    allSingersGrid.innerHTML = '';
    ARTISTS.forEach(a => allSingersGrid.appendChild(createArtistCard(a, true)));
  }

  function createArtistCard(artist, large = false) {
    const card = document.createElement('div');
    card.className = 'artist-card';
    card.innerHTML = `
      <div class="artist-img-wrap">
        <img src="${artist.image}" alt="${artist.name}" class="artist-img" onerror="this.src='zumut-logo.png'">
        <button class="artist-card-play-btn" title="Play ${artist.name}"><i class="fa-solid fa-play"></i></button>
      </div>
      <div class="artist-name">${artist.name}</div>
      <div class="artist-role">Artist • ${artist.listeners.split(',')[0]}M fans</div>`;

    card.addEventListener('click', e => {
      if (e.target.closest('.artist-card-play-btn')) {
        playArtistAll(artist.id);
      } else {
        openArtistDetail(artist.id);
      }
    });
    return card;
  }

  function renderSongGrids() {
    if (trendingSongsGrid) {
      trendingSongsGrid.innerHTML = '';
      SONGS.filter(s => s.isTrending).slice(0, 8).forEach(s => trendingSongsGrid.appendChild(createSongCard(s)));
    }
    if (desiSongsGrid) {
      desiSongsGrid.innerHTML = '';
      SONGS.filter(s => s.category === 'bollywood' || s.category === 'local').slice(0, 8).forEach(s => desiSongsGrid.appendChild(createSongCard(s)));
    }
    if (globalSongsGrid) {
      globalSongsGrid.innerHTML = '';
      SONGS.filter(s => ['international', 'kpop', 'punjabi'].includes(s.category)).slice(0, 8).forEach(s => globalSongsGrid.appendChild(createSongCard(s)));
    }
  }

  function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    const liked = likedSongIds.has(song.id);
    card.innerHTML = `
      <div class="song-thumb-wrap">
        <img src="${song.cover}" alt="${song.title}" class="song-thumb" onerror="this.src='zumut-logo.png'">
        <button class="song-card-play-btn" title="Play ${song.title}"><i class="fa-solid fa-play"></i></button>
      </div>
      <button class="song-card-like${liked ? ' liked' : ''}" data-id="${song.id}" title="Like">
        <i class="fa-${liked ? 'solid' : 'regular'} fa-heart"></i>
      </button>
      <div class="song-card-title" title="${song.title}">${song.title}</div>
      <div class="song-card-artist">${song.artist}</div>`;

    card.addEventListener('click', e => {
      if (e.target.closest('.song-card-like')) {
        toggleLike(song.id);
        return;
      }
      playSpecificSong(song);
    });
    return card;
  }

  /* ────────────────────────────────────────────────────────
     ARTIST DETAIL VIEW
  ──────────────────────────────────────────────────────── */
  async function openArtistDetail(artistId) {
    const artist = ARTISTS.find(a => a.id === artistId);
    if (!artist) return;

    document.getElementById('artistHeroName').textContent    = artist.name;
    document.getElementById('artistSectionName').textContent = artist.name;
    document.getElementById('artistHeroStats').textContent   = `${artist.listeners} monthly listeners • ${artist.role}`;
    document.getElementById('artistBackdrop').style.backgroundImage = `url('${artist.backdrop || artist.image}')`;

    artistSongsCountSubtitle.textContent = 'Loading discography...';
    artistLoadingSpinner.style.display   = 'block';
    artistSongsTableWrap.style.display   = 'none';

    switchView('viewArtistDetail');

    const songs = await fetchArtistSongs(artist);
    artistLoadingSpinner.style.display   = 'none';
    artistSongsTableWrap.style.display   = 'block';
    artistSongsCountSubtitle.textContent = `${songs.length} Tracks available • High Quality Audio`;

    renderSongsTable(artistSongsTableBody, songs);

    document.getElementById('artistPlayAllBtn').onclick = async () => {
      if (songs.length) {
        activeQueue = [...songs];
        currentSongIndex = 0;
        await startPlaying(songs[0]);
        showToast(`Playing discography of ${artist.name}`, 'info');
      }
    };
  }

  async function playArtistAll(artistId) {
    const artist = ARTISTS.find(a => a.id === artistId);
    if (!artist) return;
    showToast(`Loading songs for ${artist.name}...`, 'info');
    const songs = await fetchArtistSongs(artist);
    if (songs.length) {
      activeQueue = [...songs];
      currentSongIndex = 0;
      await startPlaying(songs[0]);
    }
  }

  /* ────────────────────────────────────────────────────────
     TABLE COMPONENT
  ──────────────────────────────────────────────────────── */
  function renderSongsTable(tbody, songList) {
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!songList.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">No songs found.</td></tr>`;
      return;
    }

    songList.forEach((song, idx) => {
      const tr = document.createElement('tr');
      const liked = likedSongIds.has(song.id);
      if (activeQueue[currentSongIndex]?.id === song.id) tr.classList.add('active');

      tr.innerHTML = `
        <td class="song-row-number">${idx + 1}</td>
        <td>
          <div class="song-row-flex">
            <img src="${song.cover}" alt="" class="song-row-thumb" onerror="this.src='zumut-logo.png'">
            <div class="song-row-info">
              <div class="song-row-title">${song.title}</div>
              <div class="song-row-artist">${song.artist}</div>
            </div>
          </div>
        </td>
        <td>${song.album}</td>
        <td style="text-align:center;">
          <button class="table-like-btn${liked ? ' liked' : ''}" data-id="${song.id}">
            <i class="fa-${liked ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </td>
        <td style="text-align:right;font-variant-numeric:tabular-nums;">${song.duration}</td>`;

      tr.addEventListener('click', e => {
        if (e.target.closest('.table-like-btn')) {
          toggleLike(song.id);
          return;
        }
        playSpecificSong(song);
      });
      tbody.appendChild(tr);
    });
  }

  /* ────────────────────────────────────────────────────────
     LIKED SONGS
  ──────────────────────────────────────────────────────── */
  function openLikedSongsView() {
    const liked = SONGS.filter(s => likedSongIds.has(s.id));
    if (likedViewCount) likedViewCount.textContent = `${liked.length} song${liked.length === 1 ? '' : 's'}`;

    if (!liked.length) {
      if (likedEmptyState) likedEmptyState.style.display = 'block';
      if (likedSongsTableBody) likedSongsTableBody.innerHTML = '';
    } else {
      if (likedEmptyState) likedEmptyState.style.display = 'none';
      renderSongsTable(likedSongsTableBody, liked);
    }

    const playAllLikedBtn = document.getElementById('playAllLikedBtn');
    if (playAllLikedBtn) {
      playAllLikedBtn.onclick = () => {
        if (liked.length) {
          activeQueue = [...liked];
          playSpecificSong(liked[0]);
        } else {
          showToast('No liked songs yet!', 'info');
        }
      };
    }
    switchView('viewLikedSongs');
  }

  /* ────────────────────────────────────────────────────────
     UNIVERSAL SEARCH (Local + Online)
  ──────────────────────────────────────────────────────── */
  function handleSearch(query) {
    const q  = query.trim();
    const ql = q.toLowerCase();

    if (!q) {
      clearSearchBtn.style.display = 'none';
      searchSpinner.classList.remove('active');
      if (currentView === 'viewSearchResults') switchView(previousView || 'viewHome');
      return;
    }

    clearSearchBtn.style.display = 'block';
    searchQueryEcho.textContent  = query;

    // Filter local library instantly
    const localSongs   = SONGS.filter(s => s.title.toLowerCase().includes(ql) || s.artist.toLowerCase().includes(ql) || s.album.toLowerCase().includes(ql));
    const localArtists = ARTISTS.filter(a => a.name.toLowerCase().includes(ql) || a.role.toLowerCase().includes(ql));

    showSearchResults(localSongs, localArtists, q);
    if (currentView !== 'viewSearchResults') switchView('viewSearchResults');

    // Debounced Online iTunes Search
    clearTimeout(searchDebounce);
    searchSpinner.classList.add('active');

    searchDebounce = setTimeout(async () => {
      try {
        const data = await itunesSearch(q, 30);
        searchSpinner.classList.remove('active');

        if (data.results && data.results.length > 0) {
          const onlineTracks = data.results
            .filter(r => r.previewUrl)
            .map((r, idx) => ({
              id: `online-${r.trackId || idx}`,
              title: r.trackName,
              artist: r.artistName,
              artistId: 'online',
              album: r.collectionName || 'Single',
              duration: formatTime((r.trackTimeMillis || 180000) / 1000),
              src: r.previewUrl,
              cover: (r.artworkUrl100 || 'zumut-logo.png').replace('100x100', '600x600'),
              category: 'online',
              isTrending: false
            }));

          // Add to global library
          onlineTracks.forEach(ot => {
            if (!SONGS.some(s => s.title === ot.title && s.artist === ot.artist)) {
              SONGS.push(ot);
            }
          });

          // Merge without duplicates
          const mergedSongs = [...localSongs];
          onlineTracks.forEach(ot => {
            if (!mergedSongs.some(m => m.id === ot.id || (m.title === ot.title && m.artist === ot.artist))) {
              mergedSongs.push(ot);
            }
          });

          showSearchResults(mergedSongs, localArtists, q);
        }
      } catch (err) {
        searchSpinner.classList.remove('active');
      }
    }, 350);
  }

  function showSearchResults(songs, artists, q) {
    if (!songs.length && !artists.length) {
      searchEmptyState.style.display    = 'block';
      searchTopResultCard.style.display = 'none';
      searchSongsTableBody.innerHTML    = '';
      searchArtistsGrid.innerHTML       = '';
      return;
    }

    searchEmptyState.style.display    = 'none';
    searchTopResultCard.style.display = 'flex';

    const topArtist = artists.find(a => a.name.toLowerCase() === q.toLowerCase()) || artists[0];
    const topSong   = songs[0];

    if (topArtist) {
      searchTopResultCard.innerHTML = `
        <img src="${topArtist.image}" class="top-result-thumb" style="border-radius:var(--radius-sm);" onerror="this.src='zumut-logo.png'">
        <div class="top-result-title">${topArtist.name}</div>
        <div class="top-result-meta"><span style="color:var(--zumut-green);font-weight:700;">Artist</span> • ${topArtist.listeners} fans</div>
        <button class="top-result-play-btn" title="Play ${topArtist.name}"><i class="fa-solid fa-play"></i></button>`;
      searchTopResultCard.onclick = () => openArtistDetail(topArtist.id);
    } else if (topSong) {
      searchTopResultCard.innerHTML = `
        <img src="${topSong.cover}" class="top-result-thumb" onerror="this.src='zumut-logo.png'">
        <div class="top-result-title">${topSong.title}</div>
        <div class="top-result-meta"><span style="color:var(--zumut-green);font-weight:700;">Song</span> • ${topSong.artist}</div>
        <button class="top-result-play-btn" title="Play ${topSong.title}"><i class="fa-solid fa-play"></i></button>`;
      searchTopResultCard.onclick = () => playSpecificSong(topSong);
    }

    renderSongsTable(searchSongsTableBody, songs.slice(0, 20));
    searchArtistsGrid.innerHTML = '';
    artists.forEach(a => searchArtistsGrid.appendChild(createArtistCard(a)));
  }

  /* ────────────────────────────────────────────────────────
     VIEW SWITCHER
  ──────────────────────────────────────────────────────── */
  function switchView(viewId) {
    if (currentView !== viewId) previousView = currentView;
    currentView = viewId;

    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.getElementById(viewId)?.classList.add('active');

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(i => i.classList.remove('active'));
    if (viewId === 'viewHome')          navHome.classList.add('active');
    if (viewId === 'viewSearchResults') navSearch.classList.add('active');
    if (viewId === 'viewAllSingers')    navSingers.classList.add('active');
    if (viewId === 'viewLikedSongs')    navLiked.classList.add('active');

    const scrollArea = document.getElementById('contentScrollArea');
    if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ────────────────────────────────────────────────────────
     LIKE FAVORITES SYSTEM
  ──────────────────────────────────────────────────────── */
  function toggleLike(songId) {
    const song = SONGS.find(s => s.id === songId) || activeQueue.find(s => s.id === songId);

    if (likedSongIds.has(songId)) {
      likedSongIds.delete(songId);
      showToast(song ? `Removed "${song.title}"` : 'Removed from Liked Songs', 'unlike');
    } else {
      likedSongIds.add(songId);
      if (song && !SONGS.some(s => s.id === song.id)) SONGS.push(song);
      showToast(song ? `Liked "${song.title}" ❤️` : 'Added to Liked Songs', 'like');
    }

    localStorage.setItem('zumut_liked_songs', JSON.stringify([...likedSongIds]));

    document.querySelectorAll(`[data-id="${songId}"]`).forEach(btn => {
      const isLiked = likedSongIds.has(songId);
      btn.classList.toggle('liked', isLiked);
      btn.innerHTML = `<i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>`;
    });

    if (activeQueue[currentSongIndex]?.id === songId) {
      updatePlayerLikeIcon(songId);
    }
    updateLikedCounters();

    if (currentView === 'viewLikedSongs') openLikedSongsView();
  }

  function updatePlayerLikeIcon(songId) {
    if (!playerLikeBtn) return;
    const isLiked = likedSongIds.has(songId);
    playerLikeBtn.classList.toggle('liked', isLiked);
    playerLikeBtn.innerHTML = `<i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>`;
  }

  function updateLikedCounters() {
    if (likedCountBadge) likedCountBadge.textContent = likedSongIds.size;
    if (libLikedCount)   libLikedCount.textContent   = likedSongIds.size;
  }

  /* ────────────────────────────────────────────────────────
     QUEUE DRAWER
  ──────────────────────────────────────────────────────── */
  function updateQueueDrawerUI() {
    if (!queueCurrentCard) return;
    const cur = activeQueue[currentSongIndex];

    if (cur) {
      queueCurrentCard.innerHTML = `
        <img src="${cur.cover}" style="width:42px;height:42px;border-radius:6px;object-fit:cover;" onerror="this.src='zumut-logo.png'">
        <div style="flex:1;overflow:hidden;">
          <div style="font-size:13px;font-weight:700;color:var(--zumut-green);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cur.title}</div>
          <div style="font-size:11px;color:var(--text-sub);">${cur.artist}</div>
        </div>`;
    }

    queueList.innerHTML = '';
    const nextQueue = activeQueue.slice(currentSongIndex + 1, currentSongIndex + 15);

    nextQueue.forEach((track, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span style="font-size:12px;color:var(--text-muted);width:16px;">${i + 1}</span>
        <img src="${track.cover}" style="width:32px;height:32px;border-radius:4px;object-fit:cover;" onerror="this.src='zumut-logo.png'">
        <div style="flex:1;overflow:hidden;">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${track.title}</div>
          <div style="font-size:11px;color:var(--text-sub);">${track.artist}</div>
        </div>`;
      li.addEventListener('click', () => {
        currentSongIndex = currentSongIndex + 1 + i;
        startPlaying(track);
      });
      queueList.appendChild(li);
    });

    if (!nextQueue.length) {
      queueList.innerHTML = `<li style="color:var(--text-muted);font-size:12px;">End of playlist queue.</li>`;
    }
  }

  /* ────────────────────────────────────────────────────────
     TOAST NOTIFICATIONS
  ──────────────────────────────────────────────────────── */
  let toastTimer;
  function showToast(msg, type = 'like') {
    if (!toastNotification) return;
    clearTimeout(toastTimer);
    toastMessage.textContent = msg;

    if (type === 'like') {
      toastIcon.className = 'fa-solid fa-circle-check toast-icon';
      toastIcon.style.color = 'var(--zumut-green)';
    } else if (type === 'unlike') {
      toastIcon.className = 'fa-solid fa-heart-crack toast-icon';
      toastIcon.style.color = '#f43f5e';
    } else {
      toastIcon.className = 'fa-solid fa-circle-info toast-icon';
      toastIcon.style.color = '#38bdf8';
    }

    toastNotification.classList.add('show');
    toastTimer = setTimeout(() => toastNotification.classList.remove('show'), 2600);
  }

  /* ────────────────────────────────────────────────────────
     HELPERS & UTILS
  ──────────────────────────────────────────────────────── */
  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateVolumeSliderUI(v) {
    if (volumeProgressFill) volumeProgressFill.style.width = `${v * 100}%`;
    if (volumeIcon) {
      volumeIcon.className = v === 0
        ? 'fa-solid fa-volume-xmark'
        : v < 0.5
        ? 'fa-solid fa-volume-low'
        : 'fa-solid fa-volume-high';
    }
  }

  /* Open official full song video on YouTube */
  function openFullSongOnYouTube() {
    const cur = activeQueue[currentSongIndex];
    if (!cur) return;
    const query = `${cur.title} ${cur.artist} full official song`;
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(ytUrl, '_blank');
    showToast(`Opening "${cur.title}" on YouTube...`, 'info');
  }

  /* ────────────────────────────────────────────────────────
     EVENT LISTENERS ATTACHMENT
  ──────────────────────────────────────────────────────── */
  function attachEventListeners() {
    // Playback buttons
    mainPlayBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', _nextSong);
    prevBtn.addEventListener('click', _prevSong);

    if (openFullSongBtn) {
      openFullSongBtn.addEventListener('click', openFullSongOnYouTube);
    }

    shuffleBtn.addEventListener('click', () => {
      isShuffle = !isShuffle;
      shuffleBtn.classList.toggle('active', isShuffle);
      showToast(isShuffle ? 'Shuffle ON' : 'Shuffle OFF', 'info');
    });

    repeatBtn.addEventListener('click', () => {
      repeatMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
      repeatBtn.classList.toggle('active', repeatMode !== 'none');
      repeatBtn.innerHTML = repeatMode === 'one'
        ? '<i class="fa-solid fa-repeat"></i><sup style="font-size:9px;font-weight:900;">1</sup>'
        : '<i class="fa-solid fa-repeat"></i>';
      showToast(`Repeat: ${repeatMode.toUpperCase()}`, 'info');
    });

    playerLikeBtn.addEventListener('click', () => {
      const cur = activeQueue[currentSongIndex];
      if (cur) toggleLike(cur.id);
    });

    // Timeline Scrubber
    seekSlider.addEventListener('input', () => {
      const v = parseFloat(seekSlider.value);
      if (audio && !isNaN(audio.duration) && audio.duration > 0) {
        audio.currentTime = v;
      }
      if (seekProgressFill) {
        seekProgressFill.style.width = `${(v / (parseFloat(seekSlider.max) || 1)) * 100}%`;
      }
      if (currentTimeLabel) currentTimeLabel.textContent = formatTime(v);
    });

    // Volume Slider
    volumeSlider.addEventListener('input', () => {
      const v = parseFloat(volumeSlider.value);
      lastVolume = v;
      if (audio) audio.volume = v;
      updateVolumeSliderUI(v);
    });

    volumeMuteBtn.addEventListener('click', () => {
      const curVol = parseFloat(volumeSlider.value) || 0;
      if (curVol > 0) {
        lastVolume = curVol;
        volumeSlider.value = 0;
        if (audio) audio.volume = 0;
        updateVolumeSliderUI(0);
      } else {
        volumeSlider.value = lastVolume || 0.8;
        if (audio) audio.volume = lastVolume || 0.8;
        updateVolumeSliderUI(lastVolume || 0.8);
      }
    });

    // Search input
    globalSearchInput.addEventListener('input', e => handleSearch(e.target.value));
    clearSearchBtn.addEventListener('click', () => {
      globalSearchInput.value = '';
      clearSearchBtn.style.display = 'none';
      searchSpinner.classList.remove('active');
      switchView(previousView || 'viewHome');
    });

    // Navigation Links
    document.getElementById('navBackBtn').addEventListener('click', () => {
      if (previousView) switchView(previousView);
    });
    document.getElementById('navForwardBtn').addEventListener('click', () => switchView('viewHome'));
    navHome.addEventListener('click', () => switchView('viewHome'));
    brandHomeBtn.addEventListener('click', () => switchView('viewHome'));
    navSearch.addEventListener('click', () => {
      switchView('viewSearchResults');
      globalSearchInput.focus();
    });
    navSingers.addEventListener('click', () => switchView('viewAllSingers'));
    navLiked.addEventListener('click', openLikedSongsView);
    libLikedCard.addEventListener('click', openLikedSongsView);

    document.getElementById('viewAllSingersBtn').addEventListener('click', () => switchView('viewAllSingers'));
    document.getElementById('heroExploreSingersBtn').addEventListener('click', () => switchView('viewAllSingers'));
    document.getElementById('backToHomeFromArtist').addEventListener('click', () => switchView('viewAllSingers'));
    document.getElementById('findSongsBtn').addEventListener('click', () => switchView('viewHome'));

    document.getElementById('heroPlayAllBtn').addEventListener('click', () => {
      activeQueue = [...SONGS];
      currentSongIndex = 0;
      startPlaying(SONGS[0]);
      showToast('Playing Zumut Trending Mix', 'info');
    });

    // Category Filter Pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.getAttribute('data-filter');
        const filterMap = {
          all: () => switchView('viewHome'),
          artists: () => switchView('viewAllSingers'),
          bts: () => openArtistDetail('bts'),
          atif: () => openArtistDetail('atif-aslam'),
          arijit: () => openArtistDetail('arijit-singh'),
          diljit: () => openArtistDetail('diljit-dosanjh'),
          apdhillon: () => openArtistDetail('ap-dhillon'),
          bollywood: () => {
            const list = SONGS.filter(x => x.category === 'bollywood');
            activeQueue = list.length ? list : SONGS;
            currentSongIndex = 0;
            startPlaying(activeQueue[0]);
            showToast('Bollywood & Hindi Hits', 'info');
          },
          international: () => {
            const list = SONGS.filter(x => ['international', 'kpop'].includes(x.category));
            activeQueue = list.length ? list : SONGS;
            currentSongIndex = 0;
            startPlaying(activeQueue[0]);
            showToast('Global Chartbusters', 'info');
          },
          local: () => {
            activeQueue = [...LOCAL_FILES];
            currentSongIndex = 0;
            startPlaying(LOCAL_FILES[0]);
            showToast('Playing Full Studio Local Tracks', 'info');
          }
        };

        if (filterMap[filter]) filterMap[filter]();
      });
    });

    // Creator Modal
    const openModal  = () => creatorModalOverlay.classList.add('open');
    const closeModal = () => creatorModalOverlay.classList.remove('open');
    creatorHeaderBtn.addEventListener('click', openModal);
    creatorBadgeBtn.addEventListener('click', openModal);
    closeCreatorModalBtn.addEventListener('click', closeModal);
    modalDismissBtn.addEventListener('click', closeModal);
    creatorModalOverlay.addEventListener('click', e => {
      if (e.target === creatorModalOverlay) closeModal();
    });

    // Queue Drawer
    toggleQueueBtn.addEventListener('click', () => {
      queueDrawer.classList.toggle('open');
      toggleQueueBtn.classList.toggle('active');
      if (queueDrawer.classList.contains('open')) updateQueueDrawerUI();
    });
    closeQueueBtn.addEventListener('click', () => {
      queueDrawer.classList.remove('open');
      toggleQueueBtn.classList.remove('active');
    });

    // Mobile Sidebar
    openSidebarBtn.addEventListener('click', () => sidebar.classList.add('mobile-open'));
    closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('mobile-open'));

    // Create Playlist button
    document.getElementById('createPlaylistBtn').addEventListener('click', () => {
      const name = prompt('Enter playlist name:');
      if (name && name.trim()) {
        showToast(`Playlist "${name.trim()}" created!`, 'info');
      }
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', e => {
      if (e.target === globalSearchInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audio && !isNaN(audio.duration)) {
          audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audio) {
          audio.currentTime = Math.max(audio.currentTime - 5, 0);
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const v = Math.min((parseFloat(volumeSlider.value) || 0) + 0.1, 1);
        volumeSlider.value = v;
        volumeSlider.dispatchEvent(new Event('input'));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const v = Math.max((parseFloat(volumeSlider.value) || 0) - 0.1, 0);
        volumeSlider.value = v;
        volumeSlider.dispatchEvent(new Event('input'));
      } else if (e.key === 'm' || e.key === 'M') {
        volumeMuteBtn.click();
      } else if (e.key === 'l' || e.key === 'L') {
        playerLikeBtn.click();
      } else if (e.key === 'Escape') {
        closeModal();
        queueDrawer.classList.remove('open');
        sidebar.classList.remove('mobile-open');
      }
    });
  }

})();
