export const DEFAULT_LIMIT_CASINOHOMEPAGE = {
  casino: 30,
  liveCasino: {
    pc: 21,
    ipad: 21,
    mobileLandscap: 20,
    mobile: 21,
  },
  bonusBuy: {
    pc: 21,
    ipad: 21,
    mobileLandscap: 20,
    mobile: 21,
  },
  miniGame: {
    pc: 21,
    ipad: 21,
    mobileLandscap: 20,
    mobile: 21,
  },
  sports: 16,
  topslot: {
    pc: 20,
    ipad: 24,
    mobileLandscap: 24,
    mobile: 24,
  },
  newGame: {
    pc: 21,
    ipad: 21,
    mobileLandscap: 20,
    mobile: 21,
  } 
}

export const DEFAULT_LIMIT_GAMESLIDE = {
  casino: {
    pc: 6,
    ipad: 4,
    mobileLandscap: 4,
    mobile: 2
  },
  liveCasino: {
    pc: 6,
    ipad: 4,
    mobileLandscap: 4,
    mobile: 2,
  },
  sports: {
    pc: 4,
    ipad: 4,
    mobileLandscap: 3,
    mobile: 2,
    //mobileLandscap: 2,
    //mobile: 1,
  },
  jackpots: {
    pc: 4,
    ipad: 4,
    mobileLandscap: 4,
    mobile: 4,
  },
  homecasino: {
    pc: 10,
    ipad: 8,
    mobileLandscap: 6,
    //mobileLandscap: 4,
    mobile: 4
  },
  homeliveCasino: {
    pc: 12,
    ipad: 8,
    mobileLandscap: 6,
    mobile: 2,
  },
  homesports: {
    pc: 4,
    ipad: 4,
    mobileLandscap: 3,
    mobile: 2,
  },
  homenew: {
    pc: 13,
    ipad: 9,
    mobileLandscap: 3,
    mobile: 3
  },
  homerow1: {
    pc: 7,
    ipad: 7,
    mobileLandscap: 5,
    mobile: 3
    //mobile: 2
  }
}

export const DEFAULT_LIMIT_LIVESPORT_SLIDE = {
  pc: 3,
  ipad: 2,
  mobile: 1,
}

export const DEFAULT_LIMIT_EVENTSPORT_SLIDE = {
  pc: 4,
  ipad: 3,
  mobile: 1,
}

export const DEFAULT_TITLE_GAME_BG = {
  0: 'blue',
  1: 'red',
  2: 'green'
}

export const CATEGORIES_HOME = [
  {
    "gameCategoriesFilterType": "filterByCategory",
    "gameCategoriesGameCount": 0,
    "gameCategoriesSlug": "game-show",
    "id": -7,
    "labelTitle": "game-show",
    "slug": "game-show",
    "fontIconName": "casino-inactive-populargames"
  },
  {
    "gameCategoriesFilterType": "filterByCategory",
    "gameCategoriesGameCount": 0,
    "gameCategoriesSlug": "betting",
    "id": -8,
    "labelTitle": "sport",
    "slug": "betting",
    "fontIconName": "casino-inactive-betting"
  },
  {
    "gameCategoriesFilterType": "filterByCategory",
    "gameCategoriesGameCount": 0,
    "gameCategoriesSlug": "new",
    "id": -4,
    "labelTitle": "casino",
    "slug": "newest-games",
    "fontIconName": "casino-inactive-newestgames"
  },
  {
    "gameCategoriesFilterType": "filterByCategory",
    "gameCategoriesGameCount": 0,
    "gameCategoriesSlug": "esport",
    "id": -9,
    "labelTitle": "esports",
    "slug": "esport",
    "fontIconName": "casino-inactive-esport"
  },
  {
    "gameCategoriesFilterType": "filterByCategory",
    "gameCategoriesGameCount": 0,
    "gameCategoriesSlug": "promotions",
    "id": -3,
    "labelTitle": "cate-promotion",
    "slug": "promotions",
    "fontIconName": "casino-inactive-populargames"
  }
]

