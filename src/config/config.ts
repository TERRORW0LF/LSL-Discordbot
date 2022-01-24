export const discordToken: string = (process.env.DISCORD_TOKEN as string),
    clientId: string  = (process.env.DISCORD_APPLICATION_ID as string),
    googleKey: string = (process.env.GOOGLE_TOKEN as string).replace(/\\n/gm, '\n'), 
    googleEmail: string = (process.env.GOOGLE_EMAIL as string), 
    port: Number = parseInt(process.env.PORT as string);