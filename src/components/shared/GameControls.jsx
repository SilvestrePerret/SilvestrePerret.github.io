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
                    <p className="font-semibold my-0">Number of Games:</p>
                    <p className="text-accent my-0">{gameCount}</p>
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
                    <p className="font-semibold my-0">Coin Fairness (P(Heads)):</p>
                    <p className="text-accent my-0">{coinFairness.toFixed(2)}</p>
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
                    className="flex-1 rounded bg-accent px-4 py-2 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <p className="font-semibold text-background my-0">{isPlaying ? 'Playing...' : 'Play Games'}</p>
                </button>
                <button
                    onClick={onReset}
                    disabled={isPlaying}
                    className="rounded border border-border px-4 py-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <p className="my-0">Reset</p>
                </button>
            </div>
        </div>
    );
}
