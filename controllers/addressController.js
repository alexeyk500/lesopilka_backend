const { Region } = require('../models/models');
const ApiError = require('../error/apiError');

class AddressController {
  async createRegion(req, res, next) {
    try {
      const { name } = req.body;
      const region = await Region.create({ name });
      return res.json(region);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  // async delete(req, res) {
  //   const { id } = req.params;
  //   const count = await Brand.destroy({ where: { id } });
  //   return res.json(count);
  // }
  //
  // async getAll(req, res) {
  //   const brands = await Brand.findAll();
  //   return res.json(brands);
  // }
}

module.exports = new AddressController();
