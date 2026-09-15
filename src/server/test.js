import childProcess from "child_process";

childProcess.spawn(properties['style-transfer-presenter-executable'],
    styleTransferPresenterCommandOptions, {cwd: styleTransferPresenterCommandDirectory, shell: true});