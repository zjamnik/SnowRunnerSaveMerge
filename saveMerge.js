const fs = require('node:fs/promises');
const fssync = require('node:fs');
const exec = require("child_process").execSync;

var CONFIG = null;

const configTemplate = {
    "info": "This script will overwrite most of your save file, it's best to only use this with a save file dedicated to co-op play, with a consistent host!",
    "saveLocation": "C:/Program Files (x86)/Steam/userdata/<your_steam_id>/1465360",
    "loadLocation": "./save",
    "backupLocation": "./backups",
    "backupInterval": "10",
    "filebinURL": "get your bin at https://filebin.net, a file named 'SnowRunnerSaveMerge' needs to be uploaded to check if we have a correct bin"
};

async function loadConfig() {
    let configFilePath = "./config.json";
    let configFile;

    if (!fssync.existsSync(configFilePath)) {
        await fs.writeFile(configFilePath, JSON.stringify(configTemplate, null, 4), "utf8");
        console.log("No config file detected, writing template config, please fill it out!");
        await sleep(5);
        throw (new Error("No config file detected, writing template config, please fill it out!"));
    }

    configFile = await fs.readFile(configFilePath);
    let conf = JSON.parse(configFile);

    if (conf.saveLocation.startsWith(".")) {
        conf.saveLocation = conf.saveLocation.replace(".", __dirname);
    }

    if (conf.loadLocation.startsWith(".")) {
        conf.loadLocation = conf.loadLocation.replace(".", __dirname);
    }

    if (conf.backupLocation.startsWith(".")) {
        conf.backupLocation = conf.backupLocation.replace(".", __dirname);
    }

    if (!fssync.existsSync(conf.saveLocation + "/remote")) {
        console.log("Save location doesn't exist, please correct you config!");
        await sleep(5);
        throw (new Error("Save location doesn't exist, please correct you config!"));
    }

    if (!fssync.existsSync(conf.loadLocation)) {
        console.log("Load location doesn't exist, please correct you config!");
        await sleep(5);
        throw (new Error("Load location doesn't exist, please correct you config!"));
    }

    if (!fssync.existsSync(conf.backupLocation)) {
        console.log("Backup location doesn't exist, please correct you config!");
        await sleep(5);
        throw (new Error("Backup location doesn't exist, please correct you config!"));
    }

    let checkBin = await fetch(conf.filebinURL + "/SnowRunnerSaveMerge");
    if (await checkBin.text() == "The file does not exist.") {
        console.log("FileBin not found, please check the config or create a new one!");
        await sleep(5);
        throw (new Error("FileBin not found, please check the config or create a new one!"));
    }

    CONFIG = conf;

    // throw (new Error("STOP AT CONFIG LOAD!!!!!!!!!!!!!!"));
}

