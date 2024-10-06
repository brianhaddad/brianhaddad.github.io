//BITMAPS
const testImage = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe0, 0x70,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x60, 0x30, 0x0c, 0x03, 0x01, 0x00, 0x3f,
    0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe0, 0x1e, 0x07, 0x04, 0x04, 0x04, 0x04, 0x02, 0x02, 0x02,
    0x03, 0x02, 0x7e, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x03, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];

const WHITE = 'rgb(255,255,255)';
const BLACK = 'rgb(0,0,0)';

//The rest of the code:

const EXP_BITS = 12;
const TRAINING_BITS = 4;
const BASE_BITS = 16;
const VOWELS = 'aeiouy';

//Memory considerations:
//The Arduboy has 32 kilobytes of flash storage, as well as 1 kilobyte of EEPROM

const typeNames = {
    0: 'Plant',
    1: 'Fighting',
    2: 'Dirt',
    3: 'Rocky',
    4: 'Bug',
    5: 'Flying',
    6: 'Shadow',
    7: 'Light',
    8: 'Water',
    9: 'Fire',
    10: 'Ice',
    11: 'Poison',
    12: 'Robot',
    13: 'Fairy',
    14: 'Ghost',
    15: 'Dragon',
};

const tudiKinGender = ['♀', '♂'];
const gender = {
    female: tudiKinGender[0],
    male: tudiKinGender[1],
};

const decimalPortion = (n) => parseFloat((n - Math.trunc(n)).toPrecision(16));

const offset = (n, o) => o > 0 ? (n << (o - 1)) * 2 : n;
const bitMask = (numBits, o) => offset(Math.pow(2, numBits) - 1, o);
const getFlag = (bits, pos) => bits >> pos & 1;
const invertBit = (bit) => bit === 0 ? true : false;
const getVal = (bits, numBits, offset) => (bits >> offset) & (Math.pow(2, numBits) - 1);
const incrementBits = (bits, numBits) => (++bits) & (Math.pow(2, numBits) - 1); //TODO: will be used for evolution? increment species value?

const formTrainingDataValue = (exp, training) => (exp << TRAINING_BITS) | training;

const capitalizeFirstLetter = (input) => input.substr(0, 1).toUpperCase() + input.substr(1).toLowerCase();
const endsWithVowel = (input) => {
    for (let i = 0; i < VOWELS.length; i++) {
        if (input.toLowerCase().endsWith(VOWELS[i])) {
            return true;
        }
    }
    return false;
};
const startsWithVowel = (input) => {
    for (let i = 0; i < VOWELS.length; i++) {
        if (input.toLowerCase().startsWith(VOWELS[i])) {
            return true;
        }
    }
    return false;
};
const combineNameParts =(part1, part2) => {
    if (!endsWithVowel(part1)
        && !part1.toLowerCase().endsWith('w')
        && !part1.toLowerCase().endsWith('r')
        && !startsWithVowel(part2)) {
        return capitalizeFirstLetter(part1 + 'i' + part2)
    }
    return capitalizeFirstLetter(part1 + part2);
};

const tudiKinData = {
    type: {
        numBits: 4,
        offset: BASE_BITS - 4,
    },
    species: {
        numBits: 4,
        offset: BASE_BITS - 8,
    },
    gender: {
        numBits: 1,
        offset: BASE_BITS - 9,
    },
    special: {
        numBits: 1,
        offset: BASE_BITS - 10,
    },
    baseDefense: {
        numBits: 2,
        offset: BASE_BITS - 12,
    },
    baseAttack: {
        numBits: 2,
        offset: BASE_BITS - 14,
    },
    baseSpeed: {
        numBits: 2,
        offset: BASE_BITS - 16,
    },
};

const tudiKinDataParser = {
    type: (data) => getVal(data, tudiKinData.type.numBits, tudiKinData.type.offset),
    species: (data) => getVal(data, tudiKinData.species.numBits, tudiKinData.species.offset),
    gender: (data) => getVal(data, tudiKinData.gender.numBits, tudiKinData.gender.offset),
    special: (data) => getVal(data, tudiKinData.special.numBits, tudiKinData.special.offset),
    baseDefense: (data) => getVal(data, tudiKinData.baseDefense.numBits, tudiKinData.baseDefense.offset),
    baseAttack: (data) => getVal(data, tudiKinData.baseAttack.numBits, tudiKinData.baseAttack.offset),
    baseSpeed: (data) => getVal(data, tudiKinData.baseSpeed.numBits, tudiKinData.baseSpeed.offset),
};

