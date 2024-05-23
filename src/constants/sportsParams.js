export const getDisciplinesParams = {
  "lang": "en",
  "liveStatus": "BOTH",
  "virtualStatus": "BOTH"
};

export const getLocationsParams = {
  "disciplineId": 1,
  "lang": "en"
};

export const getTournamentsParams = {
  "locationId": 240,
  "lang": "en"
};

export const popularMatchesParams = {
  "lang":"en",
  "sportId":1,
  "liveStatus":"NOT_LIVE",
  "sortByPopularity":true,
  "dataWithoutOdds":true,
  "sortChronologically":true,
  "maxResult" : 5
};

export const matchesParams = {
  "lang":"en",
  "disciplineId":1,
  "liveStatus":"LIVE",
  "dataWithoutOdds":true,
  "sortChronologically":true,
};

export const oddsParams = {
  "lang":"en",
  "matchId":1
};


export const placeBetParams ={
  "lang":"en",
  "type" : "SINGLE",
  "oddsValidationType" : "ACCEPT_ANY",
  "selections" : [],
  "terminalType" : "DESKTOP",
  "systemBetType" : null,
  "amount" : 2,
  "freeBet" : true
}

export const initialDumpParams ={
  "topic":"/sports/6/en/popular-matches-aggregator-main/1/20/3"
}