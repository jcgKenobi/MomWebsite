// Game Constants and Configuration
const WORD_BANKS = {
    ENGLISH: [
        "HAPPY", "HOUSE", "WATER", "HEART", "SMILE", 
        "LIGHT", "PEACE", "DREAM", "MUSIC", "SWEET", 
        "BREAD", "CLEAN", "FRESH", "LAUGH", "DANCE"
    ],
    TURKEY: [
        "GUZEL", "SEVGI", "MUTLU", "HUZUR", "YUVA", 
        "AILEM", "KALBI", "OMRUM", "HAYAT", "GUVEN", 
        "SABIR", "UMUT", "GURUR", "DESTEK", "YAKIN"
    ],
    NATURE: [
        "AGAC", "ORMAN", "TOPRAK", "NEHIR", "HAVA", 
        "DENIZ", "GOKYUZU", "YAGMUR", "BULUT", "GUNES", 
        "YILDIZ", "GEZEGEN", "DOGA", "HAYVAN", "BITKI"
    ]
};

const GAME_CONFIG = {
    MAX_GUESSES: 6,
    WORD_LENGTH: 5,
    KEYBOARD_LAYOUTS: {
        TURKISH: [
            "QWERTYUIOPĞÜ".split(""),
            "ASDFGHJKLŞİ".split(""),
            ["ENTER", ..."ZXCVBNMÖÇ".split(""), "BACKSPACE"]
        ]
    }
};

const CATEGORY_NAMES = {
    ENGLISH: '🇬🇧 English',
    TURKEY: '🇹🇷 Türkiye', 
    NATURE: '🌿 Doğa'
};

const SPECIAL_KEYS = {
    ENTER: "↵",
    BACKSPACE: "⌫"
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WORD_BANKS,
        GAME_CONFIG,
        CATEGORY_NAMES,
        SPECIAL_KEYS
    };
}