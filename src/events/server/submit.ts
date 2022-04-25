import { roleUpdates } from "../../util/roleUpdate.js";
import { getAllSubmits, getMembersWithPoints, Run } from "../../util/sheets.js";
import { sendPb, sendSubmit, sendWr } from "../../util/automatedMessages.js";
import { Client } from "discord.js";
import { NextFunction, Request, Response } from "express";
import { herokuAuth } from '../../config/config.js';
import guildsCfg from '../../config/guildConfig.json' assert { type: 'json' };
import { sortRuns } from "../../util/runs.js";

export default async (client: Client<true>, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.query.auth !== herokuAuth) res.sendStatus(403);
    if (!client.isReady()) res.sendStatus(500);
    res.sendStatus(200);
    const announceCfg = (guildsCfg as any)[req.body.guildId]?.features?.announce;
    const membersWithPoints = await getMembersWithPoints(req.body.guildId, { patch: req.body.patch, season: req.body.season});
    roleUpdates(await client.guilds.fetch(req.body.guildId), req.body.season, membersWithPoints);
    const submit: Run = {
        date: new Date(req.body.date),
        patch: req.body.patch, 
        season: req.body.season, 
        category: req.body.category, 
        map: req.body.map, 
        submitId: req.body.submitId, 
        username: req.body.name, 
        time: req.body.time,
        proof: req.body.proof
    }
    if (announceCfg?.submit?.enabled)
        sendSubmit(client, req.body.guildId, submit);
    if (announceCfg?.pb?.enabled || announceCfg?.wr?.enabled) {
        const mapSubmits = (await getAllSubmits(req.body.guildId, { patch: submit.patch, season: submit.season })).filter(run => run.category === submit.category && run.map === submit.map && run.submitId !== submit.submitId);
        sortRuns(mapSubmits);
        const wr = mapSubmits[0] ?? null;
        const pb = mapSubmits.filter(run => run.username == req.body.name)[0] ?? null;
        if (announceCfg?.pb?.enabled && (!pb || pb.time - submit.time > 0)) {
            sendPb(client, req.body.guildId, pb, submit);
        }
        if (announceCfg?.wr?.enabled && (!wr || wr.time - submit.time > 0)) {
            sendWr(client, req.body.guildId, wr, submit);
        }
    }
}