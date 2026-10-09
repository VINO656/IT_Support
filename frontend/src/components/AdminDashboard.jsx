import { useState, useEffect } from 'react';

const AdminDashboard = ({ token }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/admin/all`, {
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
    fetchAllTickets();
    const interval = setInterval(fetchAllTickets, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleResolve = async (ticketId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Closed' })
      });
      // Optimistic update
      setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: 'Closed' } : t));
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  };

  if (loading) return <div className="card"><h2 className="card-title">Admin Dashboard</h2>Loading tickets...</div>;

  return (
    <div className="card" style={{ border: '2px solid var(--primary)', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="card-title" style={{ color: 'var(--primary)' }}>🛠️ Admin Dashboard</h2>
        <span className="badge badge-high">{tickets.filter(t => t.status === 'Open').length} Open</span>
      </div>
      
      {tickets.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No tickets found in the entire system.</p>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {tickets.map(ticket => (
            <div key={ticket._id} className="ticket-item" style={{ borderLeft: `4px solid ${ticket.status === 'Closed' ? 'gray' : ticket.priority === 'critical' ? 'red' : 'var(--primary)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{ticket.title}</h3>
                <span className={`badge badge-${ticket.status}`}>
                  {ticket.status}
                </span>
              </div>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                {ticket.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>User ID: {ticket.userId?._id || ticket.userId}</span>
                  <span style={{ fontWeight: 'bold' }}>Priority: {ticket.priority.toUpperCase()}</span>
                  <span>Cat: {ticket.category}</span>
                </div>
                
                {ticket.status !== 'Closed' && (
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                    onClick={() => handleResolve(ticket._id)}
                  >
                    ✅ Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
