const openai = require('./opanai');

const contentLengthThreshold = 75;

const generateText = async (title, numberOfSlides) => {
    const headlines = await generateSlidesContent(title, numberOfSlides);

    return await Promise.all(headlines.map(async content => {
        return {
            content: content,
            headline: await generateSlideHeadline(content),
            keywords: await extractKeywords(content),
            text: await createText(content)
        };
    }));
};

const generateSlidesContent = async (title, numberOfSlides) => {
    const text = await issueCommand(`Create a slide deck with ${numberOfSlides} slides for the headline "${title}"`);
    return text.split('\n')
        .filter(Boolean)
        .map(s => s.replace(/^(\d)+\./g, '').trim());
};

const generateSlideHeadline = async (content) => {
    if (content.length > contentLengthThreshold) {
        const text = await issueCommand(`Create a headline with 5 words on "${content}"`, 20);
        return text.trim();
    } else {
        return content;
    }
}

const extractKeywords = async (headline, numberOfKeywords = 3) => {
    let text = await issueCommand(`Find the ${numberOfKeywords} most important words in the text "${stripSlideNumber(headline)}"`, 60);
    text = text.replace(/(The|.* most important|words in the text|are)/g, '');
    return text
        .split(/(\n|(\d)+\.(\w+)|,|and)/)
        .filter(text => typeof text !== "undefined" && text !== null && text !== 'and')
        .map(text => text.replace(/(\n|(\d)+\.(\w*)|,|"|')/g, '').trim())
        .filter(text => text.length > 0)
        .join(',');
};

const createText = async (headline, numberOfParagraphs = 2) => {
    const text = await issueCommand(`Create a ${numberOfParagraphs} paragraph essay on the topic "${stripSlideNumber(headline)}"`, 500);
    return text.trim();
}

const answerQuestion = async (question) => {
    const answer = await issueCommand(question, 150);
    return answer.trim();
};

const rephraseQuestion = async (question) => {
    const answer = await issueCommand(`Rephrase the question "${question}"`, 150);
    return answer.trim();
};

const completeSentence = async (start) => {
    const answer = await issueCommand(`${start}"`, 150);
    return answer.trim();
};

const translateText = async(text, language) => {
    const answer = await issueCommand(`Translate this into ${language}:\n\n${text}`, 500);
    return answer.trim();
}

const issueCommand = async (command, maxTokens = 300, temperature = 0.3) => {
    try {

        const response = await openai.openai.createCompletion("text-davinci-001", {
            prompt: command,
            temperature: temperature,
            max_tokens: maxTokens,
            top_p: 1.0,
            frequency_penalty: 0.8,
            presence_penalty: 0.0,
        });
        const choices = response.data.choices;
        return choices[0].text

    } catch (e) {
        console.error(e);
    }
};

const stripSlideNumber = (headline) => headline.replace(/\d*\./, '');

 module.exports = {
    issueCommand: issueCommand,
    generateSlides: generateText,
    generateSlidesContent: generateSlidesContent,
    generateSlideHeadline: generateSlideHeadline,
    extractKeywords: extractKeywords,
    createText: createText,
    answerQuestion: answerQuestion,
    rephraseQuestion: rephraseQuestion,
    completeSentence: completeSentence,
    translateText: translateText
};
