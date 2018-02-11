const config = require("config");
const fs = require("fs");
const Util = require("cloudformation-z").Util;

module.exports = {
  AWSTemplateFormatVersion: "2010-09-09",
  Description: "CoderDojo Nagoya S3 for image files.",

  Resources: {
    DocumentBucket: {
      Type: "AWS::S3::Bucket",
      Properties: {
        BucketName: config.bucketName,
        WebsiteConfiguration: {
          IndexDocument: "index.html"
        }
      }
    },
    DocumentBucketPolicy: {
      Type: "AWS::S3::BucketPolicy",
      Properties: {
        Bucket: { Ref: "DocumentBucket" },
        PolicyDocument: {
          Id: "S3PolicyId1",
          Statement: [
            {
              Sid: "PublicRead",
              Effect: "Allow",
              Principal: "*",
              Action: "s3:GetObject",
              Resource: `arn:aws:s3:::${config.bucketName}/*`
            }
          ]
        }
      }
    }
  },
  Outputs: {
    DocumentBucket: {
      Value: {
        Ref: "DocumentBucket"
      }
    }
  }
};
