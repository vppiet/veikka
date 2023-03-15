declare class SubstringTooLargeForLineError extends Error {}

export class WordTooLargeForLineError extends SubstringTooLargeForLineError {}
export class GraphemeTooLargeForLineError extends SubstringTooLargeForLineError {}
export class CodepointTooLargeForLineError extends SubstringTooLargeForLineError {}
export function lineBreak(): void;
export function wordBreak(): void;