export const CryptoCurrencies = {
  0: {
    code: "BTC",
    name: "Bitcoin",
    icon: "/static/images/crypto/btc.png"
  },
  1: {
    code: "ETH",
    name: "Ethereum",
    icon: "/static/images/crypto/eth.png"
  },
  2: {
    code: "USDT",
    name: "USDT",
    icon: "/static/images/crypto/tether.png"
  },
  3: {
    code: "USDTE",
    name: "ERC20",
    icon: "/static/images/crypto/tether.png"
  },
  4: {
    code: "USDTT",
    name: "TRC20",
    icon: "/static/images/crypto/tether.png"
  },
  5: {
    code: "BNB",
    name: "BNB",
    icon: "/static/images/crypto/bnb.png"
  },
  6: {
    code: "BNB-BSC",
    name: "BSC-BNB",
    icon: "/static/images/crypto/bnb.png"
  },
  7: {
    code: "XRP",
    name: "Ripple",
    icon: "/static/images/crypto/xrp.png"
  },
  8: {
    code: "TRX",
    name: "TRX",
    icon: "/static/images/crypto/trx.png"
  },
  9: {
    code: "LTC",
    name: "Litecoin",
    icon: "/static/images/crypto/ltc.png"
  },
  10: {
    code: "DOGE",
    name: "DOGE",
    icon: "/static/images/crypto/doge.png"
  },
  11: {
    code: "BCH",
    name: "BTCash",
    icon: "/static/images/crypto/bch.png"
  },
  12: {
    code: "ADA",
    name: "Cardano",
    icon: "/static/images/crypto/ada.png"
  },
  13: {
    code: "USDC",
    name: "USDC",
    icon: "/static/images/crypto/usdc.png"
  },
  14: {
    code: "CPD",
    name: "CPD",
    icon: "/static/images/crypto/CPD.png"
  },
  15: {
    code: "XLM",
    name: "Stellar",
    icon: "/static/images/crypto/xlm.png"
  }

}

export const LIVECASINOHOMEGAMES = [
  {
    "tableID": "54750052279",
    "openingTime": "24/7",
    "isOpen": true,
    "category": "OTHER",
    "limit": {},
    "name": "FUNKY TIME",
    "vendor": "EvolutionGaming",
    "anonymousFunMode": false,
    "funMode": false,
    "newGame": false,
    "newTable": false,
    "vipTable": false,
    "popularity": 45,
    "thumbnail": "/static/images/categoryLiveCasinoHome3.png",
    "thumbnails": [
      {
        "index": 0,
        "url": "/static/images/categoryLiveCasinoHome3.png"
      }
    ],
    "backgroundImage": "/static/images/categoryLiveCasinoHome3.png",
    "url": "https://casino.routingnetwork.net/Loader/Start/1036/funky_time_evolutiongaming/?tableID=54750052279",
    "tags": []
  },
  {
    "tableID": "12475089205",
    "openingTime": "24/7",
    "isOpen": true,
    "category": "LOTTERY",
    "limit": {},
    "name": "Dream Catcher",
    "vendor": "EvolutionGaming",
    "anonymousFunMode": false,
    "funMode": false,
    "newGame": false,
    "newTable": false,
    "vipTable": false,
    "popularity": 34,
    "thumbnail": "/static/images/categoryLiveCasinoHome4.png",
    "thumbnails": [
      {
        "index": 0,
        "url": "/static/images/categoryLiveCasinoHome4.png"
      }
    ],
    "backgroundImage": "/static/images/categoryLiveCasinoHome4.png",
    "url": "https://casino.routingnetwork.net/Loader/Start/1036/dream-catcher/?tableID=12475089205",
    "tags": []
  },
  {
    "tableID": "8345030379",
    "openingTime": "24/7",
    "isOpen": true,
    "category": "ROULETTE",
    "limit": {},
    "name": "Lightning Roulette",
    "vendor": "EvolutionGaming",
    "anonymousFunMode": false,
    "funMode": false,
    "newGame": false,
    "newTable": false,
    "vipTable": false,
    "popularity": 462,
    "thumbnail": "/static/images/categoryLiveCasinoHome1.png",
    "thumbnails": [
      {
        "index": 0,
        "url": "/static/images/categoryLiveCasinoHome1.png"
      }
    ],
    "backgroundImage": "/static/images/categoryLiveCasinoHome1.png",
    "url": "https://casino.routingnetwork.net/Loader/Start/1036/lightning-roulette-evo/?tableID=8345030379",
    "tags": []
  },
  {
    "tableID": "58531084483",
    "openingTime": "24/7",
    "isOpen": true,
    "category": "OTHER",
    "limit": {},
    "name": "Gonzo's Treasure Map",
    "vendor": "EvolutionGaming",
    "anonymousFunMode": false,
    "funMode": false,
    "newGame": false,
    "newTable": false,
    "vipTable": false,
    "popularity": 0,
    "thumbnail": "/static/images/categoryLiveCasinoHome2.png",
    "thumbnails": [
      {
        "index": 0,
        "url": "/static/images/categoryLiveCasinoHome2.png"
      }
    ],
    "backgroundImage": "/static/images/categoryLiveCasinoHome2.png",
    "url": "https://casino.routingnetwork.net/Loader/Start/1036/gonzos_treasure_map_evolutiongaming/?tableID=58531084483",
    "tags": []
  }
]

