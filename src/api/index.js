import { Router } from 'express';
import * as util from '../lib/util';
import * as watson from '../lib/watson';
import {breakfastResp} from '../lib/breakfast';
import { getDb, updateDb } from '../db';

export default ({ config, db }) => {
  let api = Router();

  // expose the breakfast endpoint
  api.post('/thebrain', (req, res) => {
    const { body } = req;

    if(body.challenge){`//needed for slack verification`
      return res.status(200).send(body.challenge);
    }

    const payload = body.event;
    res.sendStatus(200);

    // response for being mentioned in a channel
    if (payload.type === 'app_mention' || (payload.channel_type === 'im' && payload.user !== 'WFDG0SVPB')) {
      if (payload.text.includes('breakfast')) {
        getDb(db, 'breakfast').then(data => {
          const resp = breakfastResp(data, payload);
          resp.resultData && updateDb(db, resp.resultData);
          util.postMessage(resp.response, payload.channel);
        })
      } else if (payload.text.includes('lunch')) {
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
