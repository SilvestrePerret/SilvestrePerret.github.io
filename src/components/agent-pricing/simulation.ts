export interface ModelConfig {
  modelId: string;
  uncachedInputPerM: number;
  cachedInputPerM: number;
  cacheWritePerM: number;
  outputPerM: number;
}

export type ToolType = "read_file" | "edit_file" | "run_command";

export interface ToolProfile {
  requestTokens: number;
  resultTokens: number;
}

export interface ReasoningProfile {
  callShare: number;
  tokensPerReasoningCall: number;
}

export interface WorkflowShape {
  userTurns: number;
  toolCallsPerTurn: number;
  toolMix: Record<ToolType, number>;
  tools: Record<ToolType, ToolProfile>;
  systemPromptTokens: number;
  userMessageTokens: number;
  finalAnswerTokens: number;
  reasoning: ReasoningProfile;
}

export type Operation =
  | "cachedInput"
  | "cacheWrite"
  | "uncachedInput"
  | "output";

export interface SimulationOptions {
  cacheEnabled: boolean;
}

export interface OutputBreakdown {
  reasoning: number;
  toolRequest: number;
  finalAnswer: number;
}

export interface LlmCall {
  index: number;
  turn: number;
  label: string;
  tokens: Record<Operation, number>;
  outputBreakdown: OutputBreakdown;
  cost: Record<Operation, number>;
  totalCost: number;
  contextLength: number;
}

export interface SimulationResult {
  model: ModelConfig;
  operations: Operation[];
  calls: LlmCall[];
  totalCost: number;
  totalCostByOperation: Record<Operation, number>;
  totalTokensByOperation: Record<Operation, number>;
}

export const OPERATIONS: Operation[] = [
  "cachedInput",
  "cacheWrite",
  "uncachedInput",
  "output",
];

export const OPERATION_META: Record<
  Operation,
  {
    label: string;
    fillClass: string;
    swatchClass: string;
    strokeClass: string;
  }
> = {
  cachedInput: {
    label: "Cached input",
    fillClass: "fill-sky-500",
    swatchClass: "bg-sky-500",
    strokeClass: "stroke-sky-500",
  },
  cacheWrite: {
    label: "Cache write",
    fillClass: "fill-amber-500",
    swatchClass: "bg-amber-500",
    strokeClass: "stroke-amber-500",
  },
  uncachedInput: {
    label: "Uncached input",
    fillClass: "fill-emerald-500",
    swatchClass: "bg-emerald-500",
    strokeClass: "stroke-emerald-500",
  },
  output: {
    label: "Output",
    fillClass: "fill-rose-500",
    swatchClass: "bg-rose-500",
    strokeClass: "stroke-rose-500",
  },
};

export const TOOL_TYPES: ToolType[] = ["read_file", "edit_file", "run_command"];

export const CACHE_MINIMUM_TOKENS = 1_024;

export const MODEL_PRESETS: Record<string, ModelConfig> = {
  "Claude Fable 5": {
    modelId: "claude-fable-5",
    uncachedInputPerM: 10,
    outputPerM: 50,
    cachedInputPerM: 1,
    cacheWritePerM: 12.5,
  },
  "Claude Opus 4.8": {
    modelId: "claude-opus-4.8",
    uncachedInputPerM: 5,
    outputPerM: 25,
    cachedInputPerM: 0.5,
    cacheWritePerM: 6.25,
  },
  "GPT-5.6 Sol": {
    modelId: "gpt-5.6-sol",
    uncachedInputPerM: 5,
    outputPerM: 30,
    cachedInputPerM: 0.5,
    cacheWritePerM: 6.25,
  },
};

export const DEFAULT_WORKFLOW: WorkflowShape = {
  userTurns: 3,
  toolCallsPerTurn: 12,
  systemPromptTokens: 10_000,
  userMessageTokens: 300,
  finalAnswerTokens: 400,
  reasoning: { callShare: 0.5, tokensPerReasoningCall: 250 },
  tools: {
    read_file: { requestTokens: 120, resultTokens: 1_500 },
    edit_file: { requestTokens: 160, resultTokens: 100 },
    run_command: { requestTokens: 100, resultTokens: 500 },
  },
  toolMix: { read_file: 0.5, edit_file: 0.3, run_command: 0.2 },
};

const emptyOperationRecord = (): Record<Operation, number> => ({
  uncachedInput: 0,
  output: 0,
  cachedInput: 0,
  cacheWrite: 0,
});

const priceForOperation = (
  model: ModelConfig,
  operation: Operation
): number => {
  const prices: Record<Operation, number> = {
    uncachedInput: model.uncachedInputPerM,
    output: model.outputPerM,
    cachedInput: model.cachedInputPerM,
    cacheWrite: model.cacheWritePerM,
  };
  return prices[operation];
};

const createToolPicker = (mix: Record<ToolType, number>) => {
  const counts: Record<ToolType, number> = {
    read_file: 0,
    edit_file: 0,
    run_command: 0,
  };
  let totalPicks = 0;

  return (): ToolType => {
    totalPicks += 1;
    const selected = TOOL_TYPES.reduce((best, toolType) => {
      const score = mix[toolType] * totalPicks - counts[toolType];
      const bestScore = mix[best] * totalPicks - counts[best];
      return score > bestScore ? toolType : best;
    });
    counts[selected] += 1;
    return selected;
  };
};

