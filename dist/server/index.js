import { parseOptions } from "../parse-options.js";
import { startServer } from "./server.js";
const options = process.argv.slice(2);
const { host, port } = parseOptions(options);
startServer(host, port);
