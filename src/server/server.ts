import net from "node:net";

type User = {
  username: string;
};

const users = new Map<net.Socket, User>();

const server = net.createServer((socket) => {
  socket.setEncoding("utf8");

  socket.on("data", (chunk: string) => {
    const { action, data } = JSON.parse(chunk);

    if (action === "user-join") {
      const { username } = data;
      users.set(socket, { username });
      broadcast(socket, "user-join", { username });
      return;
    }

    if (action === "user-msg") {
      const { username, msg } = data;
      broadcast(socket, "user-msg", { username, msg });
      return;
    }
  });

  socket.on("close", () => {
    const user = users.get(socket);
    broadcast(socket, "user-leave", { username: user?.username });
    users.delete(socket);
  });
});

function broadcast(sender: net.Socket, action: string, data: any): void {
  for (const other of users.keys()) {
    if (other === sender) continue;
    send(other, action, data);
  }
}

function send(socket: net.Socket, action: string, data?: any): void {
  socket.write(JSON.stringify({ action, data }));
}

export function startServer(host: string, port: number) {
  server.listen(port, host, () => {
    console.log(`Host: ${host}:${port}`);
  });

  server.on("error", (err) => {
    console.error(`An error ocurred while starting the server. ${err}`);
    process.exit(1);
  });
}
