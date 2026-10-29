/** The message of [error], whatever it is: an Error, an object with a message (an EngineError), or anything else */
export function messageOf(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) return String(error.message);
    return String(error);
}
