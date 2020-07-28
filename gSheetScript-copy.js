function formSubmit(e) {
  var submitVals = []
  const values = e.values;
  values.map(function (str) {submitVals.push(str)});
  const msg = {
    "name": submitVals[1],
    "stage": submitVals[4],
    "season": "1",
    "category": submitVals[5],
    "time": submitVals[2],
    "proof": submitVals[3],
    "date": submitVals[0],
    "id": "574522788967088128"
  };
  const postdata = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(msg),
    "muteHttpExceptions": true
  }
  UrlFetchApp.fetch('https://discord-lsl.herokuapp.com/submit?auth=YouShallNotPass', postdata);
}

function rowDelete(e) {
  if (e.changeType !== "REMOVE_ROW") return;
  const postdata = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify({"season": "1", "id": "574522788967088128"}),
    "muteHttpExceptions": true
  }
  UrlFetchApp.fetch('https://discord-lsl.herokuapp.com/delete?auth=YouShallNotPass', postdata);
}