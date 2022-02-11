import guildsCfg from '../../config/guildConfig.json';
import { roleUpdates } from "../../util/roleUpdate";
import { getAllSubmits, getJsDateFromSerialNumber, getMembersWithPoints, Run } from "../../util/sheets";
import { sendPb, sendSubmit, sendWr } from "../../util/automatedMessages";
import { Client } from "discord.js";
import { NextFunction, Request, Response } from "express";

export default async (client: Client<true>, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!client.isReady()) res.sendStatus(500);
    const announceCfg = (guildsCfg as any)[req.body.id]?.features?.announce;
    const membersWithPoints = await getMembersWithPoints(req.body.id, { patch: req.body.patch, season: req.body.season});
    res.sendStatus(200);
    roleUpdates(await client.guilds.fetch(req.body.id), parseInt(req.body.season), membersWithPoints);
    //TODO: World record check and sending.
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
        sendSubmit(client, req.body.id, submit);
    if (announceCfg?.pb?.enabled || announceCfg?.wr?.enabled) {
        const mapSubmits = (await getAllSubmits(req.body.id, { patch: req.body.patch, season: req.body.season })).filter(run => run.category == req.body.category && run.map == req.body.map);
        mapSubmits.sort((run1, run2) => {
            const diff = run1.time - run2.time;
            return diff ? diff : run1.date.getTime() - run2.date.getTime();
        });
        const wr = mapSubmits[1];
        const pb = mapSubmits.filter(run => run.username == req.body.name)[1];
        if (announceCfg?.pb?.enabled && pb && pb.time - submit.time > 0) {
            sendPb(client, req.body.id, submit, pb);
        }
        if (announceCfg?.wr?.enabled && wr && wr.time - submit.time > 0) {
            sendWr(client, req.body.id, submit, wr);
        }
    }
}