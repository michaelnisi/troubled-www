
var Writer = require('fstream-s3').Writer,
fstream = require('fstream'),
writer = new Writer({
  accessKeyId: 'AKIAIIYDVI5R75TJF5HQ', 
  secretAccessKey: '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', 
  bucket: 'michaelnisi.com', 
  region: 'EU_WEST_1',
  baseDir: '.' }),
  reader = fstream.Reader({path: '/tmp/troubled-site', type: 'Directory'});

  reader.pipe(writer);
