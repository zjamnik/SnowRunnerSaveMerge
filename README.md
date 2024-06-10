# SnowRunnerSaveMerge
Tool for SnowRunner to enable progress sync from you co-op host.

## Requirements
Written in Node v 22.2.0 for Windows

Need to provide 7z.exe in the same directory as script for compression

## Usage
This script will overwrite most of your save file, it's best to only use this with a save file dedicated to co-op play, with a consistent host!<br>
Your save file must be on the same slot in game as the host!

### Installation
1. Download the saveMerge.js file or clone the repo.
1. Run the script once to create template config file
1. Fill your config according to instructions inside
1. Make sure your load location and backup location exist
1. Copy 7z.exe to the repo directory

### Running the script
It's best to run the script directly after ending your game session. To prevent accidental merges with old files if hosts save was uploaded more than 1 hour ago the script will not automatically download and merge it. If you're sure that the file is correct, download it manually and extract the files in you load location `remote` directory then run just `merge` operation

#### Host
1. Get all your vehicles inside a garage, best to retain them
1. Leave all newly acquired trucks, that the guest doesn't have, outside on the map
1. Exit the game
1. Run the script with `upload` operation `node .\saveMerge.js upload`

#### Guest
1. Get all your vehicles inside a garage, best to retain them
1. Exit the game
1. Run the script with `download` and `merge` operations `node .\saveMerge.js download,merge` additionally provide save slot if different than first
1. Restart Steam for safety. Sometimes the game behaves funny if steam is not restarted after save manipulation

#### Things that will be overwritten
- Map files
- Visited maps
- Watch towers
- Upgrades
- Tasks
- Contracts
- Objective states (half completed tasks etc.)
- Game settings (hard mode, recover and fuel costs etc.)
- Waypoints, not sure if it matters, but the game creates new array elements for them only on host side. You have to redo your route when joining anyway.

#### Things that are preserved
- Trucks (customizations, addons etc.)
- Money
- Exp

#### Auto save backup
1. Run the script with `backup` operation `node .\saveMerge.js backup`, save slot doesn't matter in this case. Whole save is backed up so it still might useful in single player game
1. The script will enter an endless loop that will backup you saves every set interval, default 10 minutes
1. Do not exit the script while files are copying, there is a message displayed when it's safe to kill the script

### Script help as shown when used with unknown operation

    saveMerge [operations=download,merge] [save_slot=1]

        operations - comma separated list of operations, from these: download, merge, upload, backup
            download - download save from file.io, this will delete contents of loadLocation
            merge - merge the save from loadLocation
            upload - pack the current save and upload to filebin.net
            backup - will auto backup save file on set interval
        save_slot - which slot to merge, values 1 to 4 are accepted, need to play on the same slot as host