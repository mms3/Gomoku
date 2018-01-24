"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const util_1 = require("util");
admin.initializeApp(functions.config().firebase);
exports.saveUserStatsAfterCreate = functions.auth.user().onCreate(event => {
    if (!util_1.isUndefined(event.data.displayName)) {
        return admin.database().ref('rankings/' + event.data.uid).set({
            rank: 0,
            played: 0,
            wins: 0,
            losses: 0,
            player: {
                name: event.data.displayName,
                photo: event.data.photoURL
            }
        });
    }
    else {
        return null;
    }
});
exports.deleteUserStatsAfterDeletingUser = functions.auth.user().onDelete(event => {
    return admin.database().ref('rankings').child(event.data.uid).remove;
});
exports.checkBoardForWinAfterMove = functions.database.ref('/games/{gameId}/board').onUpdate(event => {
    return event.data.ref.parent.once('value').then(snap => {
        const game = snap.val();
        if (game.status === 'inProgress') {
            const id = event.params.gameId;
            const board = event.data.val();
            const check = checkWin(board);
            if (check === 0) {
                return admin.database().ref('games/' + id).update({
                    turn: game.turn === 1 ? 2 : 1,
                    nextMoveTime: Date.now() + 61000,
                });
            }
            else {
                return setStatsAfterWin(game, id).then(() => {
                    return admin.database().ref('games/' + id).update({
                        status: 'finished',
                        nextMoveTime: null,
                    });
                });
            }
        }
        else {
            return null;
        }
    });
});
exports.saveStatsBeforeQuittingGame = functions.database.ref('/games/{gameId}/status').onUpdate(event => {
    return event.data.ref.parent.once('value').then(snap => {
        const game = snap.val();
        if (game.status === 'beforeClosed') {
            const id = event.params.gameId;
            if (game.quitBeforeFinish) {
                return setStatsBeforeQuit(game.quitUserNumber, game, id).then(() => {
                    return admin.database().ref('games/' + id).update({
                        status: 'closed'
                    });
                });
            }
            else {
                return admin.database().ref('games/' + id).update({
                    status: 'closed'
                });
            }
        }
        else {
            return null;
        }
    });
});
function checkWin(b) {
    // check horizontal win
    let boardAsString = b.join('x').replace(/,/g, '');
    if (boardAsString.match(/(?:^|[^1])1{5}(?!1)/)) {
        return 1;
    }
    if (boardAsString.match(/(?:^|[^2])2{5}(?!2)/)) {
        return 2;
    }
    // check vertical win
    let temp = b[0].map((y, i) => b.map(x => x[i]));
    boardAsString = temp.join('x').replace(/,/g, '');
    if (boardAsString.match(/(?:^|[^1])1{5}(?!1)/)) {
        return 1;
    }
    if (boardAsString.match(/(?:^|[^2])2{5}(?!2)/)) {
        return 2;
    }
    // check diagonal L to R win
    temp = b.map((x, i) => Array(17 - i).fill(0).concat(x));
    temp = temp[0].map((y, i) => temp.map(x => x[i]));
    boardAsString = temp.join('x').replace(/,/g, '');
    if (boardAsString.match(/(?:^|[^1])1{5}(?!1)/)) {
        return 1;
    }
    if (boardAsString.match(/(?:^|[^2])2{5}(?!2)/)) {
        return 2;
    }
    // check diagonal R to L win
    temp = b.map((x, i) => Array(i).fill(0).concat(x).concat(Array(17 - i).fill(0)));
    temp = temp[0].map((y, i) => temp.map(x => x[i]));
    boardAsString = temp.join('x').replace(/,/g, '');
    if (boardAsString.match(/(?:^|[^1])1{5}(?!1)/)) {
        return 1;
    }
    if (boardAsString.match(/(?:^|[^2])2{5}(?!2)/)) {
        return 2;
    }
    return 0;
}
function setStatsAfterWin(game, id) {
    let opponentStats = game.turn === 1 ? game.player2.stats : game.player1.stats;
    const opponentUid = game.turn === 1 ? game.player2.uid : game.player1.uid;
    let winnerStats = game.turn === 1 ? game.player1.stats : game.player2.stats;
    const winnerUid = game.turn === 1 ? game.player1.uid : game.player2.uid;
    winnerStats = getWinnerNewStats(winnerStats, opponentStats);
    opponentStats = getOpponentNewStats(opponentStats);
    return updateStats(game, id, winnerStats, winnerUid, opponentStats, opponentUid);
}
function setStatsBeforeQuit(playerNumber, game, id) {
    let opponentStats = playerNumber === 1 ? game.player1.stats : game.player2.stats;
    const opponentUid = playerNumber === 1 ? game.player1.uid : game.player2.uid;
    let winnerStats = playerNumber === 1 ? game.player2.stats : game.player1.stats;
    const winnerUid = playerNumber === 1 ? game.player2.uid : game.player1.uid;
    winnerStats = getWinnerNewStats(winnerStats, opponentStats);
    opponentStats = getOpponentNewStats(opponentStats);
    return updateStatsBeforeQuit(playerNumber, game, id, winnerStats, winnerUid, opponentStats, opponentUid);
}
function getWinnerNewStats(winnerStats, opponentStats) {
    if (!winnerStats) {
        return null;
    }
    else {
        if (!opponentStats || opponentStats.rank === 0) {
            winnerStats.rank += 1;
        }
        else {
            winnerStats.rank += Math.ceil(opponentStats.rank / 10);
        }
        winnerStats.played++;
        winnerStats.wins++;
        return winnerStats;
    }
}
function getOpponentNewStats(opponentStats) {
    if (!opponentStats) {
        return null;
    }
    else {
        opponentStats.played++;
        opponentStats.losses++;
        return opponentStats;
    }
}
function updateStats(game, id, winnerStats, winnerUid, opponentStats, opponentUid) {
    return updatePlayerStats(winnerStats, winnerUid)
        .then(() => {
        return updatePlayerStats(opponentStats, opponentUid)
            .then(() => {
            return updateStatsInGame(game, id, winnerStats, opponentStats);
        });
    });
}
function updateStatsBeforeQuit(playerNumber, game, id, winnerStats, winnerUid, opponentStats, opponentUid) {
    return updatePlayerStats(winnerStats, winnerUid)
        .then(() => {
        return updatePlayerStats(opponentStats, opponentUid)
            .then(() => {
            return updateStatsInGameAfterQuit(playerNumber, game, id, winnerStats, opponentStats);
        });
    });
}
function updatePlayerStats(playerStats, playerUid) {
    return admin.database().ref('rankings/' + playerUid).update({
        rank: playerStats ? playerStats.rank : null,
        played: playerStats ? playerStats.played : null,
        wins: playerStats ? playerStats.wins : null,
        losses: playerStats ? playerStats.losses : null,
    });
}
function updateStatsInGame(game, id, winnerStats, opponentStats) {
    if (game.turn === 1) {
        return updatePlayerStatsInGame(game, id, winnerStats, opponentStats);
    }
    else {
        return updatePlayerStatsInGame(game, id, opponentStats, winnerStats);
    }
}
function updateStatsInGameAfterQuit(playerNumber, game, id, winnerStats, opponentStats) {
    if (playerNumber === 2) {
        return updatePlayerStatsInGame(game, id, winnerStats, opponentStats);
    }
    else {
        return updatePlayerStatsInGame(game, id, opponentStats, winnerStats);
    }
}
function updatePlayerStatsInGame(game, id, player1Stats, player2Stats) {
    return admin.database().ref('/games/' + id).update({
        player1: {
            displayName: game.player1.displayName,
            photoURL: game.player1.photoURL,
            uid: game.player1.uid,
            player: 1,
            stats: player1Stats
        },
        player2: {
            displayName: game.player2.displayName,
            photoURL: game.player2.photoURL,
            uid: game.player2.uid,
            player: 2,
            stats: player2Stats
        }
    });
}
//# sourceMappingURL=index.js.map