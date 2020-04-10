'use strict';

module.exports = (registry, topic, schemaString, type = 'value', runId = '') => new Promise((resolve, reject) => {
  const { protocol, host, port, path, username, password } = registry;
  const body = JSON.stringify({schema: schemaString});
  const requestOptions = {
    host: host,
    port: port,
    method: 'POST',
    path: `${path}subjects/${topic}-${type}/versions`,
    headers: {
      'Content-Type': 'application/vnd.schemaregistry.v1+json',
      'Content-Length': Buffer.byteLength(body),
    },
    auth: username && password ? `${username}:${password}` : null,
  };

  console.log(`Run Id: ${runId}, requestOptions: ${JSON.stringify(requestOptions)}`);
  

  const req = protocol.request(requestOptions, (res) => {
    let data = '';
    res.on('data', (d) => {
      data += d;
    });
    res.on('error', (e) => {
      reject(e);
    });
    res.on('end', () => {
      if (res.statusCode !== 200) {
        const error = JSON.parse(data);
        console.log(`Run Id: ${runId}, error: ${JSON.stringify(error)}`);
        return reject(new Error(`Schema registry error: ${error.error_code} - ${error.message}`));
      }

      const resp = JSON.parse(data);
      console.log(`Run Id: ${runId}, resp: ${JSON.stringify(resp)}`);
      
      resolve(resp.id);
    });
  }).on('error', (e) => {
    reject(e);
  });
  req.write(body);
  req.end();
});