//For leveling with 2^12 bits, from 0-4095, this combo lands exactly on level 100 at 4095.
const rateOfAdvancement = 1.5627;
const levelUpDifficulty = 2;
const xpToLevel = (xp) => {
    switch (levelUpDifficulty) {
        case 2:
            return Math.floor(rateOfAdvancement * Math.sqrt(xp));
        
        case 3:
            return Math.floor(rateOfAdvancement * Math.cbrt(xp));
        
        default:
            return Math.floor(rateOfAdvancement * Math.pow(xp, 1/levelUpDifficulty));
    }
};
const levelToXp = (level) => {
    return Math.ceil(Math.pow(level / rateOfAdvancement, levelUpDifficulty));
};

function getTypeName(typeNum) {
    if (typeNames.hasOwnProperty(typeNum)) {
        return typeNames[typeNum];
    }

    return typeNum.toString(2).padStart(4, '0');
}

function buildFullTudiKinName(typeNum, speciesNum) {
    const hotSounds = [
        'flam',
        'pyro',
        'ember',
        'veno',
        'spici',
        'hot',
    ];
    
    const coldSounds = [
        'bur',
        'cool',
        'frigi',
        'frozi',
        'chili',
    ];
    
    const strongSounds = [
        'rigi',
        'hardi',
        'ite',
        'rough',
        'steel',
        'rocky',
    ];
    
    const fastSounds = [
        'rapi',
        'qui',
        'zipi',
        'wee',
        'zoomi',
    ];
    
    const highSounds = [
        'fly',
        'bird',
        'flutter',
    ];
    
    const lowSounds = [
        'lo',
        'dirti',
        'boom',
        'gro',
        'rumbo',
    ];
    
    const metaSounds = [
        'magi',
        'mysti',
        'meta',
        'crypto',
        'vexi',
        'lyra',
    ];
    
    const normalSounds = [
        'avro',
        'norm',
        'normi',
        'usu',
        'bobo',
    ];
    
    const extraSounds = [
        'abi',
        'noto',
        'propa',
        'zulu',
        'lapa',
        'prudo',
        'pupu',
        'pipi',
        'wulu',
        'grum',
        'juju',
        'stinki',
        'xandu',
        'skolo',
        'drulu',
        'aya',
        'nano',
        'rako',
        'pizo',
        'yapa',
        'nono',
        'peno',
        'pepe',
        'panti',
        'nana',
        'lepu',
        'nene',
        'wobli',
        'pino',
    ];

    const fullVariationNum = (typeNum << 4) + speciesNum;

    const isHotCold = getFlag(typeNum, 0) === 1;
    const isArmoredFast = getFlag(typeNum, 1) === 1;
    const isHighLow = getFlag(typeNum, 2) === 1;
    const isMetaNormal = getFlag(typeNum, 3) === 1;

    const speciesSounds = [];
    isHotCold ? speciesSounds.push(hotSounds[(speciesNum) % hotSounds.length]) : speciesSounds.push(coldSounds[(speciesNum) % coldSounds.length]);
    isArmoredFast ? speciesSounds.push(strongSounds[(speciesNum) % strongSounds.length]) : speciesSounds.push(fastSounds[(speciesNum) % fastSounds.length]);
    isHighLow ? speciesSounds.push(highSounds[(speciesNum) % highSounds.length]) : speciesSounds.push(lowSounds[(speciesNum) % lowSounds.length]);
    isMetaNormal ? speciesSounds.push(metaSounds[(speciesNum) % metaSounds.length]) : speciesSounds.push(normalSounds[(speciesNum) % normalSounds.length]);

    const extraSound = extraSounds[(speciesNum + typeNum) % extraSounds.length];

    const typeName = getTypeName(typeNum);

    switch ((fullVariationNum + 1) % 7) {
        case 0:
            return combineNameParts(speciesSounds[(fullVariationNum) % speciesSounds.length], extraSound);
            
        case 1:
            return combineNameParts(extraSound, speciesSounds[(fullVariationNum) % speciesSounds.length]);
                
        case 2:
            return combineNameParts(speciesSounds[(speciesNum) % speciesSounds.length], typeName);
                    
        case 3:
            return combineNameParts(typeName, extraSound);
                        
        case 4:
            return combineNameParts(extraSound, typeName);
                            
        case 5:
            return combineNameParts(typeName, speciesSounds[(speciesNum) % speciesSounds.length]);

        default:
            return combineNameParts(speciesSounds[(fullVariationNum + 23) % speciesSounds.length], speciesSounds[(speciesNum + 17) % speciesSounds.length]);
    }
}

