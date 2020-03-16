const axios = require('axios')

const dat = new Date();
const day = `${dat.getMonth()+1}/${dat.getDate()}/${dat.getFullYear()}`;
axios({
  url: 'http://localhost:1337/submit',
  method: 'post',
  data: {
    user: "LSL-Ranking-bot#9630",
    map: "Oasis Gardens",
    season: "season3",
    mode: "Standard",
    time: "10.21",
    link: "https://www.google.com/search?client=firefox-b-d&q=run+node+script",
    date: day
  } // your test data
})
.then(response => {
  console.log('success', response.status)
})
.catch(err => {
  console.error('failed', err.message)
})
