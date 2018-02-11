"use strict";

module.exports = {
  SYSTEM: "DOJO",
  STAGE: (process.env.NODE_ENV || "DEV").toUpperCase()
};
