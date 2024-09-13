const EXP_BITS = 12;
const TRAINING_BITS = 4;
const BASE_BITS = 16;

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

const offset = (n, o) => o > 0 ? (n << (o - 1)) * 2 : n;
const bitMask = (numBits, o) => offset(Math.pow(2, numBits) - 1, o);
const getFlag = (bits, pos) => bits >> pos & 1;
const invertBit = (bit) => bit === 0 ? true : false;
const getVal = (bits, numBits, offset) => (bits >> offset) & (Math.pow(2, numBits) - 1);


const tudiKinData = {
    type: {
        numBits: 4,
        offset: BASE_BITS - 4,
    },
    variation: {
        numBits: 6,
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
};

//For leveling with 2^12 bits, from 0-4095, this combo lands
//exactly on level 100 at 4095.
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

    this.getId = () => id;
    this.getExp = () => exp;
    this.getTraining = () => training;

    this.getType = () => type.toString(2);
    this.getTypeName = () => getTypeName(type);

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

    //TODO: move availability is determined by variation plus the three lower bits in the base stats
    //Need to determine which order the moves are available in, and at what levels
    
    //TODO: calculate stats from variation bits, base stat bits, exp, training, and type.
    //Example, max health comes from armored flag, base defense, level, training distribution, and possibly a little from variation too.
    //Defense comes from base defense, training distribution, and level.
    //All base stats are multiplied by some even number (makes it easier to cut in half for strong attack)

    //TODO: simulate some battles.
    //It might be possible to use the rest of the stats (plus some training options)
    //to even out the playing field and create situations where "bad" ones can still
    //become competetive.
}

function CreateRandomTudiKin() {
    const typeNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.type.numBits)), tudiKinData.type.offset);
    const variationNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.variation.numBits)), tudiKinData.variation.offset);
    const defenseNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.baseDefense.numBits)), tudiKinData.baseDefense.offset);
    const attackNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.baseAttack.numBits)), tudiKinData.baseAttack.offset);
    const speedNum = offset(Math.floor(Math.random() * Math.pow(2, tudiKinData.baseSpeed.numBits)), tudiKinData.baseSpeed.offset);

    //console.log(typeNum.toString(2).padStart(16, '0'));
    //console.log(variationNum.toString(2).padStart(16, '0'));
    //console.log(defenseNum.toString(2).padStart(16, '0'));
    //console.log(attackNum.toString(2).padStart(16, '0'));
    //console.log(speedNum.toString(2).padStart(16, '0'));

    const id = typeNum | variationNum | defenseNum | attackNum | speedNum; //TODO: 'or' all the numbers together?
    //console.log(id.toString(2).padStart(16, '0'), id);
    return id;
}