const createReasoningPicker = (profile: ReasoningProfile) => {
  let selectedCalls = 0;
  let totalCalls = 0;

  return (): boolean => {
    totalCalls += 1;
    const target = Math.round(totalCalls * profile.callShare);
    if (selectedCalls >= target) return false;
    selectedCalls += 1;
    return true;
  };
};

interface ConversationCall {
  turn: number;
  label: string;
  previousPrefixTokens: number;
  newSuffixTokens: number;
  outputBreakdown: OutputBreakdown;
}

function generateConversation(shape: WorkflowShape): ConversationCall[] {
  const calls: ConversationCall[] = [];
  let previousPrefixTokens = 0;
  let pendingTokens = shape.systemPromptTokens;
  const pickTool = createToolPicker(shape.toolMix);
  const includesReasoning = createReasoningPicker(shape.reasoning);

  for (let turn = 1; turn <= shape.userTurns; turn += 1) {
    pendingTokens += shape.userMessageTokens;

    for (let step = 0; step < shape.toolCallsPerTurn; step += 1) {
      const toolType = pickTool();
      const reasoning = includesReasoning()
        ? shape.reasoning.tokensPerReasoningCall
        : 0;
      const outputBreakdown = {
        reasoning,
        toolRequest: shape.tools[toolType].requestTokens,
        finalAnswer: 0,
      };
      calls.push({
        turn,
        label: `Tool: ${toolType}`,
        previousPrefixTokens,
        newSuffixTokens: pendingTokens,
        outputBreakdown,
      });
      previousPrefixTokens += pendingTokens;
      pendingTokens =
        reasoning +
        shape.tools[toolType].requestTokens +
        shape.tools[toolType].resultTokens;
    }

    const reasoning = includesReasoning()
      ? shape.reasoning.tokensPerReasoningCall
      : 0;
    calls.push({
      turn,
      label: `End of turn ${turn}`,
      previousPrefixTokens,
      newSuffixTokens: pendingTokens,
      outputBreakdown: {
        reasoning,
        toolRequest: 0,
        finalAnswer: shape.finalAnswerTokens,
      },
    });
    previousPrefixTokens += pendingTokens;
    pendingTokens = reasoning + shape.finalAnswerTokens;
  }
  return calls;
}

const classifyTokens = (
  model: ModelConfig,
  call: ConversationCall,
  options: SimulationOptions
): Record<Operation, number> => {
  const promptTokens = call.previousPrefixTokens + call.newSuffixTokens;
  const outputTokens = Object.values(call.outputBreakdown).reduce(
    (total, tokens) => total + tokens,
    0
  );
  if (!options.cacheEnabled) {
    return {
      cachedInput: 0,
      cacheWrite: 0,
      uncachedInput: promptTokens,
      output: outputTokens,
    };
  }

  if (promptTokens < CACHE_MINIMUM_TOKENS) {
    return {
      uncachedInput: promptTokens,
      cachedInput: 0,
      cacheWrite: 0,
      output: outputTokens,
    };
  }

  const hasReusablePrefix = call.previousPrefixTokens >= CACHE_MINIMUM_TOKENS;
  return {
    cachedInput: hasReusablePrefix ? call.previousPrefixTokens : 0,
    cacheWrite: hasReusablePrefix ? call.newSuffixTokens : promptTokens,
    uncachedInput: 0,
    output: outputTokens,
  };
};

export function simulate(
  model: ModelConfig,
  shape: WorkflowShape,
  options: SimulationOptions
): SimulationResult {
  const calls = generateConversation(shape).map((conversationCall, index) => {
    const tokens = classifyTokens(model, conversationCall, options);
    const cost = emptyOperationRecord();
    for (const operation of OPERATIONS) {
      cost[operation] =
        (tokens[operation] * priceForOperation(model, operation)) / 1_000_000;
    }
    return {
      index: index + 1,
      turn: conversationCall.turn,
      label: conversationCall.label,
      tokens,
      outputBreakdown: conversationCall.outputBreakdown,
      cost,
      totalCost: OPERATIONS.reduce(
        (sum, operation) => sum + cost[operation],
        0
      ),
      contextLength:
        conversationCall.previousPrefixTokens +
        conversationCall.newSuffixTokens +
        tokens.output,
    };
  });

  const totalCostByOperation = emptyOperationRecord();
  const totalTokensByOperation = emptyOperationRecord();
  let cumulativeCost = 0;

  for (const call of calls) {
    for (const operation of OPERATIONS) {
      totalCostByOperation[operation] += call.cost[operation];
      totalTokensByOperation[operation] += call.tokens[operation];
    }
    cumulativeCost += call.totalCost;
  }

  return {
    model,
    operations: OPERATIONS,
    calls,
    totalCost: cumulativeCost,
    totalCostByOperation,
    totalTokensByOperation,
  };
}

export function formatUsd(value: number): string {
  if (value === 0) return "$0.00";
  return value < 0.01 ? `$${value.toFixed(4)}` : `$${value.toFixed(2)}`;
}

export function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return Math.round(value).toString();
}
