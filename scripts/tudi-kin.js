const MAX_TUDI_KIN_VALUE = Math.pow(2, 53 - 1);
const EXP_BITS = 21;

const typeNames = {
    0: 'Water',
    1: 'Fighting',
    2: 'Rocky',
    3: 'Plant',
    4: 'Bug',
    5: 'Flying',
    6: 'Shadow',
    7: 'Light',
    8: 'Robot',
    9: 'Fire',
    10: 'Ice',
    11: 'Poison',
    12: 'Electric',
    13: 'Fairy',
    14: 'Ghost',
    15: 'Dragon',
};

const tudiKinData = {
    type: {
        numBits: 4,
        offset: 28,
    },
};

const offset = (n, o) => o > 0 ? (n << (o - 1)) * 2 : n;
const bitMask = (numBits, o) => offset(Math.pow(2, numBits) - 1, o);
const flagSet = (bits, pos) => bits >> pos & 1 === 1;

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

    const hotColdFlag = flagSet(typeNum, 0);
    const armoredFastFlag = flagSet(typeNum, 1);
    const highLowFlag = flagSet(typeNum, 2);
    const metaphysicalPhysicalFlag = flagSet(typeNum, 3);

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
function getTypeAdvantage(attacker, defender) {
    const aType = getTypeName(attacker);
    const dType = getTypeName(defender);

    if (aType === 'Water' && dType === 'Fire') {
        return 2;
    }

    if (aType === 'Fire' && dType === 'Water') {
        return .5;
    }

    if (aType === 'Fire' && dType === 'Ice') {
        return 2;
    }

    if (aType === 'Light' && dType === 'Shadow') {
        return 2;
    }

    if (aType === 'Shadow' && dType === 'Light') {
        return 0;
    }

    //If all else fails, use generic flag checks
    const attackerHotColdFlag = flagSet(attacker, 0);
    const attackerArmoredFastFlag = flagSet(attacker, 1);
    const attackerHighLowFlag = flagSet(attacker, 2);
    const attackerMetaphysicalPhysicalFlag = flagSet(attacker, 3);
    
    const defenderHotColdFlag = flagSet(defender, 0);
    const defenderArmoredFastFlag = flagSet(defender, 1);
    const defenderHighLowFlag = flagSet(defender, 2);
    const defenderMetaphysicalPhysicalFlag = flagSet(defender, 3);

    return 1;
}