function mergeSave(src, dest) {
    dest.CompleteSave.SslValue.discoveredObjectives = src.CompleteSave.SslValue.discoveredObjectives;
    dest.CompleteSave.SslValue.discoveredObjects = src.CompleteSave.SslValue.discoveredObjects;
    dest.CompleteSave.SslValue.finishedObjs = src.CompleteSave.SslValue.finishedObjs;
    dest.CompleteSave.SslValue.forcedModelStates = src.CompleteSave.SslValue.forcedModelStates;
    dest.CompleteSave.SslValue.gameDifficultyMode = src.CompleteSave.SslValue.gameDifficultyMode;
    dest.CompleteSave.SslValue.gameDifficultySettings = src.CompleteSave.SslValue.gameDifficultySettings;
    dest.CompleteSave.SslValue.isHardMode = src.CompleteSave.SslValue.isHardMode;
    dest.CompleteSave.SslValue.justDiscoveredObjects = src.CompleteSave.SslValue.justDiscoveredObjects;
    dest.CompleteSave.SslValue.levelGarageStatuses = src.CompleteSave.SslValue.levelGarageStatuses;
    dest.CompleteSave.SslValue.modTruckOnLevels = src.CompleteSave.SslValue.modTruckOnLevels;
    dest.CompleteSave.SslValue.modTruckRefundValues = src.CompleteSave.SslValue.modTruckRefundValues;
    dest.CompleteSave.SslValue.modTruckTypesRefundValues = src.CompleteSave.SslValue.modTruckTypesRefundValues;
    dest.CompleteSave.SslValue.objectiveStates = src.CompleteSave.SslValue.objectiveStates;
    dest.CompleteSave.SslValue.objectivesValidated = src.CompleteSave.SslValue.objectivesValidated;
    dest.CompleteSave.SslValue.objVersion = src.CompleteSave.SslValue.objVersion;
    dest.CompleteSave.SslValue.persistentProfileData.discoveredTrucks = src.CompleteSave.SslValue.persistentProfileData.discoveredTrucks;
    dest.CompleteSave.SslValue.persistentProfileData.discoveredUpgrades = src.CompleteSave.SslValue.persistentProfileData.discoveredUpgrades;
    dest.CompleteSave.SslValue.persistentProfileData.savedCargoNeedToBeRemovedOnRestart = src.CompleteSave.SslValue.persistentProfileData.savedCargoNeedToBeRemovedOnRestart;
    dest.CompleteSave.SslValue.persistentProfileData.newTrucks = src.CompleteSave.SslValue.persistentProfileData.newTrucks;
    // dest.SslValue.persistentProfileData.ownedTrucks = src.SslValue.persistentProfileData.ownedTrucks; // no idea if important, a pain in the A to merge
    // dest.SslValue.persistentProfileData. = src.SslValue.persistentProfileData.;
    dest.CompleteSave.SslValue.upgradableGarages = src.CompleteSave.SslValue.upgradableGarages;
    dest.CompleteSave.SslValue.viewedUnactivatedObjectives = src.CompleteSave.SslValue.viewedUnactivatedObjectives;
    dest.CompleteSave.SslValue.visitedLevels = src.CompleteSave.SslValue.visitedLevels;
    dest.CompleteSave.SslValue.watchPointsData = src.CompleteSave.SslValue.watchPointsData;
    dest.CompleteSave.SslValue.waypoints = src.CompleteSave.SslValue.waypoints;
    // dest.SslValue. = src.SslValue.;

    return dest;
}

async function backupSave(backupName) {
    await fs.cp(CONFIG.saveLocation + "/remote", CONFIG.backupLocation + "/" + backupName, { recursive: true });
}

