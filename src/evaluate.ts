/**
 * Safe expression evaluator using the shunting-yard algorithm.
 * Replaces eval() for arithmetic and comparison expressions.
 */

type Token = { type: 'number'; value: number } | { type: 'operator'; value: string };

const OPERATORS: Record<string, { precedence: number; associativity: 'left' | 'right' }> = {
    '||': { precedence: 1, associativity: 'left' },
    '&&': { precedence: 2, associativity: 'left' },
    '==': { precedence: 3, associativity: 'left' },
    '!=': { precedence: 3, associativity: 'left' },
    '<': { precedence: 4, associativity: 'left' },
    '>': { precedence: 4, associativity: 'left' },
    '<=': { precedence: 4, associativity: 'left' },
    '>=': { precedence: 4, associativity: 'left' },
    '+': { precedence: 5, associativity: 'left' },
    '-': { precedence: 5, associativity: 'left' },
    '*': { precedence: 6, associativity: 'left' },
    '/': { precedence: 6, associativity: 'left' },
    '%': { precedence: 6, associativity: 'left' },
};

/**
 * Tokenize an expression string into numbers and operators.
 */
function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const str = expr.trim();

    while (i < str.length) {
        // Skip whitespace
        if (/\s/.test(str[i])) {
            i++;
            continue;
        }

        // Check for multi-character operators first
        if (i + 1 < str.length) {
            const twoChar = str.slice(i, i + 2);
            if (OPERATORS[twoChar]) {
                tokens.push({ type: 'operator', value: twoChar });
                i += 2;
                continue;
            }
        }

        // Single character operators
        if (OPERATORS[str[i]]) {
            tokens.push({ type: 'operator', value: str[i] });
            i++;
            continue;
        }

        // Numbers (including negative numbers at start or after operator)
        if (/[\d.]/.test(str[i]) ||
            (str[i] === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'operator'))) {
            let numStr = '';
            if (str[i] === '-') {
                numStr = '-';
                i++;
            }
            while (i < str.length && /[\d.]/.test(str[i])) {
                numStr += str[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseFloat(numStr) });
            continue;
        }

        // Unknown character - skip
        i++;
    }

    return tokens;
}

/**
 * Convert infix tokens to Reverse Polish Notation (postfix) using shunting-yard.
 */
function toRPN(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            output.push(token);
        } else if (token.type === 'operator') {
            const o1 = token.value;
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type !== 'operator') break;
                const o2 = top.value;
                const o1Info = OPERATORS[o1];
                const o2Info = OPERATORS[o2];
                if (!o1Info || !o2Info) break;

                if ((o1Info.associativity === 'left' && o1Info.precedence <= o2Info.precedence) ||
                    (o1Info.associativity === 'right' && o1Info.precedence < o2Info.precedence)) {
                    output.push(operatorStack.pop()!);
                } else {
                    break;
                }
            }
            operatorStack.push(token);
        }
    }

    // Pop remaining operators
    while (operatorStack.length > 0) {
        output.push(operatorStack.pop()!);
    }

    return output;
}

/**
 * Evaluate an RPN expression.
 */
function evaluateRPN(tokens: Token[]): number {
    const stack: number[] = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            stack.push(token.value);
        } else if (token.type === 'operator') {
            const b = stack.pop() ?? 0;
            const a = stack.pop() ?? 0;

            switch (token.value) {
                case '+': stack.push(a + b); break;
                case '-': stack.push(a - b); break;
                case '*': stack.push(a * b); break;
                case '/': stack.push(b === 0 ? 0 : a / b); break;
                case '%': stack.push(b === 0 ? 0 : a % b); break;
                case '<': stack.push(a < b ? 1 : 0); break;
                case '>': stack.push(a > b ? 1 : 0); break;
                case '<=': stack.push(a <= b ? 1 : 0); break;
                case '>=': stack.push(a >= b ? 1 : 0); break;
                case '==': stack.push(a === b ? 1 : 0); break;
                case '!=': stack.push(a !== b ? 1 : 0); break;
                case '&&': stack.push(a && b ? 1 : 0); break;
                case '||': stack.push(a || b ? 1 : 0); break;
                default: stack.push(0);
            }
        }
    }

    return stack.length > 0 ? stack[0] : 0;
}

/**
 * Safely evaluate a mathematical expression string.
 * Supports: +, -, *, /, %, <, >, <=, >=, ==, !=, &&, ||
 * 
 * @param expr - Expression string like "10 + 5 * 2"
 * @returns The numeric result
 */
export function safeEvaluate(expr: string): number {
    if (!expr || typeof expr !== 'string') {
        return 0;
    }

    try {
        const tokens = tokenize(expr);
        if (tokens.length === 0) return 0;
        if (tokens.length === 1 && tokens[0].type === 'number') {
            return tokens[0].value;
        }
        const rpn = toRPN(tokens);
        return evaluateRPN(rpn);
    } catch {
        return 0;
    }
}
