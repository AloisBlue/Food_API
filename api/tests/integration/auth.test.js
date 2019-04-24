import request from "supertest"
import {expect} from "chai";
import app from "../../index";

let Server;

describe('/api/menus/menu', () => {
  // eslint-disable-next-line
  beforeEach(() => { Server = app })
  afterEach(() => { Server.close();});

  describe('GET /menu', () => {
    it('should return all menu', (done) => {
      request(Server).get('/api/menus/menu')
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          done();
        })
    })
  })
})
