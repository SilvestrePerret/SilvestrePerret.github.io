import { useState, useMemo } from "react";
import GameControls from "./shared/GameControls.jsx";
import StatsDisplay from "./shared/StatsDisplay.jsx";
import Histogram from "./shared/Histogram.jsx";
import { flipCoin, calculateStats, generateHistogram } from "../utils/coinFlipUtils.js";

export default function CoinFlipGameA() {
    const [gameCount, setGameCount] = useState(100);
    const [coinFairness, setCoinFairness] = useState(0.5);
    const [results, setResults] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFlip, setCurrentFlip] = useState(null);
    const [progress, setProgress] = useState(0);

    const FLIPS_PER_GAME = 100;
    const REWARD_PER_HEADS = 1;

    // Calculate expected value
    const expectedValue = FLIPS_PER_GAME * coinFairness * REWARD_PER_HEADS;

    // Simulate a single game
    const playOneGame = (probability) => {
        let reward = 0;
        for (let i = 0; i < FLIPS_PER_GAME; i++) {
            if (flipCoin(probability)) {
                reward += REWARD_PER_HEADS;
            }
        }
        return reward;
    };

    // Play all games
    const handlePlay = () => {
        setIsPlaying(true);
        setProgress(0);
        setCurrentFlip('flipping');

        // Simulate games with animation
        const newResults = [];
        const batchSize = 10;
        let completed = 0;

        const processBatch = () => {
            const remaining = gameCount - completed;
            const currentBatch = Math.min(batchSize, remaining);

            for (let i = 0; i < currentBatch; i++) {
                newResults.push(playOneGame(coinFairness));
                completed++;
            }

            setProgress((completed / gameCount) * 100);
            setCurrentFlip(Math.random() < coinFairness ? 'heads' : 'tails');

            if (completed < gameCount) {
                setTimeout(processBatch, 50);
            } else {
                setResults(newResults);
                setIsPlaying(false);
                setCurrentFlip(null);
                setProgress(0);
            }
        };

        processBatch();
    };

    const handleReset = () => {
        setResults([]);
    };

    // Calculate statistics
    const stats = useMemo(() => calculateStats(results), [results]);

    // Generate histogram data
    const histogramData = useMemo(() => {
        if (results.length === 0) return null;

        // Create bins from 0 to 100 in steps of 10
        const bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        return generateHistogram(results, bins);
    }, [results]);

    return (
        <div className="my-8 space-y-6 rounded-xl border-2 border-accent/30 bg-background p-6 shadow-lg">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-accent">Game A: Fixed Flips</h2>
                <p className="text-foreground/80">
                    You get {FLIPS_PER_GAME} coin tosses. Win ${REWARD_PER_HEADS} for each heads.
                </p>
            </div>

            {isPlaying && (
                <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-accent/50 bg-accent/5 p-6">
                    <div className="text-6xl animate-bounce">
                        {currentFlip === 'heads' ? '🟡' : currentFlip === 'tails' ? '⚪' : '🪙'}
                    </div>
                    <div className="text-lg font-semibold">
                        {currentFlip === 'flipping' ? 'Flipping...' : currentFlip === 'heads' ? 'HEADS!' : 'TAILS!'}
                    </div>
                    <div className="w-full">
                        <div className="mb-1 text-center text-sm">Progress: {Math.round(progress)}%</div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full bg-accent transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <GameControls
                gameCount={gameCount}
                onGameCountChange={setGameCount}
                coinFairness={coinFairness}
                onCoinFairnessChange={setCoinFairness}
                onPlay={handlePlay}
                onReset={handleReset}
                isPlaying={isPlaying}
            />

            {results.length > 0 && (
                <>
                    <StatsDisplay stats={stats} expectedValue={expectedValue} />
                    <Histogram
                        data={histogramData}
                        title="Distribution of Rewards"
                    />
                </>
            )}
        </div>
    );
}
