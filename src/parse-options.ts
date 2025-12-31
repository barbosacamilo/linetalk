interface Options {
  host?: string;
  port?: number;
}

const DEFAULT_OPTIONS: Options = {
  host: "127.0.0.1",
  port: 9000,
};

type OptionKey = keyof Options;

const OPTIONS_PARSER_MAP: Record<OptionKey, (arg: any) => any> = {
  port: parsePort,
  host: parseHost,
};

export function parseOptions(opts: string[]): Options {
  const options: Options = { ...DEFAULT_OPTIONS };

  for (const opt of opts) {
    const [flag, value] = opt.split("=", 2);

    if (!flag || value == null) {
      throw new Error("Option must have the format `--name=value`");
    }

    if (!flag.startsWith("--")) {
      throw new Error("Option must start with `--` (e.g. --port=9000)");
    }

    const name = flag.slice(2); // "--port" -> "port"

    if (!(name in OPTIONS_PARSER_MAP)) {
      throw new Error(`Unknown option: ${flag}`);
    }

    const key = name as OptionKey;
    const parser = OPTIONS_PARSER_MAP[key];
    options[key] = parser(value);
  }

  return options;
}

function parsePort(arg: string): number {
  const errMsg =
    "Option `--port` must be a valid integer in the range 1..65535";

  const port = Number(arg);

  if (!Number.isInteger(port)) {
    throw new Error(errMsg);
  }

  if (port < 1 || port > 65535) {
    throw new Error(errMsg);
  }

  return port;
}

function parseHost(arg: string): string {
  const errMsg =
    "Option `--host` must be an IPv4 address like x.x.x.x where x is 0..255";

  const parts = arg.split(".");
  if (parts.length !== 4) {
    throw new Error(errMsg);
  }

  for (const p of parts) {
    if (p.length === 0) {
      throw new Error(errMsg);
    }

    if (!/^\d+$/.test(p)) {
      throw new Error(errMsg);
    }

    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) {
      throw new Error(errMsg);
    }
  }

  return arg;
}
