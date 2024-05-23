/* This parameter is used to indicate the game fields expected in JSON response. Individual field value is defined
 as below. Passing this field with the sum of the expected fields' value. */
export const FIELDS = {
  Slug: 1,
  Vendor: 2,
  Name: 4,
  ShortName: 8,
  Description: 16,
  AnonymousFunMode: 32,
  FunMode: 64,
  RealMode: 128,
  NewGame: 256,
  License: 512,
  Popularity: 1024,
  Width: 2048,
  Height: 4096,
  Thumbnail: 8192,
  Logo: 16384,
  BackgroundImage: 32768,
  Url: 65536,
  HelpUrl: 131072,
  Categories: 262144,
  Tags: 524288,
  Platforms: 1048576,
  RestrictedTerritories: 2097152,
  TheoreticalPayOut: 4194304,
  BonusContribution: 8388608,
  JackpotContribution: 16777216,
  FPP: 33554432,
  Limitation: 536870912,
  Currencies: 8589934592,
  Languages: 17179869184,
};

/*  Indicates the tables fields expected in JSON response. Individual field value is defined as below. Passing this
field with the sum of the expected fields' value. Fields explanation can be found in CasinoEngine API Doc. */
export const liveCasinoFields = {
  Slug: 1,
  Vendor: 2,
  Name: 4,
  ShortName: 8,
  Description: 16,
  AnonymousFunMode: 32,
  FunMode: 64,
  RealMode: 128,
  NewGame: 256,
  License: 512,
  Popularity: 1024,
  Width: 2048,
  Height: 4096,
  Thumbnail: 8192,
  Logo: 16384,
  BackgroundImage: 32768,
  Url: 65536,
  HelpUrl: 131072,
  Tags: 524288,
  Platforms: 1048576,
  RestrictedTerritories: 2097152,
  TheoreticalPayOut: 4194304,
  BonusContribution: 8388608,
  JackpotContribution: 16777216,
  FPP: 33554432,
  TableID: 67108864,
  OpenStatus: 134217728,
  OpeningTime: 268435456,
  Limitation: 536870912,
  Category: 1073741824,
  NewTable: 2147483648,
  VipTable: 4294967296,
};

export const casinoPlatform = {
  PC: "PC",
  iPad: "iPad",
  iPhone: "iPhone",
  android: "Android",
  WM7: "WM7",
  windows81: "Windows81",
  WP8: "WP8",
  WP81: "WP81"
}

/**
 * Default value for the expected game fields. Used if no other value is supplied by the CMS.
 */
const DEFAULT_EXPECTED_GAME_FIELDS = FIELDS.Thumbnail + FIELDS.NewGame + FIELDS.Height + FIELDS.Categories
  + FIELDS.Slug + FIELDS.Popularity + FIELDS.Width + FIELDS.Vendor + FIELDS.Name + FIELDS.FunMode
  + FIELDS.AnonymousFunMode + FIELDS.Tags + FIELDS.BackgroundImage + FIELDS.Url + FIELDS.Limitation;

/**
 * Default value for the expected table fields. Used if no other value is supplied by the CMS
 */
const DEFAULT_EXPECTED_TABLE_FIELDS = liveCasinoFields.Vendor + liveCasinoFields.TableID + liveCasinoFields.NewGame
  + liveCasinoFields.Thumbnail + liveCasinoFields.Popularity + liveCasinoFields.Category + liveCasinoFields.Name
  + liveCasinoFields.OpenStatus + liveCasinoFields.OpeningTime + liveCasinoFields.NewTable + liveCasinoFields.VipTable
  + liveCasinoFields.FunMode + liveCasinoFields.AnonymousFunMode + liveCasinoFields.Tags
  + liveCasinoFields.BackgroundImage + liveCasinoFields.Url + liveCasinoFields.Limitation;

const EXPECTED_FAVORITE_GAME_FIELDS = FIELDS.Name + FIELDS.Thumbnail
  + FIELDS.NewGame + FIELDS.Slug + FIELDS.Url + FIELDS.Vendor;
const EXPECTED_FAVORITE_TABLE_FIELDS = EXPECTED_FAVORITE_GAME_FIELDS;

