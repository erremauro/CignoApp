type tColor = {
  green: string,
  blue: string,
  cyan: string,
  red: string,
  magenta: string,
  yellow: string
}

type tLevel = {
  info: string,
  error: string,
  success: string,
  warn: string,
  debug: string
}

const COLORS: tColor = {
  green: "#adca91",
  blue: "#83bbed",
  cyan: "#7dbfcb",
  red: "#d98587",
  magenta: "#c894de",
  yellow: "#d3ac80",
}

const LEVEL_COLORS: tLevel = {
  info: COLORS.blue,
  error: COLORS.red,
  success: COLORS.green,
  warn: COLORS.yellow,
  debug: COLORS.magenta,
}

function logWith(level: keyof tLevel, message: string, ...args: any[]) {
  console.log(`%c[CignoApp] %c${level}  %c${message}`, "color: #c894de", `color: ${LEVEL_COLORS[level]}`, "color: reset", ...args);
}

function info(message: string, ...args: any[]) {
  logWith("info", message, ...args);
}

function success(message: string, ...args: any[]) {
  logWith("success", message, ...args);
}

function error(message: string, ...args: any[]) {
  logWith("error", message, ...args);
}

function warn(message: string, ...args: any[]) {
  logWith("warn", message, ...args);
}

function debug(message: string, ...args: any[]) {
  logWith("debug", message, ...args);
}

export default {
  logWith,
  info,
  success,
  error,
  warn,
  debug,
}