function drawTudiKin(ctx, typeNum, speciesNum) {
    //screen size 128 x 64
    //image editor:
    //https://emutyworks.github.io/BitmapEditor/demo/index.html
    const x = 0;
    const y = 0;
    const tudiWidth = 32;
    const tudiHeight = 32;
    const fullVariationNum = (typeNum << 4) + speciesNum;
    const hotCold = getFlag(typeNum, 0);
    const armoredFast = getFlag(typeNum, 1);
    const highLow = getFlag(typeNum, 2);
    const metaNormal = getFlag(typeNum, 3);
    //TODO: come up with a series of images and ways to layer them in order to draw
    //the various tudi-kin creatures.
    ctx.save();
    arduboyDrawBitmap(ctx, 0, 0, testImage, 32, 32, WHITE);
    ctx.restore();
}

function arduboyDrawBitmap(ctx, x, y, byteArray, w, h, color) {
    let sector = -1;
    let sx = 0;
    let sy = 0;
    const sectorWidth = 8;
    const sectorHeight = 8;
    const sectorsWide = w / 8;
    const drawX = () => ((sector % sectorsWide) * sectorWidth) + sx;
    const drawY = () => (Math.floor(sector / sectorsWide) * sectorHeight) + sy;
    ctx.fillStyle = color;
    for (let i = 0; i < byteArray.length; i++) {
        if (i % 8 === 0) {
            sector++;
        }
        const bits = byteArray[i].toString(2).padStart(8, '0');
        for (p = 0; p < bits.length; p++) {
            sy = 7-p;
            sx = i % 8;
            if (bits[p] === '1') {
                putPixel(ctx, drawX(), drawY());
            }
        }
    }
}

function putPixel(ctx, x, y) {
    ctx.fillRect(x, y, 1, 1);
}

function getTypeAdvantage(attacker, defender) {
    const aHotCold = getFlag(attacker, 0);
    const aArmoredFast = getFlag(attacker, 1);
    const aHighLow = getFlag(attacker, 2);
    const aMetaNormal = getFlag(attacker, 3);
    
    const dHotCold = getFlag(defender, 0);
    const dArmoredFast = getFlag(defender, 1);
    const dHighLow = getFlag(defender, 2);
    const dMetaNormal = getFlag(defender, 3);

    const sBonus = .25;
    const mBonus = .5;
    const lBonus = 1;
    
    //TODO: better calculations? These will work for now I guess.
    //Could do a series of bitwise operations and math and see how that turns out...
    let bonus = .5;

    //small balancing bonus
    const balanceBonus = ((1/(attacker + 1)) / 1) + ((defender + 1) / 17);
    bonus += Math.min(1, balanceBonus * balanceBonus * balanceBonus);
    
    //Base Bonuses
    bonus += (aHotCold * sBonus) - (dHotCold * sBonus);
    bonus += (invertBit(aArmoredFast) * sBonus) - (invertBit(dArmoredFast) * sBonus);
    bonus += (aHighLow * mBonus) - (dHighLow * mBonus);
    bonus += (aMetaNormal * sBonus) - (dMetaNormal * sBonus);

    bonus += (aHotCold * sBonus) - (dMetaNormal * sBonus);
    bonus += (aArmoredFast * sBonus) - (dHighLow * sBonus);
    bonus += (aHighLow * sBonus) - (dHotCold * sBonus);
    bonus += (aMetaNormal * sBonus) - (dArmoredFast * sBonus);

    //Special Cases

    //Hot attacking hot
    if (aHotCold + dHotCold === 2) {
        bonus += sBonus;
    }

    //Metaphysical attacking fast
    bonus += Math.max(0, (aMetaNormal * sBonus) - (dArmoredFast * sBonus));

    //Armored attacking high
    bonus += Math.max(0, (aArmoredFast * sBonus) - (invertBit(dHighLow) * sBonus));

    //Water attacking fire
    if (attacker === 8 && defender === 9) {
        bonus += lBonus + mBonus;
    }
    //Fire attacking water
    if (attacker === 9 && defender === 8) {
        bonus -= mBonus;
    }

    bonus = Math.floor(bonus * 2) / 2;

    return Math.min(Math.max(0, bonus), 2);
}

