
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function adjustChatbotHeight() {
    if (isMobileDevice()) {
        const chatbotContainer = document.getElementById('chatbot');
        const viewportHeight = window.innerHeight;
        chatbotContainer.style.height = `${viewportHeight}px`;
    }
}

// Appeler cette fonction lors du redimensionnement de la fenêtre
window.addEventListener('resize', adjustChatbotHeight);

// Appeler cette fonction une fois lors du chargement de la page pour s'assurer que le chatbot est dimensionné correctement
window.addEventListener('load', adjustChatbotHeight);

function sendUserInput() {
  var userInput = document.getElementById('userInput').value;
  if (userInput.trim() !== '') {
    displayMessage(userInput, 'user');
    document.getElementById('userInput').value = '';

    const typingIndicator = showTypingIndicator();

    fetch('https://javaburn.herokuapp.com/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ message: userInput }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      hideTypingIndicator(typingIndicator);
      if (typeof data.reply === 'string') {
        typeMessage(data.reply, 'bot');
        // Envoyer un événement personnalisé à Google Analytics
        gtag('event', 'message_sent', {
          'event_category': 'Chatbot',
          'event_label': 'User Message Sent'
        });
      } else {
        displayMessage("Je suis désolé, je n'ai pas pu comprendre la réponse.", 'bot');
      }
    })
    .catch(error => {
      hideTypingIndicator(typingIndicator);
      console.error('Error:', error);
      displayMessage("Une erreur est survenue lors de la connexion au serveur.", 'bot');
    });
  }
}

// Événement pour le bouton "Envoyer"
document.getElementById('sendButton').addEventListener('click', sendUserInput);

// Événement pour la touche "Entrée"
document.getElementById('userInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendUserInput();
    }
});

// Ajout de la fonction pour afficher le message d'accueil
function displayWelcomeMessage() {
    const welcomeMessage = "Welcome! I'm Paul, your dedicated virtual assistant for Puravive. How can I help you on your weight loss journey today? Whether you're curious about how our scientifically-backed formula works, need tips on integrating Puravive into your routine, or want to learn about our special offers, feel free to ask me anything. I'm here to guide and support you every step of the way!";
    const typingIndicator = showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator(typingIndicator);
        displayMessage(welcomeMessage, 'bot');
    }, 2000); // Ajouter une latence de 2 secondes
}

// Fonction pour afficher un message dans le conteneur de messages
function displayMessage(message, sender) {
    var messagesContainer = document.getElementById('messages');
    var messageDiv = document.createElement('div');
    messageDiv.className = sender;
    messageDiv.innerHTML = formatMessage(message);  // Appliquer le formatage du message
    messagesContainer.appendChild(messageDiv);
    scrollToBottom(messagesContainer);
}

// Appel de la fonction d'affichage du message d'accueil dès que la page est chargée
window.addEventListener('load', displayWelcomeMessage);

function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}

function formatMessage(text) {
    const lines = text.split('\n');
    let formattedMessage = '';
    let inList = false;

    lines.forEach(line => {
        let trimmedLine = line.trim();

        // Convertir les motifs Markdown pour le gras (**texte**) en HTML <strong>
        trimmedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convertir les titres Markdown ### en HTML <h3>
        if (trimmedLine.startsWith('###')) {
            formattedMessage += `<h3>${trimmedLine.substring(3).trim()}</h3>`;
            return;
        }

        if (trimmedLine.startsWith('-')) {
            if (!inList) {
                formattedMessage += '<ul>'; // Commencer une nouvelle liste
                inList = true;
            }
            formattedMessage += `<li>${trimmedLine.substring(1).trim()}</li>`; // Ajouter l'élément de liste
        } else {
            if (inList) {
                formattedMessage += '</ul>'; // Fermer la liste si on n'est plus dans un élément de liste
                inList = false;
            }
            formattedMessage += `<p>${trimmedLine}</p>`; // Ajouter comme paragraphe
        }
    });

    if (inList) {
        formattedMessage += '</ul>'; // S'assurer que la liste est fermée à la fin
    }

    return formattedMessage;
}

function showTypingIndicator() {
    const container = document.getElementById('messages');
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    container.appendChild(indicator);
    scrollToBottom(container);
    return indicator;
}

function hideTypingIndicator(indicator) {
    if (indicator) {
        indicator.remove();
    }
}