export const getGamesFavorites = {
  "filterByPlatform": [],
  "filterByType": [],
  "anonymousUserIdentity": "",
  "expectedGameFields": DEFAULT_EXPECTED_GAME_FIELDS,
  "expectedTableFields": DEFAULT_EXPECTED_TABLE_FIELDS,
  "specificExportFields": [
    "backgroundImage2",
    "thumbnails"
  ]
};

export const getGamesParams = {
  "filterByName": [],
  "filterBySlug": [],
  "filterByVendor": [],
  "filterByCategory": [],
  "filterByTag": [],
  "filterByPlatform": [],
  "filterByAttribute": {},
  "expectedFields": DEFAULT_EXPECTED_GAME_FIELDS,
  // "specificExportFields": [
  //     "vendorGameID",
  //     "gameCode",
  //     "originalVendor",
  //     "icons",
  //     "backgroundImage2",
  //     "topPrize",
  //     "clientID",
  //     "moduleID",
  //     "maintenanceWindows"
  // ],
  "expectedFormat": "map",
  "pageIndex": "1",
  "pageSize": "15",
  "sortFields": []
};

export const getLiveCasinoTablesParams = {
  "filterByID": [],
  "filterByVendor": [],
  "filterByCategory": [],
  "filterByTag": [],
  "filterByPlatform": [],
  "filterByAttribute": {},
  "expectedFields": DEFAULT_EXPECTED_TABLE_FIELDS,
  "specificExportFields": [],
  "expectedFormat": "map",
  "pageIndex": "1",
  "pageSize": "2",
  "sortFields": []
}

export const getCustomGamesParams = {
  "dataSourceName": "casino",
  "categoryID": "video-pokers",
  "filterByPlatform": [],
  "expectedGameFields": DEFAULT_EXPECTED_GAME_FIELDS,
  "expectedTableFields": DEFAULT_EXPECTED_TABLE_FIELDS,
  "specificExportFields": [
    "backgroundImage2",
    "thumbnails"
  ]
};

export const getLaunchUrlParams = {
  "slug": "",             // String
  "tableID": "",          // String
  "realMoney": false
};

export const getRecommendedGamesParams = {
  "recommendedType": "user",
    "slug": [],
    "platform": "PC",
    // "expectedGameFields": 9
    "expectedGameFields": DEFAULT_EXPECTED_GAME_FIELDS,
};

export const getRecentWinnersParams = {
  expectedGameFields: FIELDS.Slug + FIELDS.ShortName + FIELDS.Thumbnail + FIELDS.Logo,
  "filterByPlatform": [],
};

export const getJackpotsParams = {
  expectedGameFields: FIELDS.Slug + FIELDS.ShortName + FIELDS.Thumbnail + FIELDS.Logo,
  "filterByPlatform": [],
};
export const getLastPlayedGamesParams = {
  "expectedGameFields": DEFAULT_EXPECTED_GAME_FIELDS,
  "specificExportFields": [
    "backgroundImage2",
    "thumbnails"
  ],
  "filterByPlatform": [],
};


//NWA
export const SET_CASINOGAMES = 'set-casino-games';
export const SET_CASINOGAMES_PENDING = 'set-casino-games-pending';
export const SET_CASINOGAMES_MODAL = 'set-casino-games-modal';
export const SET_CASINOGAMES_MODAL_PENDING = 'set-casino-games-modal-pending';
export const SET_CASINOGAMESALL = 'set-casino-games-all';
export const SET_CASINOGAMESALL_PENDING = 'set-casino-games-all-pending';
export const SET_CASINOGAMESALL_MODAL = 'set-casino-games-all-modal';
export const SET_CASINOGAMESALL_MODAL_PENDING = 'set-casino-games-all-modal-pending';
export const SET_CASINOCATEGORY_ACTIVED = 'set-casino-category-actived';
export const SET_CASINOGAME_SEARCH = 'set-casino-games-search';
export const SET_CASINOGAME_SEARCH_PENDING = 'set-casino-games-search-pending'; 
export const SET_LASTPLAYED = 'set-lastplayed';
export const SET_LASTPLAYED_PENDING = 'set-lastplayed-pending'; 
export const SET_ALL_VENDOR = 'set-all-vendor';

export const BASIC_GAMES_FIELDS = "id,name,launchUrl,popularity,isNew,hasFunMode,hasAnonymousFunMode,thumbnail,thumbnails,type,slug,gameId,backgroundImageUrl,groups";