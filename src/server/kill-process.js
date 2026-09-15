const childProcess = require('child_process'),
    os = require('os');

function killProcess(process) {
    if (process != null) {
        if (os.platform() === 'win32') {
            childProcess.exec('taskkill /pid ' + process.pid + ' /T /F');
        } else if (os.platform() === 'darwin')  {
            process.kill('SIGINT');
        } else {
            process.kill('SIGKILL');
            //TODO: Unfuck this after BTD
            childProcess.exec('killall python')
        }

        process = null;
    }
}

module.exports = killProcess;
