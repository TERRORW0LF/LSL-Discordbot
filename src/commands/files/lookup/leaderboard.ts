import { CommandInteraction, Formatters } from "discord.js";
import { getDesiredOptionLength, getOptions, selectShowcase, SelectShowcaseOption } from "../../../util/userInput.js";
import { getAllSubmits } from "../../../util/sheets.js";
import { addPlaceAndPoints } from "../../../util/runs.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const patch = interaction.options.getString('patch', false) ?? '1.50';
    const season = interaction.options.getString('season', true);
    const category = interaction.options.getString('category', true);
    let map = interaction.options.getString('map',true);

    const submitsPromise = getAllSubmits(interaction.guildId, { patch, season });

    const mapOptions = getOptions(map, guildCfg.maps),
          selectData = mapOptions.map(value => { return { label: value } });
    
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];

    const runs = await submitsPromise;
    const filteredRuns = runs.filter(run => run.patch === patch
        && run.season === season
        && run.category === category
        && run.map === map);
    const runsWithPlaceAndPoints = addPlaceAndPoints(filteredRuns);
    const showcaseRuns: SelectShowcaseOption[] = runsWithPlaceAndPoints.map(run => {
        return {
            dense: {
                place: `${run.place}`,
                user: run.username,
                time: run.time.toFixed(2),
                proof: Formatters.hyperlink('link', run.proof)
            },
            verbose: {
                description: {
                    Place: `${run.place}`,
                    User: run.username,
                    Time: run.time.toFixed(2),
                    Points: `${run.points}`,
                    Date: Formatters.time(run.date),
                    Proof: Formatters.hyperlink('link', run.proof),
                },
                footer: {
                    ID: `${run.submitId}`
                },
                link: run.proof
            }
        };
    });
    await defer;
    selectShowcase(interaction, showcaseRuns);
}