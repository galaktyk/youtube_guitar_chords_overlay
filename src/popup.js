

let pipWindow

document.getElementById('myButton').addEventListener('click', () => {



    chrome.runtime.sendMessage({ greeting: "hello" }, async (response) => {
        console.log('Response from background:', response);


        


    });
});
