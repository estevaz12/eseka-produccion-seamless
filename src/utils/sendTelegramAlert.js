function sendTelegramAlert(text, BOT_API, CHAT_ID) {
  fetch(`${BOT_API}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        console.log('Telegram message sent');
      } else {
        console.error('Error sending Telegram message:', data.description);
      }
    })
    .catch((err) => console.error(err));
}

export { sendTelegramAlert };
