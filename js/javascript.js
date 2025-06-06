
  const chatBox = document.getElementById('chat');
  const form = document.getElementById('form');
  const input = document.getElementById('question');
  const API_KEY = 'sk-wjhho3rbb0dq8f';
  let chatHistoryArr = [];

  window.onload = () => {
    const saved = localStorage.getItem('chat_history');
    const savedRaw = localStorage.getItem('chat_history_raw');
    
    if (saved) {
      const messages = JSON.parse(saved);
      messages.forEach(msg => addMessage(msg.content, msg.sender, msg.isHTML));
    } else {
      addMessage("Halo, Aku Henri Chat AI - AI CHAT GPT yang siap membantumu, apa yang kamu butuhkan? 🙄 Pertama, Perintahkan aku untuk menggunakan bahasa Indonesia (jika perlu)", 'ai');
    }

    if (savedRaw) {
      chatHistoryArr = JSON.parse(savedRaw);
    }
  };

  function saveToLocalStorage() {
    const messages = [...document.querySelectorAll('.message')].map(msg => ({
      content: msg.innerHTML,
      sender: msg.classList.contains('user') ? 'user' : 'ai',
      isHTML: msg.querySelector('img') !== null
    }));
    localStorage.setItem('chat_history', JSON.stringify(messages));
    localStorage.setItem('chat_history_raw', JSON.stringify(chatHistoryArr));
  }

  function addMessage(content, sender, isHTML = false) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.innerHTML = isHTML ? content : content.replace(/\n/g, '<br>');
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    saveToLocalStorage();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, 'user');
    input.value = '';

    chatHistoryArr.push(`User: ${question}`);
    if (chatHistoryArr.length > 10) chatHistoryArr.shift();
    const context = chatHistoryArr.join('\n');

    try {
      const res = await fetch(`https://rescenic.web.id/api/ai/chatgpt-4?api_key=${API_KEY}&question=${encodeURIComponent(context)}`);
      const data = await res.json();
      const reply = data?.data?.text || "Gagal menerima jawaban.";
      addMessage(reply, 'ai');

      chatHistoryArr.push(`AI: ${reply}`);
      if (chatHistoryArr.length > 10) chatHistoryArr.shift();
      saveToLocalStorage();
    } catch (err) {
      addMessage(`Terjadi kesalahan: ${err.message}`, 'ai');
    }
  });

  function sendSticker() {
    const url = 'https://raw.githubusercontent.com/hendrisprta/hendritester/refs/heads/main/Stikerhenri.png';
    const msg = document.createElement('div');
    msg.className = 'message user';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'stiker';
    img.className = 'sticker';
    msg.appendChild(img);

    const reactContainer = document.createElement('div');
    reactContainer.style.marginTop = '5px';

    const reactions = ['👍', '😂', '😢', '❤️', '🔥'];
    reactions.forEach(emoji => {
      const btn = document.createElement('button');
      btn.textContent = emoji;
      btn.className = 'emoji-btn';
      btn.onclick = () => {
        addMessage(`AI bereaksi: ${emoji}`, 'ai');
      };
      reactContainer.appendChild(btn);
    });

    msg.appendChild(reactContainer);
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    saveToLocalStorage();

    setTimeout(() => {
      addMessage("Henri sedih", 'ai');
    }, 600);
  }

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm("Yakin ingin menghapus semua chat?")) {
      localStorage.removeItem('chat_history');
      localStorage.removeItem('chat_history_raw');
      chatBox.innerHTML = '';
      chatHistoryArr = [];
    }
  });
