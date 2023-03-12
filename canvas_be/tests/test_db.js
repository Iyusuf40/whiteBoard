const assert = require('assert');
const dbClient = require('../utils/dbClient');

function waitConnection() {
  return new Promise((resolve, reject) => {
    let i = 0;
    async function repeatFct() {
      setTimeout(async () => {
        i += 1;
        if (i >= 10) {
          reject();
        } else if (!dbClient.isAlive()) {
          await repeatFct();
        } else {
          resolve();
        }
      }, 30);
    }
    repeatFct();
  });
}

after(() => {
  dbClient.db.dropDatabase();
});

describe('test dbClient user collection', () => {
  it('should save a user', async () => {
    await waitConnection();
    const userCont = await dbClient.usersCollection.find({}).toArray();
    const savedUserId = await dbClient.saveUser({ id: 'id', key: 'key' });
    const afterSave = await dbClient.usersCollection.find({}).toArray();
    assert(afterSave.length > userCont.length);
  });

  it('should find a user', async () => {
    await waitConnection();
    const user = await dbClient.findByColAndFilter('users', 'key', 'not exist');
    assert(!user);
    await dbClient.saveUser({ id: 'id', key: 'key' });
    const afterSave = await dbClient.findByColAndFilter('users', 'id', 'id');
    assert(afterSave !== null);
  });

  it('should find a user with object passedd as filter directly', async () => {
    await waitConnection();
    const user = await dbClient.findByColAndFilter('users', 'key', 'not exist');
    assert(!user);
    await dbClient.saveUser({ id: 'id', key: 'key' });
    const afterSave = await dbClient.findByColAndFilter('users', '', {id: 'id'});
    assert(afterSave !== null);
    assert(afterSave.id = 'id')
  });
});

describe('test dbClient canvas collection', () => {
    it('should save a canvas', async () => {
      await waitConnection();
      const canvasCount = await dbClient.canvasCollection.find({}).toArray();
      await dbClient.saveCanvas({ name: 'name', points: {} });
      const afterSave = await dbClient.canvasCollection.find({}).toArray();
      assert(afterSave.length > canvasCount.length);
    });
  
    it('should find a canvas', async () => {
      await waitConnection();
      const canvas = await dbClient.findByColAndFilter('canvas', 'name', 'not exist');
      assert(!canvas);
      await dbClient.saveCanvas({ name: 'name', points: {} });
      const afterSave = await dbClient.findByColAndFilter('canvas', 'name', 'name');
      assert(afterSave !== null);
    });

    it('should delete a canvas', async () => {
        await waitConnection();
        const canvas = await dbClient.findByColAndFilter('canvas', 'name', 'not exist');
        assert(!canvas);
        await dbClient.saveCanvas({ name: 'name', points: {} });
        const afterSave = await dbClient.findByColAndFilter('canvas', 'name', 'name');
        assert(afterSave !== null);
        let found = await dbClient.findByColAndFilter('canvas', '_id', afterSave._id.toString());
        assert(found !== null)
        await dbClient.delete('canvas', {_id: afterSave._id})
        found = await dbClient.findByColAndFilter('canvas', '_id', afterSave._id.toString());
        assert(found === null)
      });

      it('should update a canvas points field', async () => {
        await waitConnection();
        const _id = await dbClient.saveCanvas({ name: 'name', points: {} });
        let found = await dbClient.findByColAndFilter('canvas', '_id', _id.toString());
        assert(Object.keys(found.points).length === 0)
        await dbClient.updateOne('canvas', {_id: found._id}, 'points.2:3', {color: 'red'})
        found = await dbClient.findByColAndFilter('canvas', '_id', _id.toString());
        assert(Object.keys(found.points).length === 1)
        assert(found.points['2:3'].color === 'red')
      });

      it('should delete a canvas points field', async () => {
        await waitConnection();
        const _id = await dbClient.saveCanvas({ name: 'name', points: {} });
        let found = await dbClient.findByColAndFilter('canvas', '_id', _id.toString());
        assert(Object.keys(found.points).length === 0)
        await dbClient.updateOne('canvas', {_id: found._id}, 'points.2:3', {color: 'red'})
        found = await dbClient.findByColAndFilter('canvas', '_id', _id.toString());
        assert(Object.keys(found.points).length === 1)
        assert(found.points['2:3'].color === 'red')
        await dbClient.deletePoint('canvas', {_id: found._id}, 'points.2:3', {})
        found = await dbClient.findByColAndFilter('canvas', '_id', _id.toString());
        assert(Object.keys(found.points).length === 0)
      });
});
