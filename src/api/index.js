import { Router } from 'express';
import * as util from '../lib/util';
import { getDb, updateDb } from '../db';

export default ({ config, db }) => {
  let api = Router();

  // expose the breakfast endpoint
  api.post('/breakfast_duty', (req, res) => {
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
          util.postMessage(response, payload.channel);
        })
      }else if (payload.text.includes('lunch')) {
        getDb(db, 'lunch').then(data => {
          util.postMessage(util.randomMsg(data.res), payload.channel);
        })
      }else if ((payload.channel_type === 'im' && payload.text.trim() === '<@WFDG0SVPB>')
        || payload.type === 'app_mention') {
        getDb(db, 'greetings').then(data => {
          const response = `${util.randomMsg(data.res)}, <@${payload.user}>!`
          util.postMessage(response, payload.channel);
        })
      }
    }

    // response to someone joined a channel
    if (payload.event.type === 'member_joined_channel') {
      const response = `<@${payload.event.user}> welcome!`;
      util.postMessage(response, payload.event.channel);
    }

    // response to someone left a channel
    if (payload.event.type === 'member_left_channel') {
      const response = `See you later, <@${payload.event.user}>!`;
      util.postMessage(response, payload.event.channel);
    }
  });

  return api;
}
