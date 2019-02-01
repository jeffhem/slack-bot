import { Router } from 'express';
import request from 'request';
import * as util from '../lib/util';
import * as watson from '../lib/watson';
import { getDb, updateDb } from '../db';

export default ({ config, db }) => {
  let api = Router();
  
  // expose the breakfast endpoint
  api.post('/thebrain', (req, res) => {
    const payload = req.body.event;
    res.sendStatus(200);

    // response for being mentioned in a channel
    if (payload.type === 'app_mention' || payload.channel_type === 'im') {
      if (payload.text.includes('breakfast')) {
        getDb(db, 'breakfast').then(data => {
          let currentData = data;
          console.log(currentData);
          if (new Date() - new Date(currentData.lastDate) > 86400000) {
            currentData = Object.assign(currentData, {
              lastIndex: util.nextIndex(currentData),
              lastDate: util.nextWed(),
            });
            updateDb(db, currentData);
          }
          const date = new Date(currentData.lastDate).toDateString();
          const response = `it's ${currentData.team[data.lastIndex]}'s turn on ${date}`;
          console.log(response);
          util.postMessage(response, payload.channel);
        })
      }else if (payload.text.includes('lunch')) {
        getDb(db, 'lunch').then(data => {
          util.postMessage(util.randomMsg(data.res), payload.channel);
        })
      } else {
        const { text } = payload;
        watson.message(text).then(resp => {
          console.log("watson response:", resp);
          util.postMessage(resp, payload.channel);
        });
      }
    }

    // response to someone joined a channel
    if (payload.type === 'member_joined_channel') {
      const response = `<@${payload.user}> welcome!`;
      util.postMessage(response, payload.channel);
    }

    // response to someone left a channel
    if (payload.type === 'member_left_channel') {
      const response = `See you later, <@${payload.user}>!`;
      util.postMessage(response, payload.channel);
    }
  });

  return api;
}
