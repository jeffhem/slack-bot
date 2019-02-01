import request from 'request';

const WATSON_ASSISTANT_ID = process.env.WATSON_ASSISTANT_ID;
const WATSON_ASSISTANT_PWD = process.env.WATSON_ASSISTANT_PWD;
const WATSON_ASSISTANT_API = 'https://gateway.watsonplatform.net/assistant/api/v2';

const authToken = Buffer.from(`apikey:${WATSON_ASSISTANT_PWD}`).toString('base64');

const parseResponse = (resp) => {
  let retResponse = resp;
  if (resp !== undefined && typeof resp === 'string') {
    try {
      retResponse = JSON.parse(resp);
    } catch (e) {
      console.error('Error parsing response.', resp);
    }
  }
  return retResponse;
}

const sendMessage = (sessionId, text) => {
  return new Promise((resolve, reject) => {
    console.log("sending message", text);
    const uri = `${WATSON_ASSISTANT_API}/assistants/${WATSON_ASSISTANT_ID}/sessions/${sessionId}/message?version=2018-11-08`;
    request({
      method: 'POST',
      uri,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `basic ${authToken}`
      },
      body: JSON.stringify({
        input: {text}
      }),
    }, (error, response, content) => {
      if(error){
        console.error(error);
        return reject(error);
      }
      const parsedResponse = parseResponse(content);
      let textResponse = "";
      const { output } = parsedResponse;
      const { generic } = output;
      if(generic && generic.length > 0){
        textResponse = generic.map(response => `${response.text}\n`).join("");
      }else{
        textResponse = "I did not get that. Could you try rephrasing?";
      }
      resolve(textResponse);
    });
  });
}

export const message = (text) => {
  let sessionId = null;
  return new Promise((resolve, reject) => {
    createSession().then(response => {
      sessionId = response.session_id;
      console.log('session created', sessionId);
      sendMessage(sessionId, text).then(response => {
        console.log("message from watson", response);
        resolve(response);
        deleteSession(sessionId);
      })
    });
  });
}

export const createSession = () => {
  return new Promise((resolve, reject) => {
    const uri = `${WATSON_ASSISTANT_API}/assistants/${WATSON_ASSISTANT_ID}/sessions?version=2018-11-08`;
    request({
      method: 'POST',
      uri,
      headers: {
        Authorization: `basic ${authToken}`
      },
    }, (error, response, content) => {
      if(error){
        console.error(error);
        return reject(error);
      }
      resolve(parseResponse(content));
    });
  });
}

export const deleteSession = (sessionId) => {
  return new Promise((resolve, reject) => {
    console.log("deleting session", sessionId);
    const uri = `${WATSON_ASSISTANT_API}/assistants/${WATSON_ASSISTANT_ID}/sessions/${sessionId}?version=2018-11-08`;
    request({
      method: 'DELETE',
      uri,
      headers: {
        Authorization: `basic ${authToken}`
      },
    }, (error, response, content) => {
      if(error){
        console.error(error);
        return reject(error);
      }
      resolve(parseResponse(content));
    });
  });
}