# LSL-discordbot

## Notice
This bot is written specifically for the Lucio Surf League discord server. It is planned to make this bot accessible to any kind of speedrunning server in the future.
If you want to help progress the bot developement, send me ideas, constructive critism, or even your own modules/code.

## Commands
### Basic
- `help` sends an overview of the available commands.
- `[group] help` sends an overview of the available commands in the given group.
- `remind me` adds a reminder to notify you in the specified amount of time.
- `reminders` lists all your currently active reminders.

### Fun
- `coin flip` flips a coin.
- `roll` rolls a dice.
- `tictactoe` play tictactoe against another user or the bot.
- `joke` sends a joke.

### Moderation
- `mute` mute a member for specified amount of time or until manually unmuted.
- `unmute` unmute a member.
- `kick` kick a member.
- `ban` ban a member for a specified amount of time or until manually unbanned.
- `unban`unban a user.
- `rr new` create a new reaction role message.
- `rr add` add a reaction role to a reaction role message.

### Lookup
- `wr` sends the current wr corresponding to the given parameters.
- `pb` sends the current pb corresponding to the given parameters.
- `place` sends the run of the specified place/rank.
- `top5` sends the 5 best runs.
- `rank` sends the current rank of the user in the given season or mode.
- `incomplete` sends all completed and incompleted maps.

### Submit
- `submit` submits a run to the google Form corresponding to the given season.
- `delete` deletes a run from the google Spreadsheet corresponding to the given season.

### Tournament (Work in progress)
- `create` create a tournament.
- `sign-in` join a tournament.


## Features
### Submit updates
- Bot sends updates when a new run is submitted.
- Bot sends a comparison when a submitted run is a world record.

### Auto roles
- Bot adds a `streaming` role for users who have `streaming` in their activity.
- Bot adds `auto roles` when a user joins the guild.

### Starboard
- Bot adds message with enough star reaction to a separate starboard channel.
- Bot update star count on starboard messages.
- Bot removes starboard messages if they drop under the required star count.


## In the making
- Moving sheets to our own website.
- Use a database instead of json.
- Update bot to work with our own website.


## Todo
- `role join add/remove` adds/removes a role from the list of roles given to members on guild join.
- Unify and prettify bot messages.
- Fix some embed issues.


## Planned
- `role all/humans/bots` add a specified role to all members/humans/bots.
- `role all status [id]` shows the current progress of all or the specified role `role all`.
- `sweep` sweep messages from a channel.
- `prune` prune members from the guild.
- add member selection to `pb`, `rank` and `incomplete`.


## MOM! There's a bug in my code
- A lot of them. If you find a bug, writing errors, or bad design notify me (Discord: TERRORWOLF#2829).


## Warning
- This is my first time using JavaScript, so the code in here is not optimal in any way or form.
- When a user deletes a message that is still getting processed the bot will throw an error and potentially shut down.
- Runs (and world records) that get submitted while the bot is down or can't recive the submit data will not be announced.
