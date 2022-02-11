import guildsCfg from '../../config/guildConfig.json';
import { roleUpdates } from "../../util/roleUpdate";
import { getMembersWithPoints } from "../../util/sheets";
import { Client } from "discord.js";
import { NextFunction, Request, Response } from "express"
import { sendDelete } from '../../util/automatedMessages';

export default async (client: Client, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!client.isReady()) res.sendStatus(500);
    const guildCfg = (guildsCfg as any)[req.body.id];
    res.sendStatus(200);
    roleUpdates(await client.guilds.fetch(req.body.id), req.body.season, await getMembersWithPoints(req.body.id, { patch: req.body.patch, season: req.body.season }));
    if (guildCfg?.features?.announce?.delete?.enabled) {
        // If I ever get the deleted data then this will be possible.
        // sendDelete()
    }
}