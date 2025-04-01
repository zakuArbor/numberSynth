const inputs = document.querySelectorAll('.num-input');
const voices = speechSynthesis.getVoices();
const engVoices = voices.filter(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes("whisper"));
const maleEngVoices = engVoices.filter(v => v.name.toLowerCase().includes("male"));
const femaleEngVoices = engVoices.filter(v => v.name.toLowerCase().includes("female"));

let proceedBtn;
let container;
let successSound; 
let errorSound; 

let voice;
let isMale = false;
let isSolved = false;
let enterKeyListener;
let enterKeyListenerAdded = false;

inputs.forEach((input, index) => {
  input.addEventListener('input', (event) => {
    if (event.target.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && index > 0 && event.target.value === '') {
      inputs[index - 1].focus();
    }
    else if (event.key === 'Enter') {
      verifyCode();
    }
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === ' ') {  // Detect spacebar press
    event.preventDefault(); // Prevent unwanted scrolling
    playCode();
  }
});

function playCode() {
  if (!generatedCode) {
    generateRandomCode();
  }
  let delay = 0;
  digit = generatedCode.split('').join(' ');
  //generatedCode.split('').forEach((digit, index) => {
  //  setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(digit);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.voice = voice;
      speechSynthesis.speak(utterance);
    //}, delay);
    //delay = 100; // Add 500ms delay between numbers
  //});
}


function setVoice() {
  if (isMale) {
      voice = maleEngVoices[Math.floor(Math.random() * maleEngVoices.length)] || voices[Math.floor(Math.random() * voices.length)];
  } else {
      voice = femaleEngVoices[Math.floor(Math.random() * femaleEngVoices.length)] || voices[Math.floor(Math.random() * voices.length)];
  }
  console.log(voice);

  isMale = !isMale;
}

function generateRandomCode() {
  generatedCode = "";
  setVoice();
  for (let i = 0; i < 4; i++) {
    generatedCode += Math.floor(Math.random() * 10);
  }
  console.log("Generated Code:", generatedCode);
}

function verifyCode() {
  const enteredCode = Array.from(inputs).map(input => input.value).join('');
  if (enteredCode === generatedCode) {
    proceedBtn.style.display = 'block';
    container.style.border = '2px solid #4caf50';
    inputs.forEach(input => {
      input.style.border = '2px solid #4caf50'; // Green border for each input
      input.disabled = true;
    });
    inputs.forEach(input => input.classList.remove('error'));
    if (!enterKeyListenerAdded) {
      enterKeyListener = (event) => {
        if (event.key === 'Enter') {
          console.log("enter was pressed");
        }
        if (event.key === 'Enter' && isSolved) {
          resetCode();  // Call reset when Enter is pressed again after solving
        }
      };
      setTimeout(() => {
        window.addEventListener('keydown', enterKeyListener);
      }, 500);  // Delay of 500ms
      enterKeyListenerAdded = true;  // Mark that the listener is added
    }
    if (!isSolved) {
      successSound.play();
    }
    isSolved = true;
  } else {
    container.classList.add('shake'); // Add shake effect
    container.style.border = '2px solid #e63946';
    setTimeout(() => container.classList.remove('shake'), 300); // Remove class after animation
    inputs.forEach((input, index) => {
      if (input.value !== generatedCode[index]) {
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    });
    errorSound.play();
  }
}

function resetCode() {
  inputs.forEach(input => input.value = '');
  document.querySelector('#container').style.border = '0px';
  inputs.forEach(input => {
    input.style.border = '2px solid #ccc';
    input.disabled = false;
  });
  proceedBtn.style.display = 'none';
  window.removeEventListener('keydown', enterKeyListener);
  isSolved = false;
  enterKeyListenerAdded = false;
  inputs[0].focus();
  generateRandomCode();
}

window.onload = function() {
  inputs.forEach(input => input.value = '');  // Clear the input fields
  container = document.querySelector('#container');
  container.style.backgroundColor = '#fff5f5';  // Reset the background color to original
  proceedBtn = document.querySelector('.proceed-btn')
  proceedBtn.style.display = 'none';  // Hide the "Proceed to Next Number" button
  enterKeyListenerAdded = false;
  generateRandomCode();

  successSound = document.getElementById("success-sound");
  errorSound = document.getElementById("error-sound");
};
