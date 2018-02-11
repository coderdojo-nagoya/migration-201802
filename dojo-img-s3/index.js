"use strict";
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

const CFNZ = require("cloudformation-z");
const config = require("config");
const template = require("./template/index");

const commander = new CFNZ.EasyCommander(config, template);
commander.exec(process.argv);