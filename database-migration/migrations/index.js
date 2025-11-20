// All database migrations in execution order
const enums = require('./01-enums');
const coreTables = require('./02-core-tables');
const financialTables = require('./03-financial-tables');
const systemTables = require('./04-system-tables');
const functions = require('./05-functions');
const triggers = require('./06-triggers');
const views = require('./07-views');
const initialData = require('./08-initial-data');
const indexes = require('./09-indexes');

module.exports = [
  enums,
  coreTables,
  financialTables,
  systemTables,
  functions,
  triggers,
  views,
  initialData,
  indexes
];
