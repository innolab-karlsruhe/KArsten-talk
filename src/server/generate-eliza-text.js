const ElizaBot = require('elizabot');

const eliza = new ElizaBot();

const initialize = () => {
    return eliza.getInitial();
}

const generateResponseFor = (input) => {
    return eliza.transform(input);
}

module.exports = {
    initialize: initialize,
    generateResponseFor: generateResponseFor
};