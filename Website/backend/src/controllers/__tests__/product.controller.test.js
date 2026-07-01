import { expect } from 'chai';
import sinon from 'sinon';
import { uploadProducts } from '../product.controller.js';
import Product from '../../models/product.model.js';

describe('product.controller', () => {
  describe('uploadProducts', () => {
    let insertManyStub;
    let consoleWarnStub;
    let consoleErrorStub;

    beforeEach(() => {
      insertManyStub = sinon.stub(Product, 'insertMany');
      consoleWarnStub = sinon.stub(console, 'warn');
      consoleErrorStub = sinon.stub(console, 'error');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return 401 if user is not authenticated or missing mallId', async () => {
      const req1 = {};
      const res1 = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      await uploadProducts(req1, res1);
      expect(res1.status.calledWith(401)).to.be.true;
      expect(res1.json.calledWith({ message: 'Unauthorized: Mall ID not found.' })).to.be.true;

      const req2 = { user: {} };
      const res2 = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      await uploadProducts(req2, res2);
      expect(res2.status.calledWith(401)).to.be.true;
      expect(res2.json.calledWith({ message: 'Unauthorized: Mall ID not found.' })).to.be.true;
    });

    it('should return 400 if products is not an array or is empty', async () => {
      const req1 = { user: { mallId: 'mall-123' }, body: {} };
      const res1 = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      await uploadProducts(req1, res1);
      expect(res1.status.calledWith(400)).to.be.true;
      expect(res1.json.calledWith({ message: 'Product data must be a non-empty array.' })).to.be.true;

      const req2 = { user: { mallId: 'mall-123' }, body: { products: [] } };
      const res2 = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      await uploadProducts(req2, res2);
      expect(res2.status.calledWith(400)).to.be.true;
      expect(res2.json.calledWith({ message: 'Product data must be a non-empty array.' })).to.be.true;
    });

    it('should return 200 on successful upload with rawResult details', async () => {
      const req = {
        user: { mallId: 'mall-123' },
        body: {
          products: [{ id: 'p1', name: 'Product 1', category: 'A', price: 10, weight: 1, quantity: 5 }]
        }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const mockResult = {
        insertedIds: { 0: 'some_id' }
      };
      insertManyStub.resolves(mockResult);

      await uploadProducts(req, res);

      expect(insertManyStub.calledOnce).to.be.true;
      const passedArgs = insertManyStub.firstCall.args;
      expect(passedArgs[0]).to.deep.equal([{
        mallId: 'mall-123',
        productId: 'p1',
        name: 'Product 1',
        category: 'A',
        price: 10,
        weight: 1,
        quantity: 5
      }]);
      expect(passedArgs[1]).to.deep.equal({ ordered: false, rawResult: true });

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        message: '1 products uploaded successfully.',
        insertedCount: 1,
        failedCount: 0,
        errors: []
      }))).to.be.true;
    });

    it('should return 200 and log warnings if some uploads fail in rawResult', async () => {
      const req = {
        user: { mallId: 'mall-123' },
        body: {
          products: [{ id: 'p1', name: 'Product 1' }, { id: 'p2', name: 'Product 2' }]
        }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const mockResult = {
        insertedIds: { 0: 'some_id' },
        writeErrors: [{ errmsg: 'duplicate id for p2' }]
      };
      insertManyStub.resolves(mockResult);

      await uploadProducts(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        message: '1 products uploaded successfully. 1 products failed (e.g., duplicates or missing fields).',
        insertedCount: 1,
        failedCount: 1,
        errors: ['duplicate id for p2']
      }))).to.be.true;
      expect(consoleWarnStub.calledOnce).to.be.true;
    });

    it('should return 409 if Product.insertMany throws duplicate key error (code 11000)', async () => {
      const req = {
        user: { mallId: 'mall-123' },
        body: {
          products: [{ id: 'p1', name: 'Product 1', price: 10 }]
        }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const mockError = new Error('Duplicate key error');
      mockError.code = 11000;
      insertManyStub.rejects(mockError);

      await uploadProducts(req, res);

      expect(insertManyStub.calledOnce).to.be.true;
      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.calledWith({
        message: 'One or more products with existing IDs already exist in this mall.',
        details: 'Duplicate key error'
      })).to.be.true;
    });

    it('should return 500 if generic server error occurs', async () => {
      const req = {
        user: { mallId: 'mall-123' },
        body: {
          products: [{ id: 'p1', name: 'Product 1', price: 10 }]
        }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const mockError = new Error('Some database error');
      insertManyStub.rejects(mockError);

      await uploadProducts(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({
        message: 'Server error during product upload.',
        error: 'Some database error'
      })).to.be.true;
      expect(consoleErrorStub.calledOnce).to.be.true;
    });
  });
});
