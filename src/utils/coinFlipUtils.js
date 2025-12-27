/**
 * Simulate a single coin flip
 * @param {number} probability - Probability of heads (0-1)
 * @returns {boolean} - true for heads, false for tails
 */
export function flipCoin(probability = 0.5) {
    return Math.random() < probability;
}

/**
 * Calculate statistics from an array of results
 * @param {number[]} results - Array of game results
 * @returns {Object} Statistics object
 */
export function calculateStats(results) {
    if (results.length === 0) {
        return { mean: 0, median: 0, min: 0, max: 0 };
    }

    const sorted = [...results].sort((a, b) => a - b);
    const sum = results.reduce((acc, val) => acc + val, 0);
    const mean = sum / results.length;
    const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    return { mean, median, min, max };
}

/**
 * Generate histogram bins from results
 * @param {number[]} results - Array of game results
 * @param {number[]} bins - Bin edges
 * @returns {Object} Histogram data with counts and percentages
 */
export function generateHistogram(results, bins) {
    const counts = new Array(bins.length).fill(0);

    results.forEach(result => {
        // Find which bin this result belongs to
        let binIndex = bins.length - 1; // Default to last bin

        for (let i = 0; i < bins.length; i++) {
            // Check if result falls into this bin
            const binValue = bins[i];
            const nextBinValue = i < bins.length - 1 ? bins[i + 1] : Infinity;

            if (result >= binValue && result < nextBinValue) {
                binIndex = i;
                break;
            }
            // For exact match with bin edge, put in current bin
            if (result === binValue) {
                binIndex = i;
                break;
            }
        }

        counts[binIndex]++;
    });

    const total = results.length;
    const percentages = counts.map(count => (count / total) * 100);

    return { bins, counts, percentages, values: results };
}
