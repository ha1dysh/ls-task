import { spawn } from "node:child_process";
import * as http from 'node:http';
import * as fsPromises from "node:fs/promises";
import * as path from 'node:path';
import { Stream } from 'node:stream';

import * as express from 'express';
import { Request, Response } from 'express';
import { Server, Socket } from 'socket.io';

const app = express()
const server = http.createServer(app)
const io = new Server(server);
const LS = "ls";
const CURR_DIR = __dirname;
const DATA_DIR = path.resolve(CURR_DIR, "data");
const FORBIDDEN_OPTIONS = ["&&", ";", "|", "`", ",", "'", '"'];
const ALLOWED_SHORT_OPTIONS = "aAbBcCdDfFgGhHiIlLmMnNoOpPqQrRsStTuUvVwWxX1Z";
const ALLOWED_LONG_OPTIONS = [
  "--all",
  "--almost-all",
  "--author",
  "--escape",
  "--block-size",
  "--ignore-backups",
  "--directory",
  "--dired",
  "--classify",
  "--file-type",
  "--format",
  "--full-time",
  "--group-directories-first",
  "--no-group",
  "--human-readable",
  "--si",
  "--dereference-command-line",
  "--dereference-command-line-symlink-to-dir",
  "--hide",
  "--hyperlink",
  "--indicator-style",
  "--inode",
  "--ignore",
  "--kibibytes",
  "--literal",
  "--hide-control-chars",
  "--show-control-chars",
  "--quote-name",
  "--quoting-style",
  "--reverse",
  "--recursive",
  "--size",
  "--sort",
  "--time",
  "--time-style",
  "--tabsize",
  "--width",
  "--context",
  "--zero",
  "--help",
  "--version",
];

function validateCommand(command: string) {
  const parts = command.trim().split(" ");

  if (parts[0] !== LS) {
    return false;
  }
  for (let i = 1; i < parts.length; i++) {
    for (const forbidden of FORBIDDEN_OPTIONS) {
      if (parts[i].includes(forbidden)) {
        return false;
      }
    }
    if (parts[i].startsWith("--")) {
      if (!ALLOWED_LONG_OPTIONS.includes(parts[i])) {
        return false;
      }
    } else if (parts[i].startsWith("-")) {
      for (let j = 1; j < parts[i].length; j++) {
        if (!ALLOWED_SHORT_OPTIONS.includes(parts[i][j])) {
          return false;
        }
      }
    } else {
      continue;
    }
  }

  return true;
}
async function checkIfPathExist(dirPath: string) {
  try {
    await fsPromises.access(dirPath);
    return true;
  } catch {
    return false;
  }
}
async function checkIfDirectory(dirPath: string) {
  const stat = await fsPromises.stat(dirPath);
  return stat.isDirectory();
}
async function performLsCommand(command: string): Promise<string> {
  const commandOptions = command.toString().split(" ").slice(1);
  const dirPath = commandOptions.find((option) => !option.startsWith("-")) || DATA_DIR;

  if (!(await checkIfPathExist(dirPath))) {
    throw new Error("Dir or file does not exist");
  }

  if (!(await checkIfDirectory(dirPath))) {
    throw new Error("Invalid path or not a directory");
  }

  return new Promise((resolve, reject) => {
    const ls = spawn(LS, commandOptions);
    let dataRes = '';
    let errRes = '';

    ls.stdout.on("data", (data: Stream) => {
      dataRes += data;
    });

    ls.stderr.on("data", (err: Stream) => {
      errRes += err;
    });

    ls.on('exit', () => {
      if (errRes) {
        reject(new Error(errRes));
      } else {
        resolve(dataRes);
      }
    });
  });
}

type TSocketMessage = Partial<{
  command: null | string
  data: null | string
  code: number
  error: null | string
}>
const socketResponse = 
  ({command = null, data = null, code = 201, error = null}:TSocketMessage) => 
    ({ command, code, data, error })

io.on('connection', (socket: Socket) => {
  socket.on('command', async ({command}) => {
    
    try {
      if (!validateCommand(command)) {
        return io.emit('command', socketResponse({command, code: 400, error: 'wrong command'}));
      }
      const res = await performLsCommand(command);
      
      return io.emit('command', socketResponse({command, data: res}));
    } catch (error) {
      if (error instanceof Error) {
        return io.emit('command', socketResponse({command,  code: 500, error: error.message }));
      }
      io.emit('command', {error: 'Everything went wrong!', code: 500})
    }

  });
});

app.use((req: Request, res: Response) => {
  res.status(404).send(JSON.stringify({ error: "Not found" }));
})
app.use((error: Error, req: Request, res: Response) => {
  res.status(500).send(JSON.stringify(error));
});
server.listen(3000);
