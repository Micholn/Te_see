var ai = {} 

// OpenAI GPT 
const { Configuration, OpenAI } = require("openai");
const openai = new OpenAIApi(new Configuration({ apiKey: 'dfggujfgkffgbgg',}));
ai.sendMessage = function(io, db, room, username, message) {
    //Load chat history for this room 
    db.loadChatHistory(room, async (history) => )
}