import { roleUpdates } from "../../util/roleUpdate";
import { Client } from "discord.js";
import { NextFunction, Request, Response } from "express";
import { getJsDateFromSerialNumber, getMembersWithPoints } from "../../util/sheets";
import { sendSubmit } from "../../util/automatedMessages";

export default async (client: Client, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!client.isReady()) res.sendStatus(500);
    const membersWithPoints = await getMembersWithPoints(req.body.guildId, { patch: req.body.patch, season: req.body.season});
    res.sendStatus(200);
    roleUpdates(req.body.guildId, parseInt(req.body.season), membersWithPoints);
    sendSubmit(client, req.body.guildId, {
        date: getJsDateFromSerialNumber(parseFloat(req.body.date)),
        patch: req.body.patch, 
        season: req.body.season, 
        category: req.body.category, 
        map: req.body.map, 
        submitId: req.body.submitId, 
        username: req.body.name, 
        time: req.body.time,
        proof: req.body.proof
    });
}