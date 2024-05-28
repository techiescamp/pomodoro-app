// for dau
let activeUser = new Set();

function storeActiveUsers(req, res, next) {
    if(id) {
        activeUser.add(id);
        console.log(`No.of users visited: ${activeUser.size}`)
    } else {
        res.status(400).send('user ID required')
    }
    const resetActiveUser = () => {
        activeUser = new Set();
        console.log('active user reset')
    }
    const scheduleDailyReset = () => {
        const now = new Date();
        const midnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0, 0, 0, 0
        );
        const timeLeft = midnight - now;
        setTimeout(() => {
            resetActiveUser();
            scheduleDailyReset();
        }, timeLeft)
    }
    scheduleDailyReset();
}

module.exports = storeActiveUsers;