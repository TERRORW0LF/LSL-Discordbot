import guildsCfg from '../../config/guildConfig.json';
import { roleUpdates } from "../../util/roleUpdate";
import { getAllSubmits, getJsDateFromSerialNumber, getMembersWithPoints, Run } from "../../util/sheets";
import { sendPb, sendSubmit, sendWr } from "../../util/automatedMessages";
import { Client } from "discord.js";
import { NextFunction, Request, Response } from "express";
import { herokuAuth } from '../../config/config';

export default async (client: Client<true>, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.query.auth !== herokuAuth) res.sendStatus(403);
    if (!client.isReady()) res.sendStatus(500);
    res.sendStatus(200);
    const announceCfg = (guildsCfg as any)[req.body.guildId]?.features?.announce;
    const membersWithPoints = await getMembersWithPoints(req.body.guildId, { patch: req.body.patch, season: req.body.season});
    roleUpdates(await client.guilds.fetch(req.body.guildId), req.body.season, membersWithPoints);
    const submit: Run = {
        date: getJsDateFromSerialNumber(parseFloat(req.body.date)),
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
        const mapSubmits = (await getAllSubmits(req.body.guildId, { patch: req.body.patch, season: req.body.season })).filter(run => run.category == req.body.category && run.map == req.body.map);
        mapSubmits.sort((run1, run2) => {
            const diff = run1.time - run2.time;
            return diff ? diff : run1.date.getTime() - run2.date.getTime();
        });
        const wr = mapSubmits[1];
        const pb = mapSubmits.filter(run => run.username == req.body.name)[1];
        if (announceCfg?.pb?.enabled && pb && pb.time - submit.time > 0) {
            sendPb(client, req.body.guildId, submit, pb);
        }
        if (announceCfg?.wr?.enabled && wr && wr.time - submit.time > 0) {
            sendWr(client, req.body.guildId, submit, wr);
        }
    }
}