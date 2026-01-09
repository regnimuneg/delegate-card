import './AttendanceHistory.css';

// Mock attendance data
const MOCK_ATTENDANCE = [
    {
        id: 1,
        sessionName: 'Opening Ceremony',
        council: 'General Assembly',
        date: new Date('2026-01-08T09:00:00'),
        duration: '2 hours',
        status: 'present'
    },
    {
        id: 2,
        sessionName: 'Committee Session 1',
        council: 'General Assembly',
        date: new Date('2026-01-08T11:30:00'),
        duration: '3 hours',
        status: 'present'
    },
    {
        id: 3,
        sessionName: 'Lunch Break Networking',
        council: 'General Assembly',
        date: new Date('2026-01-08T14:30:00'),
        duration: '1 hour',
        status: 'present'
    },
    {
        id: 4,
        sessionName: 'Committee Session 2',
        council: 'General Assembly',
        date: new Date('2026-01-09T09:00:00'),
        duration: '3 hours',
        status: 'present'
    }
];

/**
 * Format date for attendance display
 */
function formatAttendanceDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
        return `Today, ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${timeStr}`;
    } else {
        return `${dateStr}, ${timeStr}`;
    }
}

/**
 * AttendanceHistory Component
 * Shows all sessions the delegate has attended
 */
export function AttendanceHistory({ attendance = MOCK_ATTENDANCE }) {
    if (attendance.length === 0) {
        return (
            <div className="attendance-history-empty">
                <span className="attendance-history-empty-icon">📊</span>
                <h3>No Attendance Records</h3>
                <p>Your session check-ins will appear here</p>
            </div>
        );
    }

    return (
        <div className="attendance-history">
            <h2 className="attendance-history-title">Attendance History</h2>
            <p className="attendance-history-subtitle">
                {attendance.length} session{attendance.length !== 1 ? 's' : ''} attended
            </p>

            <div className="attendance-history-list">
                {attendance.map((record) => (
                    <div key={record.id} className="attendance-history-item">
                        <div className="attendance-history-item-icon">
                            ✅
                        </div>
                        <div className="attendance-history-item-content">
                            <h4 className="attendance-history-item-title">{record.sessionName}</h4>
                            <p className="attendance-history-item-council">{record.council}</p>
                            <div className="attendance-history-item-meta">
                                <span className="attendance-history-item-date">
                                    {formatAttendanceDate(record.date)}
                                </span>
                                <span className="attendance-history-item-duration">
                                    {record.duration}
                                </span>
                            </div>
                        </div>
                        <div className="attendance-history-item-status">
                            <span className="attendance-history-status-badge">Present</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AttendanceHistory;
