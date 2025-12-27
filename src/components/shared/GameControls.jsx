export default function GameControls({
    gameCount,
    onGameCountChange,
    coinFairness,
    onCoinFairnessChange,
    onPlay,
    onReset,
    isPlaying
}) {
    return (
        <div className="mb-6 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
            <div>
                <label className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">Number of Games:</span>
                    <span className="text-accent">{gameCount}</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="1000"
                    value={gameCount}
                    onChange={(e) => onGameCountChange(parseInt(e.target.value))}
                    className="w-full"
                    disabled={isPlaying}
                />
            </div>

            <div>
                <label className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">Coin Fairness (P(Heads)):</span>
                    <span className="text-accent">{coinFairness.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={coinFairness}
                    onChange={(e) => onCoinFairnessChange(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={isPlaying}
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onPlay}
                    disabled={isPlaying}
                    className="flex-1 rounded bg-accent px-4 py-2 font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPlaying ? 'Playing...' : 'Play Games'}
                </button>
                <button
                    onClick={onReset}
                    disabled={isPlaying}
                    className="rounded border border-border px-4 py-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
