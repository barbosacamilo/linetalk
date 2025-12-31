import net from "node:net";
const users = new Map();
const server = net.createServer((socket) => {
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
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
function broadcast(sender, action, data) {
    for (const other of users.keys()) {
        if (other === sender)
            continue;
        send(other, action, data);
    }
}
function send(socket, action, data) {
    socket.write(JSON.stringify({ action, data }));
}
export function startServer(host, port) {
    server.listen(port, host, () => {
        console.log(`Host: ${host}:${port}`);
    });
    server.on("error", (err) => {
        console.error(`An error ocurred while starting the server. ${err}`);
        process.exit(1);
    });
}
