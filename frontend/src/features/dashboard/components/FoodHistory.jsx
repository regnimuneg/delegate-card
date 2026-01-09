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
        'Breakfast': '🌅',
        'Lunch': '🍽️',
        'Dinner': '🌙',
        'Snack': '☕'
    };
    return icons[mealType] || '🍴';
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
                <span className="food-history-empty-icon">🍽️</span>
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
                            <p className="food-history-item-location">📍 {record.location}</p>
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
