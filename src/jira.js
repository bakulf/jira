import jiraClient from 'jira-client';
import fs from 'fs';
import ora from 'ora';

class Jira {
  constructor(program) {
    const opts = program.opts();
    this.configFile = opts.config;

    if (!fs.existsSync(this.configFile)) {
      console.log(`Config file ${this.configFile} does not exist.`);
      process.exit();
      return;
    }

    this._config = JSON.parse(fs.readFileSync(this.configFile));
    this._jiraClient = new jiraClient(this._config.jira);
  }

  get latestProject() {
    return this._config.latestProject || null
  }

  set latestProject(latestProject) {
    this._config.latestProject = latestProject;
  }

  get api() {
    return this._jiraClient;
  }

  get config() {
    return this._config;
  }

  get tableChars() {
    return {
      'top': ' ',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      'bottom': ' ',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      'left': ' ',
      'left-mid': '',
      'mid': '',
      'mid-mid': '',
      'right': '',
      'right-mid': '',
      'middle': ' '
    };
  }

  async spin(msg, promise) {
    const spinner = ora(msg).start();

    try {
      const result = await promise;
      return result;
    } catch (e) {
      throw e;
    } finally {
      spinner.stop();
    }
  }

  apiRequest(path, options = {}) {
    return this.api.doRequest(this.api.makeRequestHeader(this.api.makeUri({
      pathname: path,
    }), options));
  }

  apiAgileRequest(path, options = {}) {
    return this.api.doRequest(this.api.makeRequestHeader(this.api.makeAgileUri({
      pathname: path,
    }), options));
  }

  syncConfig() {
    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf8');
  }
};

export default Jira;