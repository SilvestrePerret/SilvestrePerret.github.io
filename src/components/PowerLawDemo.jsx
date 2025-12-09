import { useState } from "react";

export default function PowerLawDemo() {
    const [exp, setExp] = useState(2);

    const value = (x) => Math.pow(x, exp);
    const data = Array.from({ length: 10 }, (_, i) => value(i + 1));

    return (
        <div>
            <label>
                Exponent:
                <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={exp}
                    onChange={(e) => setExp(parseFloat(e.target.value))}
                />
                {exp}
            </label>

            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
