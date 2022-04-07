import { APIEmbed } from "discord-api-types";
import { CommandInteraction, Formatters, Message, TextBasedChannel } from "discord.js";
import { google } from "googleapis";
import { getGoogleAuth } from "../../../util/sheets.js";
import { modDecision } from "../../../util/userInput.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run(interaction: CommandInteraction<'present'>): Promise<void> {
    const oldTag = interaction.options.getString('tag', true);
    const newTag = interaction.user.tag;
    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;

    const embed: APIEmbed = {
        description: 'Waiting for moderation decision on your name update.',
        color: guildCfg.embeds.waiting
    };
    const message = await interaction.reply({ embeds: [embed], fetchReply: true }) as Message;

    const channel = ((await interaction.guild?.channels.fetch(guildCfg.channels.moderation)) ?? interaction.channel) as TextBasedChannel;

    if (!await modDecision(channel, `**${newTag}** wants to update their name from **${oldTag}**.`, { approvalNumber: 1 })) {
        const errorEmbed: APIEmbed = {
            description: 'Your name update was denied.',
            color: guildCfg.embeds.error
        }
        await Promise.all([
            message.edit({ embeds: [errorEmbed] }),
            message.reply({ content: Formatters.userMention(interaction.user.id), embeds: [errorEmbed] })
        ]);
        return;
    }

    const promiseArr: Promise<void>[] = [];
    const token = await getGoogleAuth();
    const sheets = google.sheets('v4');

    for (const patch of guildCfg.patches) {
        for (const id of Object.values(guildCfg.sheets[patch] as object)) {
            promiseArr.push((async () => {
                const values = (await sheets.spreadsheets.values.get({
                    auth: token,
                    spreadsheetId: id,
                    majorDimension: 'COLUMNS',
                    range: 'Record Log!B2:B'
                })).data.values?.[0];
                if (!values) return;

                for (let i = 0; i < values.length; i++)
                    if (values[i] === oldTag) values[i] = newTag;

                await sheets.spreadsheets.values.update({
                    auth: token,
                    spreadsheetId: id,
                    valueInputOption: 'RAW',
                    range: 'Record Log!B2:B',
                    requestBody: {
                        majorDimension: 'COLUMNS',
                        values: [values]
                    }
                });
            })());
        }
    }
    try {
        await Promise.all(promiseArr);
    } catch (err) {
        const errorEmbed: APIEmbed = {
            description: 'Couldn\'t finish name update, please try again later.',
            color: guildCfg.embeds.error
        };
        await Promise.all([
            message.edit({ embeds: [errorEmbed] }),
            message.reply({ content: Formatters.userMention(interaction.user.id), embeds: [errorEmbed] })
        ]);
        return;
    }
    const successEmbed: APIEmbed = {
        description: 'Your name update has been completed.',
        color: guildCfg.embeds.success
    };
    await Promise.all([
        message.edit({ embeds: [successEmbed] }),
        message.reply({ content: Formatters.userMention(interaction.user.id), embeds: [successEmbed] })
    ]);
}