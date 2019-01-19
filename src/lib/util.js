import request from 'request';
/**
 * get the date of next wednesday
 */
export const nextWed = () => {
  const d = new Date();
  d.setDate(d.getDate() + (3 + 7 - d.getDay()) % 7);
  d.setHours(0,0,0,0);
  return d;
}

/**
 * get the index of the next team member
 * @param  {Obj} data data from db
 */
export const nextIndex = (data) => {
  const teamSize = data.team.length;
  return data.lastIndex >= teamSize - 1 ? 0 : data.lastIndex + 1;
}

/**
 * return a string randomly from an array
 * @param  {array} stringArray
 */
export const randomMsg = (stringArray) => {
  const length = stringArray.length;
  const randomIndex = Math.floor(Math.random() * (length));
  return stringArray[randomIndex];
}

/**
 * post message to the a slack channel
 * @param  {str} msg message to be posted
 * @param  {str} channel channel id
 */
export const postMessage = (msg, channel) => {
  request({
    method: 'POST',
    uri: 'https://slack.com/api/chat.postMessage',
    headers: {
      'content-type': 'application/json',
      Authorization: process.env.SLACKTOKEN,
    },
    body: JSON.stringify({
      text: msg,
      channel,
      as_user: true,
    })
  }, (err, res, body) => {
    if (err) {
      console.log('error posting msg: ', err);
    } else {
      console.log('post message to channel: ', body);
    }
  })
}
