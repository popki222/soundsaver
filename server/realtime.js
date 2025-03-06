const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.ANON_KEY
);

const listenToChanges = () => {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'songs',
      },
      (payload) => {
        console.log('New record inserted:', payload.new);

        const { id, permalink_url: url } = payload.new;
        fetch('http://localhost:5000/send-message', {
          method: 'POST',
          body: JSON.stringify({ id, url }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Message sent to SQS:', data);
        })
        .catch(error => {
          console.error('Error sending message:', error);
        });
      }
    )
    .subscribe();

  console.log("Listening for INSERT events on 'songs' table...");
};

module.exports = listenToChanges;