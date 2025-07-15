const themeButton = document.getElementById('theme-button');
const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
  document.documentElement.classList.toggle('dark-mode');
  const headerImage = document.getElementById('header-img');
  headerImage.src = document.body.classList.contains('dark-mode')
    ? './img/Website (8).png'
    : './img/Website (7).png';
};
themeButton.addEventListener('click', toggleDarkMode);
document.addEventListener('DOMContentLoaded', () => {
  const headerImage = document.getElementById('header-img');
  headerImage.src = document.body.classList.contains('dark-mode')
    ? './img/Website (8).png'
    : './img/Website (7).png';
});

const rsvpButton = document.getElementById('rsvp-button');
let count = 3;
let rotateFactor = 0;
const modalImage = document.getElementById('modal-image');
const animateImage = () => {
  rotateFactor = rotateFactor === 0 ? -10 : 0;
  modalImage.style.transform = `rotate(${rotateFactor}deg)`;
};
const validateForm = e => {
  e.preventDefault();
  let hasError = false;
  const person = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    event: document.getElementById('event').value.trim()
  };

  if (person.name.length < 2) {
    hasError = true;
    document.getElementById('name').classList.add('error');
  } else {
    document.getElementById('name').classList.remove('error');
  }

  if (person.email.length < 2) {
    hasError = true;
    document.getElementById('email').classList.add('error');
  } else {
    document.getElementById('email').classList.remove('error');
  }

  if (person.event.length < 2) {
    hasError = true;
    document.getElementById('event').classList.add('error');
  } else {
    document.getElementById('event').classList.remove('error');
  }

  if (!hasError) {
    addParticipant(person);
    showModal(person);
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('event').value = '';
  }
};
const addParticipant = person => {
  const p = document.createElement('p');
  p.textContent = `🎟️ ${person.name} has RSVP'd to ${person.event}.`;
  document.querySelector('.rsvp-participants').appendChild(p);
  document.getElementById('rsvp-count').remove();
  count++;
  const badge = document.createElement('p');
  badge.id = 'rsvp-count';
  badge.textContent = `⭐ ${count} people have RSVP'd to this event!`;
  document.getElementById('rsvp').insertBefore(badge, document.getElementById('rsvp').children[1]);
};
const showModal = person => {
  const modal = document.getElementById('success-modal');
  const modalText = document.getElementById('modal-text');
  modalText.textContent = `Thanks for RSVPing, ${person.name}!`;
  modal.style.display = 'flex';
  const intervalId = setInterval(animateImage, 500);
  setTimeout(() => {
    modal.style.display = 'none';
    clearInterval(intervalId);
  }, 5000);
};
rsvpButton.addEventListener('click', validateForm);

// === Suggestion Box ===
const suggestionForm = document.getElementById('suggestion-form');
const feedback = document.getElementById('suggestion-feedback');
const suggestionList = document.getElementById('suggestion-list');

suggestionForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('suggestion-name').value.trim();
  const message = document.getElementById('suggestion-message').value.trim();
  const payload = { name, text: message };

  try {
    const res = await fetch('https://suggestion-box-backend-wnjg.onrender.com/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (res.ok) {
      feedback.textContent = 'Thank you for your suggestion!';
      suggestionForm.reset();
      renderSuggestion({ name, text: message, _id: result.id });
    } else {
      feedback.textContent = `Error: ${result.error || 'Unable to submit'}`;
    }
  } catch {
    feedback.textContent = 'Network error. Please try again later.';
  }
});

function renderSuggestion({ name, text, _id }) {
  const li = document.createElement('li');
  li.textContent = `${name}: ${text}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.classList.add('delete-btn');

  deleteBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`https://suggestion-box-backend-wnjg.onrender.com/suggestions/${_id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        li.remove();
      } else {
        alert('Failed to delete suggestion.');
      }
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Error deleting suggestion.');
    }
  });

  li.appendChild(deleteBtn);
  suggestionList.appendChild(li);
}

async function loadSuggestions() {
  try {
    const res = await fetch('https://suggestion-box-backend-wnjg.onrender.com/suggestions');
    if (!res.ok) throw new Error('Network response was not OK');
    const suggestions = await res.json();

    const loadingMsg = document.getElementById('loading-msg');
    if (loadingMsg) loadingMsg.remove();

    if (suggestions.length === 0) {
      const emptyMsg = document.createElement('li');
      emptyMsg.textContent = 'No suggestions yet. Be the first!';
      suggestionList.appendChild(emptyMsg);
    } else {
      suggestions.forEach(renderSuggestion);
    }
  } catch (err) {
    console.error('Could not load suggestions:', err);
    const loadingMsg = document.getElementById('loading-msg');
    if (loadingMsg) loadingMsg.textContent = 'Failed to load suggestions. Try refreshing.';
  }
}
document.addEventListener('DOMContentLoaded', loadSuggestions);
