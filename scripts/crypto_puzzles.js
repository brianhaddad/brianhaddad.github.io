const allPuzzles = {
    'test': {
        'title':    `Test Puzzle`,
        'unsolved': `Abcy cy d aeya fgiije. C kdla ca ah me neos jhlp ah pea d phhq ncek hr bhk C't oelqeoclp abclpy.`,
        'solved':   `This is a test puzzle. I want it to be very long to get a good view of how I'm rendering things.`,
    },
    'eq2024060901': {
        'title':    `Puzzle 1`,
        'unsolved': `K bqqohp hmhinyzhih ku xzh rixksbh xhtx aqi r crix ykxz htchsxhp Hudbkez bhxxhi aihfghuskhe jgx kx rcchrie xzrx lhljhie qa xzh ehmhuxn pq uqx geh brudgrdh xzrx bqqoe bkoh Hudbkez yzhu rurbnvhp!`,
        'solved':   `I looked everywhere in the article text for a part with expected English letter frequencies but it appears that members of the seventy do not use language that looks like English when analyzed!`,
    },
    'eq2024060902': {
        'title':    `Puzzle 2`,
        'unsolved': `Ho wby xzphnz maz vczpphdep bo maz fnhzpmabbx, hdgcyxhde ihnjgczp jdx maz ihdhpmnw bo jdezcp, H hdkhmz wby mb ljcq maz fjma bo gbkzdjdmp Ebx ajp ijxz jkjhcjvcz mb zjga bo yp.`,
        'solved':   `If you desire the blessings of the priesthood, including miracles and the ministry of angels, I invite you to walk the path of covenants God has made available to each of us.`,
    },
    'eq2024060903': {
        'title':    `Puzzle 3`,
        'unsolved': `Pr iestho irrd kyo rqarbc fgjkbhri peghr pkhdgyl k jglecrsti akce kyo esysjsgyl ajgricesso bsmrykyci. Lso pghh jrmrkh Egi asprj cs ti gn pr bstyc sy Egf kyo tir cer csshi Er eki lgmry ti.`,
        'solved':   `We should seek and expect miracles while walking a righteous path and honoroing priesthood covenants. God will reveal His power to us if we count on Him and use the tools He has given us.`,
    },
};

function getTitle(puzzleId) {
    return allPuzzles[puzzleId]['title'];
}

function getCiphertext(puzzleId) {
    return allPuzzles[puzzleId]['unsolved'];
}

function isSolved(puzzleId, currentText) {
    return allPuzzles[puzzleId]['solved'] === currentText;
}