import program from 'commander';
import os from 'os';
import path from 'path';

import Init from './init.js';
import Issue from './issue.js';
import Project from './project.js';
import Query from './query.js';

const DEFAULT_CONFIG_FILE = path.join(os.homedir(), ".jira.json")

const commands = [
  new Init(),
  new Issue(),
  new Project(),
  new Query(),
];

program.version("0.0.1")

program.option('-c, --config <file>',
               `config file. Default: ${DEFAULT_CONFIG_FILE}`,
               DEFAULT_CONFIG_FILE)
commands.forEach(command => command.addOptions(program));

program.parseAsync(process.argv);
