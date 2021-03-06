function formSubmit(e) {
  var submitVals = []
  const values = e.values;
  const submit = values[0].split('/')[2].split(' ').slice(1, 2);
  submitVals.push(values[0].replace(' '+submit, ''));
  values.slice(1).map(function (str) {submitVals.push(str)});
  const msg = {
      "user": submitVals[1],
      "map": submitVals[4],
      "season": "season1",
      "mode": submitVals[5],
      "time": submitVals[2],
      "link": submitVals[3],
      "date": submitVals[0]
    };
  const postdata = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(msg),
    "muteHttpExceptions": true
  }
  UrlFetchApp.fetch('https://discord-lsl.herokuapp.com/submit?auth=YouShallNotPass', postdata);
  UrlFetchApp.fetch('https://lsl-discordbot.herokuapp.com/submit?auth=YouShallNotPass', postdata);
}

function rowDelete(e) {
  if (e.changeType !== "REMOVE_ROW") return;
  const postdata = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify({"season": "season1"}),
    "muteHttpExceptions": true
  }
  UrlFetchApp.fetch('https://discord-lsl.herokuapp.com/delete?auth=YouShallNotPass', postdata);
  UrlFetchApp.fetch('https://lsl-discordbot.herokuapp.com/delete?auth=YouShallNotPass', postdata);
}
