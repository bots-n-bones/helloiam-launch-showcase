const photos = "../01-objects/02-media-unsorted/";
const emoji = "../02-claude-session%202026-11-10/emoji-cutout/";
const photo = n => photos + "helloiam_image_" + n + ".png";
const art = file => emoji + file + ".png";
const shot = (title, options = {}) => ({ title, ...options });
const market = photo(45);
const fog = photos + "hf_20260428_184651_e860c56e-48b3-479a-b8a6-cb621c347f9a.mp4";

const pilotCatalog = [
  {
    id: "pink-tuff", title: "Peach or Stone?", section: "objects",
    kind: "carousel", tone: "red", caption: "A peach, a brick, or a piece of a city? Meet pink tuff. Look up next time you pass a wall in Yerevan.",
    frames: [
      shot("PEACH\nOR STONE?", { object: art("44-Tuf"), layout: "macro", tone: "red" }),
      shot("HELLO, I AM\nPINK TUFF.", { object: art("44-Tuf"), tone: "red" }),
      shot("LOOK UP.", { object: art("44-Tuf"), tone: "red" }),
    ],
  },
  {
    id: "market-mountain", title: "Market Noise / Mountain Quiet", section: "editorial",
    kind: "reel", tone: "black", caption: "Same country. Two volumes. Sound on.",
    frames: [
      shot("MARKET\nNOISE.", { image: market, seconds: 2, layout: "full" }),
      shot("", { image: photo(69), seconds: 0.8, layout: "full" }),
      shot("", { image: photo(45), seconds: 0.7, layout: "full" }),
      shot("", { image: photo(35), seconds: 1.5, layout: "full" }),
      shot("", { image: photo(77), video: fog, from: 0.25, seconds: 5.5, layout: "full" }),
      shot("MOUNTAIN\nQUIET.", { image: photo(77), seconds: 2.5, layout: "full" }),
    ],
  },
  {
    id: "green-plate", title: "Green Plate", section: "objects",
    kind: "carousel", tone: "red", caption: "One plate, a whole handful of green. Which herb do you reach for first?",
    frames: [
      shot("HELLO, I AM\nGREEN PLATE.", { object: art("10-Green-Plate"), tone: "red" }),
      shot("PASS THE\nGREENS.", { image: photo(60), layout: "full" }),
      shot("WHICH HERB\nGOES FIRST?", { object: art("10-Green-Plate"), tone: "yellow" }),
    ],
  },
  {
    id: "sofia-yerevan", title: "Sofia to Yerevan, Direct Again", section: "editorial",
    kind: "carousel", tone: "news",
    caption: "Direct flights between Sofia and Yerevan resumed on 7 November 2026. The Bulgarian Ministry of Foreign Affairs says the route runs twice weekly, on Thursdays and Saturdays. Check live availability with GullivAir before booking.",
    source: "https://new.mfa.bg/bg/news/49649",
    sourceLabel: "Bulgarian Ministry of Foreign Affairs · 9 November 2026",
    frames: [
      shot("SOFIA TO\nYEREVAN,\nDIRECT AGAIN.", { layout: "news", diagram: true }),
      shot("TWICE\nA WEEK.", { layout: "news", note: "Thursday and Saturday. The first flight arrived on 7 November." }),
      shot("NEXT STOP:\nDINNER.", { layout: "news", note: "Check current flight times with GullivAir. Then leave room for a long dinner.", source: "Source: Bulgarian MFA · 9 Nov 2026" }),
    ],
  },
  {
    id: "matsun", title: "Matsun", section: "objects",
    kind: "carousel", tone: "yellow", caption: "A bowl of matsun, a handful of herbs and something to scoop it up with.",
    frames: [
      shot("HELLO, I AM\nMATSUN.", { object: art("04-Matsun"), tone: "yellow" }),
      shot("START WITH\nA SPOON.", { image: photo(54), layout: "full" }),
      shot("ADD\nSOMETHING\nGREEN.", { image: photo(74), layout: "full" }),
    ],
  },
  {
    id: "dolma", title: "Dolma", section: "objects",
    kind: "carousel", tone: "red", caption: "A leaf, a spoonful, a tuck. Watch a dolma take shape.",
    frames: [
      shot("HELLO, I AM\nDOLMA.", { object: art("09-Tolma"), tone: "red" }),
      shot("A LEAF.", { image: photo(28), layout: "full" }),
      shot("A FOLD.", { image: photo(58), layout: "full" }),
      shot("A PLATE.", { image: photo(55), layout: "full" }),
    ],
  },
  {
    id: "love-lavash", title: "Love Lavash", section: "objects",
    kind: "reel", tone: "yellow", caption: "Fold it, tear it, pass it around. Wait for the shhh.",
    frames: [
      shot("LOVE\nLAVASH.", { image: photo(67), layout: "full", seconds: 2.3 }),
      shot("LA.", { object: art("01-Lavash"), tone: "yellow", seconds: 0.6 }),
      shot("VA.", { object: art("01-Lavash"), tone: "red", seconds: 0.6 }),
      shot("SHHH.", { image: photo(53), layout: "full", seconds: 2.1 }),
      shot("PASS THE\nLAVASH.", { image: photo(66), layout: "full", seconds: 3.4 }),
    ],
  },
  {
    id: "say-hello-wine", title: "Say Hello to Armenian Wine", section: "promo",
    kind: "reel", tone: "black", caption: "From the vine to the glass. Say hello to Armenian wine.",
    frames: [
      shot("SAY HELLO TO\nARMENIAN WINE.", { object: art("03-Glass-of-Armenian-wine"), tone: "black", seconds: 2.5 }),
      shot("FROM THE\nVINE.", { image: photo(100), layout: "full", seconds: 2.7 }),
      shot("TO THE\nGLASS.", { image: photo(50), layout: "full", seconds: 2.8 }),
    ],
  },
  {
    id: "apricot", title: "Guess the Fruit", section: "objects",
    kind: "carousel", tone: "yellow", caption: "One clue: this fruit has a stone, too. Hello, apricot.",
    frames: [
      shot("GUESS THE\nFRUIT.", { object: art("08-Apricot"), layout: "macro", tone: "yellow" }),
      shot("HELLO, I AM\nAPRICOT.", { object: art("08-Apricot"), tone: "yellow" }),
      shot("MEET ME AT\nTHE MARKET.", { image: photo(64), layout: "full" }),
    ],
  },
  {
    id: "apricot-season", title: "Apricot Season", section: "promo",
    kind: "reel", tone: "yellow", caption: "First you see them in the trees. Then you start seeing them everywhere.",
    frames: [
      shot("HELLO, I AM\nAPRICOT\nSEASON.", { image: photo(16), layout: "full", seconds: 3 }),
      shot("PICK.", { image: photo(63), layout: "full", seconds: 2 }),
      shot("PILE.", { image: photo(64), layout: "full", seconds: 2 }),
      shot("SAVE SOME\nFOR LATER.", { image: photo(65), layout: "full", seconds: 3 }),
    ],
  },
  {
    id: "lavash-teaser", title: "The Bread Got Away", section: "reserved",
    kind: "reel", tone: "yellow", caption: "The bread got away. Help Lavash collect three crumbs in Catch the Crumbs.",
    frames: [
      shot("THE BREAD\nGOT AWAY.", { object: art("01-Lavash"), tone: "yellow", seconds: 2 }),
      shot("THREE\nCRUMBS.", { tone: "red", layout: "type", seconds: 2 }),
      shot("CATCH\nTHEM.", { object: art("01-Lavash"), tone: "yellow", seconds: 3 }),
    ],
  },
  {
    id: "from-gyumri", title: "Gyumri", section: "editorial",
    kind: "carousel", tone: "black",
    caption: "Start at Vartanants Square in central Gyumri. From the square, walk toward Holy Saviour’s Church.",
    source: "https://armenia.travel/articles/a-weekend-in-gyumri/",
    sourceLabel: "Armenia Travel · A Weekend in Gyumri",
    frames: [
      shot("HELLO, I AM\nFROM GYUMRI.", { object: art("28-Gyumri"), tone: "black" }),
      shot("START AT\nVARTANANTS\nSQUARE.", { tone: "black", layout: "type" }),
      shot("HOLY SAVIOUR’S\nCHURCH.", { tone: "black", layout: "type" }),
    ],
  },
  {
    id: "yerevan-nights", title: "Yerevan Nights", section: "board",
    kind: "board", tone: "black", caption: "The city gets louder when the light gets softer.",
    frames: [
      shot("HELLO, I AM\nYEREVAN\nNIGHTS.", { tone: "black", object: art("36-Street-lamp") }),
      shot("THE FIRST\nLIGHT.", { image: photo(19), layout: "full" }),
      shot("THE LAST\nEMPTY TABLE.", { image: photo(23), layout: "full" }),
    ],
  },
  {
    id: "hidden-courtyard", title: "The Courtyard Behind the Arch", section: "board",
    kind: "board", tone: "black", caption: "You’ve walked past the entrance. Next time, slow down.",
    frames: [
      shot("THE COURTYARD\nBEHIND\nTHE ARCH.", { image: photos + "%D0%B4%D0%B2%D0%BE%D1%80.png", layout: "full" }),
      shot("FOLLOW\nTHE ARCH.", { image: photo(44), layout: "full" }),
      shot("LOOK UP.", { image: photo(42), layout: "full" }),
    ],
  },
  {
    id: "wine-lover", title: "A Day as a Wine Lover", section: "board",
    kind: "board", tone: "black", caption: "Three stops, one long afternoon.",
    frames: [
      shot("A DAY AS A\nWINE LOVER.", { object: art("05-Bottle-of-Armenian-wine"), tone: "black" }),
      shot("09:00\nCOFFEE.", { image: photo(34), layout: "full" }),
      shot("12:00\nFOLLOW\nTHE VINES.", { image: photo(25), layout: "full" }),
      shot("15:00\nPOUR.", { image: photo(50), layout: "full" }),
      shot("SAVE\nTHE ROUTE.", { object: art("40-Map"), tone: "black" }),
    ],
  },
  {
    id: "taxi-lunch", title: "Eat Like a Yerevan Taxi Driver", section: "board",
    kind: "board", tone: "red", caption: "We asked him where he goes between fares. He took us to lunch.",
    frames: [
      shot("EAT LIKE A\nYEREVAN\nTAXI DRIVER.", { object: art("48-Armenian-car"), tone: "red" }),
      shot("BETWEEN\nFARES.", { image: photo(7), layout: "full" }),
      shot("THE USUAL.", { image: photo(68), layout: "full" }),
    ],
  },
  {
    id: "hello-bloggers", title: "This Is My Yerevan", section: "board",
    kind: "board", tone: "yellow", caption: "One person. One place they’d miss. Where would you take us?",
    frames: [
      shot("HELLO\nBLOGGERS.", { tone: "yellow", layout: "type" }),
      shot("THIS IS MY\nYEREVAN.", { image: photo(43), layout: "full" }),
      shot("WHAT WOULD\nYOU MISS?", { tone: "yellow", layout: "type" }),
    ],
  },
  {
    id: "brutalism", title: "Brutalism", section: "board",
    kind: "board", tone: "black", caption: "Start with one line of the building. Then step back.",
    frames: [
      shot("HELLO, I AM\nBRUTALISM.", { object: art("38-Brutalism"), tone: "black" }),
      shot("FOLLOW\nTHE LINE.", { tone: "black", layout: "type" }),
    ],
  },
  {
    id: "hear-duduk", title: "Hear the Duduk", section: "board",
    kind: "board", tone: "black", caption: "Hear the duduk before you see it.",
    frames: [
      shot("FIRST,\nA BREATH.", { tone: "black", layout: "type" }),
      shot("THEN,\nA NOTE.", { image: photo(8), layout: "full" }),
      shot("HELLO, I AM\nDUDUK.", { object: art("22-Duduk"), tone: "black" }),
    ],
  },
  {
    id: "tonys-drive", title: "The Armenian Places Behind Tony’s Drive", section: "board",
    kind: "board", tone: "red", caption: "How many places did you recognise?",
    frames: [
      shot("THE PLACES\nBEHIND\nTONY’S DRIVE.", { tone: "red", layout: "type" }),
      shot("THE WAY\nIN.", { image: "assets/shot-23.png", layout: "full" }),
      shot("THE CITY\nOPENS UP.", { image: "assets/shot-31.png", layout: "full" }),
      shot("LOOK UP.", { image: "assets/shot-39.png", layout: "full" }),
    ],
  },
  {
    id: "pomegranate-trailer", title: "The Pomegranate Trailer", section: "promo",
    kind: "reel", tone: "red", caption: "It always starts with one seed.",
    frames: [
      shot("IT STARTS\nWITH ONE.", { object: art("07-Pomegranate"), tone: "red", layout: "macro", seconds: 3.0 }),
      shot("THEN ONE\nBECOMES MANY.", { object: art("07-Pomegranate"), tone: "black", layout: "macro", seconds: 3.0 }),
      shot("THE\nPOMEGRANATE.", { object: art("07-Pomegranate"), tone: "red", seconds: 5.0 }),
      shot("ONE SEED.\nA HUNDRED\nSTORIES.", { tone: "black", layout: "type", seconds: 4.0 }),
    ],
  },
  {
    id: "numbers-heritage", title: "Armenia on the World Heritage List", section: "editorial",
    kind: "carousel", tone: "yellow",
    caption: "Armenia has three entries on the UNESCO World Heritage List: the Echmiatsin and Zvartnots complex, the monasteries of Haghpat and Sanahin, and Geghard with the Upper Azat Valley. Each entry can cover more than one site.",
    source: "https://whc.unesco.org/en/statesparties/am", sourceLabel: "UNESCO World Heritage Centre · Armenia",
    frames: [
      shot("3", { kicker: "HELLO, I AM", note: "Armenian entries on the UNESCO World Heritage List.", layout: "number", object: art("30-Geghard-Monastery") }),
    ],
  },
  {
    id: "four-dots", title: "Four Ways to Say Hello", section: "promo",
    kind: "reel", tone: "black", caption: "One name. Four ways to say hello.",
    frames: [
      shot("", { layout: "wordmark", mark: art("01-Lavash"), seconds: 1.5 }),
      shot("", { layout: "wordmark", mark: art("03-Glass-of-Armenian-wine"), seconds: 1.5 }),
      shot("", { layout: "wordmark", mark: art("07-Pomegranate"), seconds: 1.5 }),
      shot("", { layout: "wordmark", mark: art("33-Mountain"), seconds: 1.5 }),
    ],
  },
];
globalThis.pilotCatalog = pilotCatalog;
if (typeof module !== "undefined") module.exports = pilotCatalog;
