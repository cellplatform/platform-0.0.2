import { Test, expect, type t } from '../test.ui';
import { DenoHttp } from '.';

export default Test.describe('DenoHttp (Client)', (e) => {
  const http = DenoHttp.client({});

  e.describe(`${http.host} ↓`, (e) => {
    e.it('GET: projects.list', async (e) => {
      const projects = await http.projects.list();

      console.log('http', http);
      console.log('res:projects', projects);

      //
    });
  });
});
