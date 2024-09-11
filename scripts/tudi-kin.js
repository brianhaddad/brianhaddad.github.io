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

const tudiKinData = {
    type: {
        numBits: 4,
        offset: 28,
    },
};

const offset = (n, o) => o > 0 ? (n << (o - 1)) * 2 : n;
const bitMask = (numBits, o) => offset(Math.pow(2, numBits) - 1, o);
const getFlag = (bits, pos) => bits >> pos & 1;
const invertBit = (bit) => bit === 0 ? true : false;

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

    const hotColdFlag = getFlag(typeNum, 0) === 1;
    const armoredFastFlag = getFlag(typeNum, 1) === 1;
    const highLowFlag = getFlag(typeNum, 2) === 1;
    const metaphysicalPhysicalFlag = getFlag(typeNum, 3) === 1;

    //If all else fails, just return the collection of flags:
    const labels = [];
    labels.push(hotColdFlag ? 'hot' : 'cold');
    labels.push(armoredFastFlag ? 'armored' : 'fast');
    labels.push(highLowFlag ? 'high' : 'low');
    labels.push(metaphysicalPhysicalFlag ? 'metaphysical' : 'normal');
    return typeNum + ': ' + labels.join(' ');
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

    let bonus = 1;

    const sBonus = .25;
    const mBonus = .5;

    //TODO: need better calculations... these suck.
    
    bonus += (aHotCold * sBonus) - (dHotCold * sBonus);
    bonus += (aArmoredFast * sBonus) - (dArmoredFast * sBonus);
    bonus += (aHighLow * mBonus) - (dHighLow * mBonus);
    bonus += (aMetaNormal * sBonus) - (dMetaNormal * sBonus);

    bonus += (aHotCold * sBonus) - (dMetaNormal * sBonus);
    bonus += (aArmoredFast * sBonus) - (dHighLow * sBonus);
    bonus += (aHighLow * sBonus) - (dHotCold * sBonus);
    bonus += (aMetaNormal * sBonus) - (dArmoredFast * sBonus);

    //Special Cases

    //Metaphysical attacking metaphysical
    if (aMetaNormal + dMetaNormal === 2) {
        bonus -= sBonus;
    }

    //Hot attacking hot
    if (aHotCold + dHotCold === 2) {
        bonus += sBonus;
    }

    //Metaphysical attacking fast
    if (aMetaNormal > dArmoredFast) {
        bonus += sBonus;
    }

    //Armored attacking high
    if (aArmoredFast + dHighLow === 2) {
        bonus += sBonus;
    }

    bonus = Math.floor(bonus * 2) / 2;

    //return Math.max(0, bonus);

    return Math.min(Math.max(0, bonus), 2);
}