//'all', 'lastplayed'
export const orderCategory = (page) => {
  switch (page) {
    case "/casino":
      return ['favorites', 'all', 'lastplayed', 'poppular', 'bonusbuy', 'mini-games', 'new-games', 'jackpot-games', 'megaways', 'video-pokers', 'video-slots', 'classic-slots', 'scratch-cards', /*'table-games',*/ 'other-games'];
    case "/casino/live-casino":
      return ['favorites', 'all', 'popular-games', 'poppular', 'game-show', 'newest-games', 'recommended', 'lobby', 'roulette', 'blackjack', 'poker', 'baccarat'];
    default:
      return ['favorites', 'all', 'lastplayed', 'poppular', 'bonusbuy', 'new-games', 'jackpot-games', 'megaways', 'video-pokers', 'video-slots', 'classic-slots', 'scratch-cards', 'mini-games', /*'table-games',*/ 'other-games'];
  }
}

export const pagesWithoutSlideGames = () => {
  return ['virtual-sports', 'lottery'];
}

export const sortGames = (category) => {
  switch (category) {
    case "/casino/live-casino-all":
      return ["8345098735", "8342008204", "44927044145", "58531084483", "59954010963", "55752092657"];
    case "/casino-all":
      return [
        "eastcoastvswestcoast_nolimitcity",
        "evo-rng-the_wish_master_megaways_evolutiongaming",
        "evo-rng-deadoralive2_evolutiongaming",
        "legacyofkong_spadegaming",
        "big_bass_hold_spinner_megaways_pragmaticplay",
        "pimped",
        "legacy-of-egypt-pc",
        "evo-rng-finnsgoldentavern_evolutiongaming",
        "pirate-kingdom-mw-1x2",
        "powerofgodsvalhalla_wazdan",
        "cash_lab_megaways_isoftbet",
        "the_cage_nolimitcity",
        "wild_coyote_megaways_onetouch",
        "gameart-money-farm",
        "euphoria_isoftbet",
        "megaways_duel_of_the_dead_kalamba",
        "olympuszeusmegaways_isoftbet",
        "sweet_candy_cash_onextwogaming",
        "cash_lab_megaways_isoftbet",
        "book_of_tut_megaways_pragmaticplay",
        "rumblerhino_pariplay",
        "forgeofolympus_pragmaticplay",
        "gallo_gold_brunos_megaways96_microgaming_pc",
        "machina-relax"
      ];
    default: return null;
  }
}