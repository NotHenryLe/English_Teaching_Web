// Máy chủ SMTP giả: nhận email xác thực / đặt lại mật khẩu từ Auth cục bộ và lưu ra thư mục .mail/
// để test đọc đường link trong email. Không gửi email thật.
import net from "node:net";
import { mkdirSync, writeFileSync } from "node:fs";

const dir = new URL("./.mail/", import.meta.url);
mkdirSync(dir, { recursive: true });
let counter = 0;

net
  .createServer((socket) => {
    let buffer = "";
    let inData = false;
    let message = { to: [], data: "" };
    socket.write("220 local mail sink\r\n");
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      for (;;) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end === -1) return;
          message.data = buffer.slice(0, end);
          buffer = buffer.slice(end + 5);
          inData = false;
          const name = `${Date.now()}-${String(++counter).padStart(4, "0")}.eml`;
          writeFileSync(new URL(name, dir), `X-Rcpt-To: ${message.to.join(", ")}\r\n${message.data}`);
          message = { to: [], data: "" };
          socket.write("250 queued\r\n");
          continue;
        }
        const eol = buffer.indexOf("\r\n");
        if (eol === -1) return;
        const line = buffer.slice(0, eol);
        buffer = buffer.slice(eol + 2);
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === "EHLO" || cmd === "HELO") socket.write("250-local\r\n250 8BITMIME\r\n");
        else if (cmd === "RCPT") (message.to.push(line.replace(/^RCPT TO:\s*/i, "").replace(/[<>]/g, "")), socket.write("250 ok\r\n"));
        else if (cmd === "DATA") ((inData = true), socket.write("354 go ahead\r\n"));
        else if (cmd === "QUIT") (socket.write("221 bye\r\n"), socket.end());
        else socket.write("250 ok\r\n");
      }
    });
    socket.on("error", () => {});
  })
  .listen(54325, "0.0.0.0", () => console.log("mail sink on :54325 →", dir.pathname));
