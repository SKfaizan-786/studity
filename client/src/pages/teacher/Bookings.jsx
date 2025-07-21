import { useEffect, useState } from "react";

export default function Bookings() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem("studentBookings")) || [];
    setRequests(bookings);
  }, []);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...requests];
    updated[index].status = newStatus;
    localStorage.setItem("studentBookings", JSON.stringify(updated));
    setRequests(updated);
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-yellow-700">📅 Booking Requests</h1>

      {requests.length === 0 ? (
        <p className="text-center text-gray-600">No booking requests found.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {requests.map((req, index) => (
            <div key={index} className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-lg font-semibold text-yellow-800">{req.teacherName}</h3>
              <p className="text-sm text-gray-600">Subject: {req.subject}</p>
              <p className="text-sm text-gray-600">Requested At: {new Date(req.time).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Status: {req.status}</p>

              {req.status === "pending" && (
                <div className="mt-2 flex gap-2">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    onClick={() => handleStatusChange(index, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleStatusChange(index, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
