function formSubmit(e) {
  var submitVals = []
  const values = e.values;
  const submit = values[0].split('/')[2].split(' ').slice(1, 2);
  submitVals.push(values[0].replace(' '+submit, ''));
  values.slice(1).map(function (str) {submitVals.push(str)});
  const postdata = {
    "method": "post",
    "headers": {
      "contentType": "application/json"
    },
    "payload": {
      "user": submitVals[1],
      "map": submitVals[4],
      "season": "season3",
      "mode": submitVals[5],
      "time": submitVals[2],
      "link": submitVals[3],
      "date": submitVals[0]
    }
  };
  UrlFetchApp.fetch('https://discord-lsl.herokuapp.com/submit?auth=YouShallNotPass', postdata);
}

function rowDelete(e) {
  if (e.changeType !== "REMOVE_ROW") return;
  UrlFetchApp.fetch('https://discord-lsl.herokuapp.com/delete?auth=YouShallNotPass');
}
