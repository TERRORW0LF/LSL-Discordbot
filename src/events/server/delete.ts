import guildsCfg from '../../config/guildConfig.json';
import { roleUpdates } from "../../util/roleUpdate";
import { getMembersWithPoints } from "../../util/sheets";
import { Client } from "discord.js";
import { NextFunction, Request, Response } from "express"
import { sendDelete } from '../../util/automatedMessages';

export default async (client: Client, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!client.isReady()) res.sendStatus(500);
    res.sendStatus(200);
    const guildCfg = (guildsCfg as any)[req.body.guildId];
    roleUpdates(await client.guilds.fetch(req.body.guildId), req.body.season, await getMembersWithPoints(req.body.guildId, { patch: req.body.patch, season: req.body.season }));
    if (guildCfg?.features?.announce?.delete?.enabled) {
        // If I ever get the deleted data then this will be possible.
        // sendDelete()
    }
}