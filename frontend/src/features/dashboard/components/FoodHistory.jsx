import './FoodHistory.css';

// Mock food history data
const MOCK_FOOD_HISTORY = [
    {
        id: 1,
        mealType: 'Breakfast',
        location: 'Main Hall Cafeteria',
        date: new Date('2026-01-09T08:00:00'),
        items: ['Continental Breakfast', 'Orange Juice', 'Coffee'],
        status: 'claimed'
    },
    {
        id: 2,
        mealType: 'Lunch',
        location: 'Main Hall Cafeteria',
        date: new Date('2026-01-08T13:00:00'),
        items: ['Grilled Chicken', 'Rice', 'Vegetables', 'Water'],
        status: 'claimed'
    },
    {
        id: 3,
        mealType: 'Dinner',
        location: 'VIP Lounge',
        date: new Date('2026-01-08T19:30:00'),
        items: ['Pasta', 'Salad', 'Dessert', 'Soft Drink'],
        status: 'claimed'
    },
    {
        id: 4,
        mealType: 'Lunch',
        location: 'Main Hall Cafeteria',
        date: new Date('2026-01-07T12:45:00'),
        items: ['Vegetarian Pizza', 'Salad', 'Water'],
        status: 'claimed'
    }
];

/**
 * Get meal icon based on type
 */
function getMealIcon(mealType) {
    const icons = {
        'Breakfast': (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="M4.93 4.93l1.41 1.41"></path>
                <path d="M17.66 17.66l1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="M6.34 17.66l-1.41 1.41"></path>
                <path d="M19.07 4.93l-1.41 1.41"></path>
            </svg>
        ),
        'Lunch': (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                <path d="M7 2v20"></path>
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
            </svg>
        ),
        'Dinner': (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
            </svg>
        ),
        'Snack': (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
        )
    };
    return icons[mealType] || (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
            <path d="M7 2v20"></path>
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
    );
}

/**
 * Format date for food history display
 */
function formatFoodDate(date) {
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
 * FoodHistory Component
 * Shows all meals the delegate has claimed
 */
export function FoodHistory({ foodHistory = MOCK_FOOD_HISTORY }) {
    if (foodHistory.length === 0) {
        return (
            <div className="food-history-empty">
                <svg className="food-history-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                    <path d="M7 2v20"></path>
                    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                </svg>
                <h3>No Meal Records</h3>
                <p>Your claimed meals will appear here</p>
            </div>
        );
    }

    return (
        <div className="food-history">
            <h2 className="food-history-title">Food History</h2>
            <p className="food-history-subtitle">
                {foodHistory.length} meal{foodHistory.length !== 1 ? 's' : ''} claimed
            </p>

            <div className="food-history-list">
                {foodHistory.map((record) => (
                    <div key={record.id} className="food-history-item">
                        <div className="food-history-item-icon">
                            {getMealIcon(record.mealType)}
                        </div>
                        <div className="food-history-item-content">
                            <h4 className="food-history-item-title">{record.mealType}</h4>
                            <p className="food-history-item-location">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {record.location}
                            </p>
                            <p className="food-history-item-date">{formatFoodDate(record.date)}</p>
                            {record.items && record.items.length > 0 && (
                                <div className="food-history-item-items">
                                    {record.items.map((item, index) => (
                                        <span key={index} className="food-history-item-tag">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FoodHistory;
