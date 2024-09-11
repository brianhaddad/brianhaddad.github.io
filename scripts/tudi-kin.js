const MAX_TUDI_KIN_VALUE = Math.pow(2, 53 - 1);
const EXP_BITS = 21;

const typeNames = {
    0: 'Plant',
    1: 'Fighting',
    2: 'Rocky',
    3: 'Steel',
    4: 'Bug',
    5: 'Flying',
    6: 'Shadow',
    7: 'Light',
    8: 'Water',
    9: 'Fire',
    10: 'Ice',
    11: 'Poison',
    12: 'Electric',
    13: 'Fairy',
    14: 'Ghost',
    15: 'Dragon',
};

const type = {
    hot: 'hot',
    cold: 'cold',
    armored: 'armored',
    fast: 'fast',
    high: 'high',
    low: 'low',
    metaphysical: 'metaphysical',
    normal: 'normal',
};

const attack = {};

attack[type.hot] = {};
attack[type.hot][type.cold] = 1;
attack[type.hot][type.armored] = -2;
attack[type.hot][type.metaphysical] = 1;

attack[type.cold] = {};
attack[type.cold][type.armored] = -1;
attack[type.cold][type.fast] = 1;
attack[type.cold][type.low] = 1;
attack[type.cold][type.normal] = -1;

attack[type.armored] = {};
attack[type.armored][type.hot] = .5;
attack[type.armored][type.cold] = -1;
attack[type.armored][type.fast] = -2;
attack[type.armored][type.high] = 1;
attack[type.armored][type.normal] = 1.5;

attack[type.fast] = {};
attack[type.fast][type.cold] = -.5;
attack[type.fast][type.armored] = 2;
attack[type.fast][type.metaphysical] = -1.5;

attack[type.high] = {};
attack[type.high][type.hot] = -.5;
attack[type.high][type.armored] = -.5;
attack[type.high][type.low] = 2;

attack[type.low] = {};
attack[type.low][type.high] = -2;

attack[type.metaphysical] = {};
attack[type.metaphysical][type.metaphysical] = -.5;
attack[type.metaphysical][type.normal] = .5;

attack[type.normal] = {};
attack[type.normal][type.metaphysical] = -2;

const tudiKinData = {
    type: {
        numBits: 4,
        offset: 28,
    },
};

const offset = (n, o) => o > 0 ? (n << (o - 1)) * 2 : n;
const bitMask = (numBits, o) => offset(Math.pow(2, numBits) - 1, o);
const flagGet = (bits, pos) => bits >> pos & 1 === 1;

function TudiKin(data) {
    const id = parseInt(data.toString(2).substr(0, 32), 2);
    let exp = parseInt(data.toString(2).substr(32), 2);

    const type = id / 2 >> tudiKinData.type.offset - 1;

    //this.getId = () => id;
    //this.getExp = () => exp;

    this.getType = () => type.toString(2);
}

function CreateRandomTudiKin(exp) {
    const typeNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.type.numBits)), tudiKinData.type.offset);

    const id = typeNum; //TODO: 'or' all the numbers together?

    return parseInt((id.toString(2) + exp.toString(2).padStart(EXP_BITS, '0')), 2);
}

function getTypeName(typeNum) {
    if (typeNames.hasOwnProperty(typeNum)) {
        return typeNames[typeNum];
    }

    const hotColdFlag = flagGet(typeNum, 0);
    const armoredFastFlag = flagGet(typeNum, 1);
    const highLowFlag = flagGet(typeNum, 2);
    const metaphysicalPhysicalFlag = flagGet(typeNum, 3);

    //If all else fails, just return the collection of flags:
    const labels = [];
    labels.push(hotColdFlag ? 'hot' : 'cold');
    labels.push(armoredFastFlag ? 'armored' : 'fast');
    labels.push(highLowFlag ? 'high' : 'low');
    labels.push(metaphysicalPhysicalFlag ? 'metaphysical' : 'normal');
    return typeNum + ': ' + labels.join(' ');
}

//TODO: I messed this up already I think
//The range should be from 0 to 2 in half increments:
//0, .5, 1, 1.5, 2
//TODO: Also this needs to be easy to recreate in C for the Arduino... Hrm...
function getBonus(attacker, defender) {
    const data = attack[attacker];
    return data.hasOwnProperty(defender) ? data[defender] : 0;
}

function getTypeAdvantage(attacker, defender) {
    const attacks = [
        flagGet(attacker, 0) ? type.hot : type.cold,
        flagGet(attacker, 1) ? type.armored : type.fast,
        flagGet(attacker, 2) ? type.high : type.low,
        flagGet(attacker, 3) ? type.metaphysical : type.normal,
    ];
    const defenses = [
        flagGet(defender, 0) ? type.hot : type.cold,
        flagGet(defender, 1) ? type.armored : type.fast,
        flagGet(defender, 2) ? type.high : type.low,
        flagGet(defender, 3) ? type.metaphysical : type.normal,
    ];

    let total = 1;

    for (const a of attacks) {
        for (const d of defenses) {
            total += getBonus(a, d);
        }
    }

    return Math.min(Math.max(0, total), 2);
}