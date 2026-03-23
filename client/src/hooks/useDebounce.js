import { useState, useEffect } from 'react';

// This custom hook takes a value and a delay time
export const useDebounce = (value, delay) => {
    // State to store the debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer that will update the debounced value after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // This is the cleanup function. It cancels the previous timer if the user types again.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Re-run only if value or delay changes

    return debouncedValue;
};