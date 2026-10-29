/**
 * Branded colours matched to the dashboard UI.
 */
export const COLOURS = {
  PURPLE: "#8b5cf6",
  BLUE: "#5ba4cf",
  ORANGE: "#c46b1a",
  RED: "#a03030",
  PEACH: "#f4845f",
};

/**
 * Applies a custom hex colour to the foreground (text).
 */
export const hex = (code: string, text: string) => {
  const r = parseInt(code.slice(1, 3), 16);
  const g = parseInt(code.slice(3, 5), 16);
  const b = parseInt(code.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

/**
 * Applies a custom hex colour to the background with bold white text.
 */
export const hexBg = (code: string, text: string) => {
  const r = parseInt(code.slice(1, 3), 16);
  const g = parseInt(code.slice(3, 5), 16);
  const b = parseInt(code.slice(5, 7), 16);
  return `\x1b[48;2;${r};${g};${b}m\x1b[37m\x1b[1m ${text} \x1b[0m`;
};

/**
 * Pads a string equally on both sides to reach a target width.
 */
export const centerText = (text: string, width: number) => {
  const label = text.toUpperCase();
  const padding = Math.max(0, width - label.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return " ".repeat(leftPad) + label + " ".repeat(rightPad);
};
