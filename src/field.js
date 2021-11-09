import color from 'chalk';
import Table from 'cli-table3';

import Command from './command.js';
import ErrorHandler from './errorhandler.js';
import Jira from './jira.js';

class Field extends Command {
  addOptions(program) {
    const cmd = program.command("field")
      .description("Do things related to issue fields")
    cmd.command("listall")
      .description("Show the list of fields")
      .action(async () => {
        const jira = new Jira(program);

        let resultFields;
        try {
          resultFields = await Field.listFields(jira);
        } catch (e) {
          ErrorHandler.showError(jira, e);
          return;
        }

        const table = new Table({
          chars: jira.tableChars,
          head: ['Name', 'Supported', 'Type']
        });

        resultFields.forEach(field => {
          const supported = Field.isSupported(field.schema?.type);
          table.push([color.blue(field.name), supported, supported ? field.schema?.type : ""]);
        });
        console.log(table.toString());
      });

    cmd.command("add")
      .description("Add a custom field to be shown")
      .argument('<field>', 'The field name')
      .action(async fieldName => {
        const jira = new Jira(program);

        let resultFields;
        try {
          resultFields = await Field.listFields(jira);
        } catch (e) {
          ErrorHandler.showError(jira, e);
          return;
        }

        const fieldData = resultFields.find(field => field.name === fieldName);
        if (!fieldData) {
          console.log("Unknown field.");
          return;
        }

        if (!Field.isSupported(fieldData.schema?.type)) {
          console.log("Unsupported field.");
          return;
        }

        jira.addField(fieldName);
        jira.syncConfig();

        console.log('Config file succesfully updated');
      });

    cmd.command("remove")
      .description("Remove a custom field")
      .argument('<field>', 'The field name')
      .action(async fieldName => {
        const jira = new Jira(program);

        if (!jira.fields.includes(fieldName)) {
          console.log("Unknown field.");
          return;
        }

        jira.removeField(fieldName);
        jira.syncConfig();

        console.log('Config file succesfully updated');
      });

    cmd.command("list")
      .description("List the supported custom field")
      .action(async () => {
        const jira = new Jira(program);

        const table = new Table({
          chars: jira.tableChars,
          head: ['Name']
        });

        jira.fields.forEach(fieldName => table.push([color.blue(fieldName)]));
        console.log(table.toString());
      });
  }

  static async listFields(jira) {
    return await jira.spin('Retrieving the fields...', jira.api.listFields());
  }

  static isSupported(fieldType) {
    return ["string", "number"].includes(fieldType);
  }

  static async getFieldDataIfSupported(jira, fieldName) {
    let resultFields;
    try {
      resultFields = await Field.listFields(jira);
    } catch (e) {
      ErrorHandler.showError(jira, e);
      return null;
    }

    let fieldData;
    resultFields.forEach(field => {
      if (field.name === fieldName) fieldData = field;
    });

    if (!fieldData) {
      console.log(`Unable to find the field "${fieldName}"`);
      return null;
    }

    if (!Field.isSupported(fieldData.schema?.type)) {
      console.log("Unsupported field");
      return null;
    }

    let type;
    switch (fieldData.schema.type) {
      case 'number':
        type = 'number';
        break;
      case 'string':
        type = 'input';
        break;
    }

    return {
      type,
      key: fieldData.key
    };
  }
};

export default Field;