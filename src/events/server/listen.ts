import axios from "axios";
import { port } from "../../config/config";

export default () => {
    console.log(`Listening on port ${port}`);
    setInterval(() => {
        axios.get('https://lsl-discordbot-v12.herokuapp.com/ping').catch(err => { return });
        axios.get('https://discord-lsl.herokuapp.com/ping').catch(err => { return });
    }, 600000);
}