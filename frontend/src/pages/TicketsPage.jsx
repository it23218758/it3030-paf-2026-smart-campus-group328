import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { TicketDetailsModal } from '../components/TicketDetailsModal';
import { Plus, Wrench, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export const TicketsPage = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            let contextStr = '';
            if (user.role === 'USER') contextStr = '?context=my-tickets';
            if (user.role === 'TECHNICIAN') contextStr = '?context=assigned';

            const res = await axios.get(`/api/tickets${contextStr}`, { withCredentials: true });
            setTickets(res.data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user.role]);

    const handleCreateNew = () => {
        setSelectedTicket({ isNew: true });
    };

const statusIconMap = {
  OPEN: <AlertCircle className="w-5 h-5 text-blue-500" />,
  IN_PROGRESS: <Wrench className="w-5 h-5 text-yellow-500" />,
  RESOLVED: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  CLOSED: <CheckCircle2 className="w-5 h-5 text-gray-500" />,
  REJECTED: <XCircle className="w-5 h-5 text-red-500" />,
};

const getStatusIcon = (status) => {
  return statusIconMap[status] || null;
};
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    {user.role === 'TECHNICIAN' ? 'Assigned Tickets' :
                        user.role === 'ADMIN' ? 'All Tickets' : 'My Tickets'}
                </h1>
                {user.role === 'USER' && (
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Raise Issue
                    </button>
                )}
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <ul className="divide-y divide-gray-200">
    {tickets.length > 0 ? (
      tickets.map((ticket) => {
        const {
          id,
          title,
          status,
          resourceName,
          createdAt,
          assignedTechnicianId,
        } = ticket;

        return (
          <li
            key={id}
            onClick={() => setSelectedTicket(ticket)}
            className="flex items-center justify-between p-6 cursor-pointer transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            role="button"
            tabIndex={0}
          >
           
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getStatusIcon(status)}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {resourceName || "General Campus"} •{" "}
                  {new Date(createdAt).toLocaleDateString()}
                </p>

                <span className="inline-block mt-2 text-sm font-medium text-gray-700">
                  {status}
                </span>
              </div>
            </div>

            
            {assignedTechnicianId && (
              <div className="hidden md:block text-sm text-gray-500">
                Tech ID: {assignedTechnicianId}
              </div>
            )}
          </li>
        );
      })
    ) : (
      <li className="p-12 text-center text-gray-500">
        No tickets available.
      </li>
    )}
  </ul>
</div>
            )}

            {selectedTicket && (
                <TicketDetailsModal
                    ticket={selectedTicket}
                    onClose={() => {
                        setSelectedTicket(null);
                        fetchTickets();
                    }}
                />
            )}
        </div>
    );
};
