import net from "net";
import readline from "readline";
import { parseOptions } from "../parse-options.js";

const options = process.argv.slice(2);

let host: string;
let port: number;

try {
  const opts = parseOptions(options);
  host = opts.host!;
  port = opts.port!;
} catch (err) {
  if (err instanceof Error) {
    console.error(`Options error: ${err.message}`);
  }
  process.exit(1);
}

function send(socket: net.Socket, action: string, data?: any): void {
  socket.write(JSON.stringify({ action, data }));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt("> ");

rl.question("Username: ", (username) => {
  const socket = net.createConnection({ host, port }, () => {
    send(socket, "user-join", { username });
    rl.prompt();
  });

  socket.setEncoding("utf8");

  rl.on("line", (line) => {
    send(socket, "user-msg", { username, msg: line });
    rl.prompt();
  });

  socket.on("data", (chunk: string) => {
    const { action, data } = JSON.parse(chunk);

    if (action === "user-join") {
      const { username } = data;
      console.log(`${username} has joined`);
    }

    if (action === "user-msg") {
      const { username, msg } = data;
      console.log(`${username}: ${msg}`);
    }

    if (action === "user-leave") {
      const { username } = data;
      console.log(`${username} left the chat.`);
    }

    rl.prompt();
  });

  socket.on("close", () => {
    console.log("Close connection.");
    rl.close();
  });

  socket.on("end", () => {
    console.log("The server ended the connection.");
    rl.close();
    process.exit(1);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });

  process.on("SIGINT", () => {
    socket.end();
    rl.close();
    process.exit(0);
  });
});
