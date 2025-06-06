function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const options = { 
      day: 'numeric', month: 'long', year: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'UTC' 
    };
    return `${date.getUTCDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getUTCFullYear()} - ${date.toLocaleTimeString('en-US', options)} UTC`;
  }
  
  function renderEvent(event) {
    const { action, author, from_branch, to_branch, timestamp } = event;
    const formattedTime = formatTimestamp(timestamp);
  
    if (action === "push") {
      return `${author} pushed to ${to_branch} on ${formattedTime}`;
    } else if (action === "pull_request") {
      return `${author} submitted a pull request from ${from_branch} to ${to_branch} on ${formattedTime}`;
    } else if (action === "merge") {
      return `${author} merged branch ${from_branch} to ${to_branch} on ${formattedTime}`;
    } else {
      return `Unknown event by ${author} on ${formattedTime}`;
    }
  }
  
  async function fetchEvents() {
    try {
      const response = await fetch('/events');
      const events = await response.json();
      const list = document.getElementById('events-list');
      list.innerHTML = ''; // Clear existing
  
      if (events.length === 0) {
        list.innerHTML = '<li>No events found</li>';
      } else {
        events.forEach(event => {
          const li = document.createElement('li');
          li.textContent = renderEvent(event);
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  }
  
  // Initial fetch + refresh every 15 seconds
  fetchEvents();
  setInterval(fetchEvents, 15000);