function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function main(args) {
    await loadConfig();

    // Backup current save
    let dateTime = new Date();
    let backupName = `remote_${dateTime.getFullYear()}-${(dateTime.getMonth() + 1).toString().padStart(2, "0")}-${dateTime.getDate().toString().padStart(2, "0")}_${dateTime.getHours().toString().padStart(2, "0")}-${dateTime.getMinutes().toString().padStart(2, "0")}-${dateTime.getSeconds().toString().padStart(2, "0")}`;
    await backupSave(backupName);

    // Default parameter values
    let operations = ["backup"];
    let slotNumber = "";
    let slotNumberMap = "";

    // Process parameters
    if (args.length > 2) {
        operations = args[2].replaceAll(" ", "").split(",");
    }

    if (args.length > 3) {
        if (args[3] >= 1 && args[3] <= 4) {
            slotNumber = args[3] - 1;
            slotNumberMap = args[3] - 1 + "_";
        } else {
            console.log("Incorrect slot number! Values 1 to 4 are accepted!");
            await sleep(5);
            throw (new Error("Incorrect slot number! Values 1 to 4 are accepted!"));
        }
    }

    // Process operations
    for (let operation of operations) {
        switch (operation) {
            case "download":
                // Get the list of files in this bin
                let down = await fetch(CONFIG.filebinURL, { "headers": { "accept": "application/json" } });
                let binFileList = JSON.parse(await down.text());

                // Find the most recently uploaded save file
                let mostRecentUpload;
                let mostRecentUploadTime = 0;
                for (let file of binFileList.files) {
                    if (file.filename.startsWith("remote")) {
                        let createdDate = Date.parse(file.created_at).valueOf();
                        if (createdDate > mostRecentUploadTime) {
                            mostRecentUpload = file;
                            mostRecentUploadTime = createdDate;
                        }
                    }
                }

                // Check if the file isn't to old to download, if older that 1 hour it might not be suitable for the merge
                if (Date.now() - mostRecentUploadTime > 60 * 60 * 1000) {
                    console.log("Save file too old, aborting! To force merge download the file manually and run the script using merge parameter!");
                    await sleep(5);
                    throw (new Error("Save file too old, aborting! To force merge download the file manually and run the script using merge parameter!"));
                }

                // Download the selected file
                downloaded = await fetch(CONFIG.filebinURL + "/" + mostRecentUpload.filename, { "headers": { "cookie": "verified=2024-05-24" } });
                await fs.writeFile(__dirname + "\\" + mostRecentUpload.filename, downloaded.body);

                // Remove current save from loadLocation
                await fs.rm(CONFIG.loadLocation + "/remote", { recursive: true });
                await fs.mkdir(CONFIG.loadLocation + "/remote");

                // Unzip downloaded file
                exec(`${__dirname}\\7z.exe x ${__dirname}\\${mostRecentUpload.filename} "-o${__dirname}\\save\\remote"`);

                // Remove the downloaded file
                await fs.rm(`${__dirname}\\${mostRecentUpload.filename}`);
                break;

            case "merge":
                // Merge save files
                let srcSaveData = await fs.readFile(CONFIG.loadLocation + "/remote/CompleteSave" + slotNumber + ".cfg", { encoding: "utf8" });
                let srcSaveDataJSON = JSON.parse(srcSaveData.slice(0, -1));

                let destSaveData = await fs.readFile(CONFIG.saveLocation + "/remote/CompleteSave" + slotNumber + ".cfg", { encoding: "utf8" });
                let destSaveDataJSON = JSON.parse(destSaveData.slice(0, -1));

                let saveDataJSON = mergeSave(srcSaveDataJSON, destSaveDataJSON);

                await fs.writeFile(CONFIG.saveLocation + "/remote/CompleteSave" + slotNumber + ".cfg", JSON.stringify(saveDataJSON) + "\0"); // Write modified save file

                // Copy and overwrite map files
                let loadDir = await fs.readdir(CONFIG.loadLocation + "/remote");
                for (let file of loadDir) {
                    if (file.startsWith(slotNumberMap + "sts") || file.startsWith(slotNumberMap + "fog")) {
                        try {
                            await fs.copyFile(CONFIG.loadLocation + "/remote/" + file, CONFIG.saveLocation + "/remote/" + file);
                        } catch (err) {
                            console.log("Error copying map files, merge incomplete, restoring from backup is advised!");
                            await sleep(5);
                            throw (err);
                        }
                    }
                }
                break;

            case "upload":
                // Create 7z archive from latest backup
                let archivePath = `${__dirname}\\${backupName}.7z`;
                exec(`${__dirname}\\7z.exe a ${archivePath} ${__dirname}\\backups\\${backupName}\\*`);

                // Upload the file to filebin
                fileInput = await fs.readFile(archivePath);
                await fetch(CONFIG.filebinURL + "/" + backupName + ".7z", {
                    body: fileInput,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/octet-stream"
                    },
                    method: "POST"
                });

                // Remove the archive
                await fs.rm(archivePath);
                break;

            case "backup":
                // Auto backcup will loop forever and create a backup of you save files every set interval
                while (true) {
                    console.log("Waiting for next backup, you can stop the script using Ctrl+C!");
                    await sleep(CONFIG.backupInterval * 60);
                    console.log("Performing backup, wait before terminating the program!");
                    await backupSave();
                }
                break;

            default:
                console.log("\
Unknown parameter!\n\
    saveMerge [operations=download,merge] [save_slot=1]\n\
\n\
        operations - comma separated list of operations, from these: download, merge, upload, backup\n\
            download - download save from file.io, this will delete contents of loadLocation\n\
            merge - merge the save from loadLocation\n\
            upload - pack the current save and upload to filebin.net\n\
            backup - will auto backup save file on set interval\n\
        save_slot - which slot to merge, values 1 to 4 are accepted, need to play on the same slot as host");
                return;
        }
    }
}

main(process.argv);