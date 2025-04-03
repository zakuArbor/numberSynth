let inputs = document.querySelectorAll('.num-input');
const voices = speechSynthesis.getVoices();
const engVoices = voices.filter(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes("whisper"));
const maleEngVoices = engVoices.filter(v => !v.name.toLowerCase().includes("female"));
const femaleEngVoices = engVoices.filter(v => v.name.toLowerCase().includes("female"));
const frVoices = voices.filter(v => v.lang === "fr-FR");
console.log(femaleEngVoices);
const wrongCodeSound = new Audio('error.mp3');
let i = 0;
let proceedBtn;
let container;
let successSound; 
let errorSound;
let rate = 1;

let voice;
let isMale = false;
let isEnglish = true;
let isSolved = false;
let enterKeyListener;
let enterKeyListenerAdded = false;
let currentUtterance = null;
let languageToggle;

const speedSlider = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const numDigitSlider = document.getElementById("numDigits");

const numContainer = document.querySelector('.num-container');
const digitValue = document.getElementById('digitValue');

speedSlider.addEventListener("input", () => {
  speedValue.textContent = parseFloat(speedSlider.value).toFixed(1) + "x";
  rate = speedSlider.value;
});

numDigitSlider.addEventListener("input", () => {
  digitValue.textContent = numDigitSlider.value;
  const numDigits = parseInt(numDigitSlider.value, 10);
  numDigitSlider.textContent = numDigits;

  numContainer.innerHTML = '';

  for (let i = 0; i < numDigits; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'num-input';
    input.maxLength = 1;
    input.pattern = '\\d';
    input.inputMode = 'numeric';
    numContainer.appendChild(input);
  }
  attachInputListeners();
  resetCode();
});

function attachInputListeners() {
  inputs = document.querySelectorAll('.num-input');
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
}

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
      utterance.lang = isEnglish ? 'en-US' : 'fr-FR';
      utterance.rate = rate;
      utterance.voice = voice;
      if (currentUtterance && speechSynthesis.speaking) {
        speechSynthesis.cancel(); // Stop the current utterance
      }
      currentUtterance = utterance;
      speechSynthesis.speak(utterance);
    //}, delay);
    //delay = 100; // Add 500ms delay between numbers
  //});
}
//
//female: 3

function setVoice() {
  if (isEnglish) {
    voice = femaleEngVoices[Math.floor(Math.random() * femaleEngVoices.length)] || engVoices[Math.floor(Math.random() * engVoices.length)];
  } else {
    console.log(frVoices);
    voice = frVoices[Math.floor(Math.random() * frVoices.length)] || voices[Math.floor(Math.random() * voices.length)];
  }
  console.log(voice);
}

function generateRandomCode() {
  generatedCode = "";
  setVoice();
  const numDigits = parseInt(numDigitSlider.value, 10);
  for (let i = 0; i < numDigits; i++) {
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
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // Vibrates for 200ms, pauses for 100ms, then vibrates for 200ms again
    }

    if (!wrongCodeSound.paused) {
      wrongCodeSound.pause();   // Pause the sound if it's playing
      wrongCodeSound.currentTime = 0;  // Reset to the start
    }
    wrongCodeSound.play();  // Play the sound
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
  inputs.forEach(input => input.value = '');
  speedSlider.value = 1;
  speedValue.textContent = parseFloat(1).toFixed(1) + "x";
  digitValue.textContent = 4;
  numDigitSlider.value = 4;
  rate = 1;

  container = document.querySelector('#container');
  container.style.backgroundColor = '#fff5f5';  // Reset the background color to original
  proceedBtn = document.querySelector('.proceed-btn')

  successSound = document.getElementById("success-sound");
  errorSound = document.getElementById("error-sound");
  languageToggle = document.getElementById('languageToggle');

  languageToggle.addEventListener('change', () => {
    isEnglish = !languageToggle.checked;
    setVoice();
  });
  resetCode();
  languageToggle.checked = false;
  attachInputListeners();
};
