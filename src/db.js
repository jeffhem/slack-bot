
import Cloudant from '@cloudant/cloudant';

export const initializeDb = callback => {
  const cloudant = Cloudant({ vcapServices: JSON.parse(process.env.VCAP_SERVICES) });
  const db = cloudant.db.use('bot');
  callback(db);
}

export const getDb = (db, id) =>
  new Promise(resolve => {
    db.get(id, (err, docs) => {
      if(err) console.log('error getting db: ', err);
      resolve(docs);
    });
  });

export const updateDb = (db, data) => {
  db.insert(data)
    .then((body) => {
      console.log('db updated: ', body);
    })
};
