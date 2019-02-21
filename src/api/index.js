import { Router } from 'express';
import request from 'request';
import * as util from '../lib/util';
import * as watson from '../lib/watson';
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
          let currentData = data;
          const command = payload.text.split(':')[1];
          let response = '';
          const date = new Date(currentData.lastDate).toDateString();

          switch (command) {
            case 'add':
              if (payload.user === 'W4CEKPG4W') {
                const newUser = payload.text.split(':')[2];
                currentData.team.push(newUser);
                updateDb(db, currentData);
                response = `All set! ${newUser} is added to the end of the list.`;
              } else {
                response = 'Excuse me! Do I know you?'
              }
              break;

            case 'swapNext':
              if (payload.user === 'W4CEKPG4W') {
                const currentIndex = currentData.lastIndex;
                const nextIndex = util.nextIndex(currentData);
                const tempNext = currentData.team[nextIndex];
                currentData.team[nextIndex] = currentData.team[currentIndex];
                currentData.team[currentIndex] = tempNext;
                updateDb(db, currentData);
                response = `Done! Swapped ${currentData.team[nextIndex]} with ${currentData.team[currentIndex]}`;
              } else {
                response = 'Nope.'
              }
              break;

            default:
              if (new Date() - new Date(currentData.lastDate) > 86400000) {
                currentData = Object.assign(currentData, {
                  lastIndex: util.nextIndex(currentData),
                  lastDate: util.nextWed(),
                });
                updateDb(db, currentData);
              }
              response = `it's ${currentData.team[data.lastIndex]}'s turn on ${date}`;
          }
          util.postMessage(response, payload.channel);
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
