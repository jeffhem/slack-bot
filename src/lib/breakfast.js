import * as util from '../lib/util';

export const breakfastResp = (data, payload) => {
  let currentData = data;
  let response = '';
  let resultData = '';

  const author = 'W4CEKPG4W';
  const command = payload.text.split(':')[1] && payload.text.split(':')[1].trim();
  const newUser = payload.text.split(':')[2] && payload.text.split(':')[2].trim();
  const date = new Date(currentData.lastDate).toDateString();
  const currentIndex = currentData.lastIndex;

  switch (command) {

    case 'addNew':
      if (payload.user === author) {
        currentData.team.push(newUser);
        resultData = currentData;
        response = `All set! ${newUser} is added to the end of the list.`;
      } else {
        response = 'Excuse me! Do I know you?'
      }
      break;

    case 'swapNext':
      if (payload.user === author) {
        const nextIndex = util.nextIndex(currentData);
        const tempNext = currentData.team[nextIndex];
        currentData.team[nextIndex] = currentData.team[currentIndex];
        currentData.team[currentIndex] = tempNext;
        resultData = currentData;
        response = `Done! Swapped ${currentData.team[nextIndex]} with ${currentData.team[currentIndex]}`;
      } else {
        response = 'Nope.'
      }
      break;

    case 'listAll':
      response += `${currentData.team[currentIndex]} `;
      let counter = currentIndex + 1;
      const teamLength = currentData.team.length;

      while(counter !== currentIndex ) {
        response += `=> ${currentData.team[counter]}`;
        counter = counter < teamLength - 1 ? counter + 1 : 0;
      }
      break;

    default:
      if (new Date() - new Date(currentData.lastDate) > 86400000) {
        currentData = Object.assign(currentData, {
          lastIndex: util.nextIndex(currentData),
          lastDate: util.nextWed(),
        });
        resultData = currentData;
      }
      response = `it's ${currentData.team[data.lastIndex]}'s turn on ${date}`;
  }

  return {
    resultData,
    response,
  }

};
