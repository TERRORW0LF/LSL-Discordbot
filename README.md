# LSL-discordbot

## Notice
This is a discord bot specifically written for the Lucio Surf League discord. 
The code in this project will most likely not be usefull for anything else.

## Implemented:
- Commands:
  - `!help` sends an overview of the available commands.
  - `!help [command]` sends a detailed information about the given command.
  - `!version` sends the current version of the bot.
  - `!incomplete` sends all completed and incompleted maps.
  - `!rank` sends the current rank of the user on the given season, mode, or map.
  - `!submit` submits a run to the google Form corresponding to the given season.
  - `!delete` deletes a run from the google Spreadsheet corresponding to the given season.
  - `!wr` sends the current wr corresponding to the given parameters.
  - `!pb` sends the current pb corresponding to the given parameters.

- Updates:
  - Bot automatically sends updates when a new run is submitted (either through `!submit`, or the google Forms).
  - Bot automatically sends a seperate, more detailed, update when the submitted run is a new word record.

- Caching:
  - Bot caches world records for `!wr`, so spreadsheet requests are kept to a minimum.
  - Bot caches personal bests for `!pb`, so spreadsheet requests are kept to a minimun.
  - Bot caches personal bests for `!incomplete`, so spreadsheet requests are kept to a minimun.
  - Bot caches personal bests for `!rank`, so spreadsheet requests are kept to a minimun.


## Todo:
- Update bot to work with `discord.js v12` and higher (Not gonna happen anytime soon. To many changes).
- Change `onChange` event to `onEdit` in the google sheet, to get the deleted data.
  - Change `setCache` to `updateCache` in `newDelete` and `newDeleteDiscord`.
  - Send a message when a run gets deleted.
- Redo `!delete` so a user can pick from the last 5 runs submitted for the given map.
- Check for new runs on startup. (Add an announced column in Record Log modified).
- Unify embeds even more, so the bot has an even clearer structure.


## Warning:
- This is my first time using JavaScript, so the code in here is not optimal in any way or form.
- When a user deletes a message that is still getting processed the bot will throw an error.
- if 2 or more players achieved the same time on a map `!rank` will return inconsistant ranks for these players on this map.
- Runs (and world records) that get submitted while the bot is down or can't recive the submit data will not be annouced at any time in the future.