function TudiKin(data, trainingData) {
    const id = data;
    let exp = getVal(trainingData, EXP_BITS, TRAINING_BITS);
    let training = getVal(trainingData, TRAINING_BITS, 0);

    const type = tudiKinDataParser.type(data);
    const species = tudiKinDataParser.species(data);
    const gender = tudiKinGender[tudiKinDataParser.gender(data)];
    const isSpecial = tudiKinDataParser.special(data) === 1;
    const baseDefense = tudiKinDataParser.baseDefense(data);
    const baseAttack = tudiKinDataParser.baseAttack(data);
    const baseSpeed = tudiKinDataParser.baseSpeed(data);

    const fullDisplayName = buildFullTudiKinName(type, species);
    const catalogueNumber = ((type << 4) + species) + 1; //for display

    //Used for save data
    this.getId = () => id;
    this.getFullTrainingData = () => formTrainingDataValue(exp, training);

    //TODO: some save data (such as current health, held item?, party position, etc.) will be part of the player data rather than the tudi-kin data.

    //Advanced display data (not typically displayed to user)
    this.getExp = () => exp;
    this.getTraining = () => training;
    this.getType = () => type.toString(2).padStart(tudiKinData.type.numBits, '0');
    this.getBaseDefense = () => baseDefense;
    this.getBaseAttack = () => baseAttack;
    this.getBaseSpeed = () => baseSpeed;
    
    //Used for display
    this.getFullName = () => fullDisplayName;
    this.getCatalogueNumber = () => catalogueNumber;
    this.getGender = () => gender;
    this.getIsSpecial = () => isSpecial;
    this.getTypeName = () => getTypeName(type);
    this.getLevel = () => xpToLevel(exp);
    this.getProgressToNextLevel = () => (this.getLevel() === 100)
        ? 1
        : (exp - levelToXp(this.getLevel())) / (levelToXp(this.getLevel() + 1) - levelToXp(this.getLevel()));

    this.getTypeNum = () => type;
    this.getSpeciesNum = () => species;

    //Moves:
    //Defensive Posture
    //  Double's defense stat but doesn't deal damage
    //Normal Attack
    //  TypeAdvantage is a multiplier, which can zero out the damage
    //  Leaves the user's defense stat alone
    //Strong Attack
    //  Always uses base attack damage
    //  Uses TypeAdvantage to multiply with an added bonus damage
    //  Can cause damage when normal attack can't
    //  Cuts the user's defense stat for that round

    //Max Health:
    //9 bits: 512 max
    //3 bits are given: min health is 7 (111 in binary)
    //The other six bits are calculated based on armored flag, base defense, level, training distribution, and possibly a little from species/gender/special too.
    //(see stats calculations below)
    //This means that the battle data only needs to store 6 bits for current health (add on the 3 given 1's at the beginning).
    //If we want more battle status data, we still have 10 bits to work with to track other status changes/flags. :)

    //Training:
    //  There are 4 types of training:
    //    Special
    //    Defense
    //    Attack
    //    Speed
    //  The Special training adds a small bonus to the type matchup bonus, allowing "not effective"
    //  moves to do a small amount of damage.
    //  The others grant a multiplied bonus to the user's calculated stats.
    //  There is a total 'budget' of bonuses to be distributed.
    //  If all training has gone into one stat, the full bonus goes there.
    //  If training has gone into two stats, it is evenly divided between them.
    //  Thus the total training bonus needs to be divisible by 2, 3, and 4. Probably 12 points to award, total,
    //  but those points need to translate into fractions of certain maximums for each stat.

    //TODO: move availability is determined by species and gender plus the three lower bits in the base stats
    //Need to determine which order the moves are available in, and at what levels
    
    //TODO: calculate stats from species/gender/special bits, base stat bits, exp, training, and type.
    //Example, max health comes from armored flag, base defense, level, training distribution, and possibly a little from species/gender/special too.
    //Defense comes from gender, base defense, training distribution, and level.
    //Speed comes from gender, base speed, training, distribution, and level.
    //Gender has +1 defense for male, +1 speed for female.
    //Special generally gives a bonus multiplier to stats?
    //All base stats are multiplied by some even number (makes it easier to cut in half for strong attack)

    //TODO: simulate some battles.
    //It might be possible to use the rest of the stats (plus some training options)
    //to even out the playing field and create situations where "bad" ones can still
    //become competetive.
}

