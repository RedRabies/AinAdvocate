import React, { useState, useEffect } from 'react';
import appointmentService from '../../services/appointment.service';
import '../../styles/components/appointment.css';
import { useToast } from '../../components/common/Toast';

const AppointmentScheduler = ({ caseId, currentUser }) => {
    const { addToast } = useToast();
    const [appointments, setAppointments] = useState([]);
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Reschedule State
    const [editingId, setEditingId] = useState(null);
    const [newDate, setNewDate] = useState('');

    const isLawyer = currentUser?.role === 'lawyer';

    const saveReschedule = async (id) => {
        if (!newDate) return addToast("Please select a new date.", 'error');
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            await appointmentService.rescheduleAppointment(id, newDate, token);
            addToast("Appointment rescheduled & confirmed!", 'success');
            setEditingId(null);
            fetchAppointments();
        } catch (error) {
            console.error("Reschedule failed", error);
            addToast("Failed to reschedule.", 'error');
        }
    };

    const fetchAppointments = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            // If service requires caseId, pass it.
            const data = await appointmentService.getAppointments(token, caseId);
            setAppointments(data);
        } catch (error) {
            console.error("Failed to load appointments", error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [caseId]);

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            await appointmentService.requestAppointment({ caseId, date, reason }, token);
            addToast("Request sent successfully!", 'success');
            setDate('');
            setReason('');
            fetchAppointments();
        } catch (error) {
            console.error("Request failed", error);
            addToast("Failed to request appointment. Please try again.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            await appointmentService.updateStatus(id, status, token);
            addToast(`Appointment updated to ${status}`, 'success');
            fetchAppointments();
        } catch (err) {
            console.error("Update failed", err);
            addToast("Failed to update status", 'error');
        }
    };

    // Case-insensitive filtering
    const pendingAppointments = appointments.filter(a => (a.status || '').toLowerCase() === 'pending');

    // Filtering logic: Lawyers see confirmed/cancelled in history (and pending in specific block). Clients see everything in history.
    const historyAppointments = appointments.filter(a => isLawyer ? (a.status || '').toLowerCase() !== 'pending' : true);

    return (
        <div className="appointment-wrapper">

            {/* Header Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isLawyer ? 'Appointment Dashboard (Lawyer Mode)' : 'Schedule Consultation'}
                </h2>
                <p className="text-gray-500">
                    {isLawyer ? 'Manage your upcoming meetings and requests.' : 'Book a secure meeting with your legal representative.'}
                </p>
            </div>

            {/* CLIENT: Request Form */}
            {!isLawyer && (
                <div className="appointment-glass-card">
                    <div className="appointment-card-header">
                        <div className="appointment-header-icon icon-blue">
                            📅
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">New Request</h3>
                            <p className="text-sm text-gray-500">Select a time for your case discussion</p>
                        </div>
                    </div>

                    <div className="appointment-card-body">
                        <form onSubmit={handleRequest}>
                            <div className="apt-form-group">
                                <label className="apt-label">Selected Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="apt-input"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="apt-form-group">
                                <label className="apt-label">Consultation Topic</label>
                                <textarea
                                    className="apt-input apt-textarea"
                                    placeholder="Briefly describe what you would like to discuss..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="apt-submit-btn" disabled={loading}>
                                {loading ? 'Sending Request...' : 'Send Appointment Request 🚀'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* LAWYER: Pending Requests */}
            {isLawyer && pendingAppointments.length > 0 && (
                <div className="appointment-glass-card" style={{ borderTop: '4px solid #ea580c' }}>
                    <div className="appointment-card-header">
                        <div className="appointment-header-icon icon-orange">
                            ⚠️
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Pending Requests</h3>
                            <p className="text-sm text-gray-500">{pendingAppointments.length} client requests awaiting action</p>
                        </div>
                    </div>
                    <div className="appointment-card-body">
                        {pendingAppointments.map(app => (
                            <div key={app._id} className="apt-item">
                                <div className="apt-info">
                                    <div className="apt-date">
                                        📅 {new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="apt-time">
                                        ⏰ {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="apt-reason">
                                        "{app.reason}"
                                    </div>
                                </div>

                                <div className="apt-actions">
                                    {editingId === app._id ? (
                                        <div className="reschedule-box">
                                            <label className="text-xs font-bold text-orange-800 uppercase mb-2 block">Propose New Time</label>
                                            <input
                                                type="datetime-local"
                                                className="reschedule-input"
                                                value={newDate}
                                                onChange={(e) => setNewDate(e.target.value)}
                                            />
                                            <div className="reschedule-actions">
                                                <button onClick={() => saveReschedule(app._id)} className="btn-confirm">
                                                    Confirm
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="btn-cancel">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button onClick={() => handleStatusUpdate(app._id, 'CONFIRMED')} className="btn-accept">Accept</button>
                                            <button onClick={() => {
                                                setEditingId(app._id);
                                                try {
                                                    setNewDate(new Date(app.date).toISOString().slice(0, 16));
                                                } catch (e) { setNewDate(''); }
                                            }} className="btn-reschedule">
                                                Reschedule
                                            </button>
                                            <button onClick={() => handleStatusUpdate(app._id, 'REJECTED')} className="btn-reject">Reject</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* COMMON: History / Upcoming */}
            <div className="appointment-glass-card">
                <div className="appointment-card-header">
                    <div className="appointment-header-icon icon-purple">
                        📜
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">
                            {isLawyer ? 'Upcoming Schedule' : 'Appointment History'}
                        </h3>
                        <p className="text-sm text-gray-500">Track your confirmed and past meetings</p>
                    </div>
                </div>

                <div className="appointment-card-body">
                    {appointments.length === 0 ? (
                        <div className="empty-state">
                            <p>No appointments found.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {historyAppointments.length === 0 && (
                                <p className="text-center text-gray-500 py-4">No history to show.</p>
                            )}
                            {historyAppointments.map(app => (
                                <div key={app._id} className="apt-item">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="apt-date">
                                                {new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <span className={`apt-badge badge-${(app.status || '').toLowerCase()}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="apt-time">
                                            {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {app.reason && <div className="apt-reason">{app.reason}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AppointmentScheduler;
