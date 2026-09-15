const openai = require('openai');

const configuration = new openai.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  openai: new openai.OpenAIApi(configuration)
};