function makeRandomTrainingData(minLevel, maxLevel) {
    const minExp = levelToXp(minLevel);
    const maxExp = Math.min(levelToXp(maxLevel + 1), Math.pow(2, EXP_BITS));
    //console.log(`minLevel: ${minLevel}, minExp: ${minExp}`);
    //console.log(`maxLevel: ${maxLevel}, maxExp: ${maxExp}`);

    const exp = Math.floor(Math.random() * (maxExp - minExp)) + minExp;
    //console.log(`generated exp: ${exp}`);
    const training = Math.floor(Math.random() * Math.pow(2, TRAINING_BITS));
    //console.log('generated training', training);

    return formTrainingDataValue(exp, training);
}

const specialBit = () => Math.floor(Math.random() * Math.pow(2, 14)) < 2 ? 1 : 0;

function createRandomTudiKinId() {
    const typeNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.type.numBits)), tudiKinData.type.offset);
    const speciesNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.species.numBits)), tudiKinData.species.offset);
    const genderNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.gender.numBits)), tudiKinData.gender.offset);
    const specialNum = offset(specialBit(), tudiKinData.special.offset);
    const defenseNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.baseDefense.numBits)), tudiKinData.baseDefense.offset);
    const attackNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.baseAttack.numBits)), tudiKinData.baseAttack.offset);
    const speedNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.baseSpeed.numBits)), tudiKinData.baseSpeed.offset);

    //console.log(typeNum.toString(2).padStart(16, '0'), 'type', typeNum);
    //console.log(speciesNum.toString(2).padStart(16, '0'), 'species', speciesNum);
    //console.log(genderNum.toString(2).padStart(16, '0'), 'gender', genderNum);
    //console.log(specialNum.toString(2).padStart(16, '0'), 'special', specialNum);
    //console.log(defenseNum.toString(2).padStart(16, '0'), 'defense', defenseNum);
    //console.log(attackNum.toString(2).padStart(16, '0'), 'attack', attackNum);
    //console.log(speedNum.toString(2).padStart(16, '0'), 'speed', speedNum);

    const id = typeNum | speciesNum | genderNum | specialNum | defenseNum | attackNum | speedNum;
    //console.log(id.toString(2).padStart(16, '0'), id);
    return id;
}

function makeTotallyRandomTudiKin() {
    return new TudiKin(createRandomTudiKinId(), makeRandomTrainingData(0, 100));
}

function makeSameLevelOpponent(firstTudiKin) {
    return new TudiKin(createRandomTudiKinId(), makeRandomTrainingData(firstTudiKin.getLevel(), firstTudiKin.getLevel()));
}

//TEMP TEST FUNCTIONS

//TODO: rather than making this temp, adopt it for use in the "dex" or encylopedia function?
function printAllNames() {
    const allNames = [];
    let repeats = 0;
    for (let t = 0; t < 16; t++) {
        for (let s = 0; s < 16; s++) {
            const name = buildFullTudiKinName(t, s);
            if (allNames.indexOf(name) > -1) {
                console.log(`REPEAT ${name} @ ${t}:${s}`);
                repeats++;
            }
            else {
                allNames.push(name);
                console.log(name);
            }
        }
    }
    console.log(`Total repeats: ${repeats}`);
    return allNames;
}

//The 'findUnusedSounds' method requires access to the sound arrays, so it is commented out until needed again.
//Hopefully it won't be needed again!
//function checkSounds(allNames, sounds, soundsName) {
//    let total = 0
//    const soundChecks = {};
//    for (const n of allNames) {
//        for (const s of sounds) {
//            if (!soundChecks.hasOwnProperty(s)) {
//                soundChecks[s] = false;
//            }
//            if (n.startsWith(s) || n.endsWith(s)) {
//                soundChecks[s] = true;
//                total++;
//                break;
//            }
//        }
//    }
//    if (total < sounds.length) {
//        console.log(`-----------NO sounds in ${soundsName} are used!!!-----------`);
//    }
//    else {
//        for (const s in soundChecks) {
//            if (soundChecks[s] === false) {
//                console.log(`'${s}' in ${soundsName} is unused.`);
//            }
//        }
//    }
//}

//function findUnusedSounds() {
//    const allNames = printAllNames();
//    checkSounds(allNames, hotSounds, 'hotSounds');
//    checkSounds(allNames, coldSounds, 'coldSounds');
//    checkSounds(allNames, strongSounds, 'strongSounds');
//    checkSounds(allNames, fastSounds, 'fastSounds');
//    checkSounds(allNames, highSounds, 'highSounds');
//    checkSounds(allNames, lowSounds, 'lowSounds');
//    checkSounds(allNames, metaSounds, 'metaSounds');
//    checkSounds(allNames, normalSounds, 'normalSounds');
//    checkSounds(allNames, extraSounds, 'extraSounds');
//}