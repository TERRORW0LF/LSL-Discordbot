import { roleUpdates } from "../../util/roleUpdate";
import { Client } from "discord.js";
import { NextFunction, Request, Response } from "express";

export default async (client: Client, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!client.isReady()) res.sendStatus(500);
}