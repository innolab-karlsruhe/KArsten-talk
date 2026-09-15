let gpt3Lines = [];

function gpt3Reset() {
    gpt3Lines.length = 0;
    elizaStep();
}

async function gpt3Process(inputText) {
    const response = await fetch('/gpt3', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({input: inputText})});
    return (await response.json()).answer;
}

async function gpt3Step() {
    const form = document.forms.g_form;

    const userInput = form.e_input.value;

    if (userInput !== '') {
        const usr = 'YOU:   ' + userInput;
        gpt3Lines.push(usr);

        const rpl = 'SKYNET: ' + await gpt3Process(userInput);
        gpt3Lines.push(rpl);

        const temp = [];
        let l = 0;
        for (let i=gpt3Lines.length-1; i>=0; i--) {
            l += 1 + Math.floor(gpt3Lines[i].length/displayCols);
            if (l >= displayRows) break
            else temp.push(gpt3Lines[i]);
        }
        gpt3Lines = temp.reverse();
        form.e_display.value = gpt3Lines.join('\n');
    }

    form.e_input.value = '';
    form.e_input.focus();
}
