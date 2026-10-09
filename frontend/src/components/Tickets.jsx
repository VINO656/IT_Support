import { useState, useEffect } from 'react';

const Tickets = ({ token }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Poll for new tickets every 5 seconds since AI might create them
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return <div className="card"><h2 className="card-title">Your Tickets</h2>Loading...</div>;

  return (
    <div className="card">
      <h2 className="card-title">Your Support Tickets</h2>
      {tickets.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No tickets found. Ask the AI to create one!</p>
      ) : (
        <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {tickets.map(ticket => (
            <div key={ticket._id} className="ticket-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{ticket.title}</h3>
                <span className={`badge badge-${ticket.status}`}>
                  {ticket.status}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                {ticket.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Priority: {ticket.priority}</span>
                <span>Category: {ticket.category}</span>
                <span>Date: {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;
