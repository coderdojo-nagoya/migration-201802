"use strict";

const C = require("./const");

module.exports = {
  stackName: `${C.SYSTEM}-${C.STAGE}-IMGREPO`,
  timeoutInMinutes: 10,
  tags: {
    System: C.SYSTEM,
    Stage: C.STAGE
  },
  //custom settings
  prefix: `${C.SYSTEM}-${C.STAGE}`,
  bucketName: "coder-dojo-nagoya-image"
};
