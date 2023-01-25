const ApiError = require('../error/apiError');
const { PaymentMethod, DeliveryMethod, Order, OrderProduct } = require('../models/orderModels');
const { ManufacturerPickUpAddress, Location, Region, Address } = require('../models/addressModels');
const { formatAddress, formatProduct, normalizeData } = require('../utils/functions');
const { Product, ProductDescription, ProductMaterial, ProductSort } = require('../models/productModels');
const { Basket, BasketProduct } = require('../models/basketModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { SubCategory } = require('../models/categoryModels');
const { Picture } = require('../models/pictureModels');

const getProductsInOrder = async (orderId, OrderProduct, protocol, host) => {
  const orderProductsRaw = await OrderProduct.findAll({
    where: { orderId },
    attributes: {
      exclude: ['id', 'orderId'],
    },
    include: {
      model: Product,
      include: [
        ProductDescription,
        SubCategory,
        ProductMaterial,
        ProductSort,
        Picture,
        {
          model: Manufacturer,
          required: true,
          include: {
            model: Address,
            required: true,
            include: {
              model: Location,
              required: true,
              include: {
                model: Region,
              },
            },
          },
        },
      ],
    },
  });
  return orderProductsRaw.map((orderProduct) => {
    const productRaw = formatProduct(orderProduct.product, protocol, host);
    productRaw.amountInOrder = orderProduct.amount;
    return productRaw;
  });
};

const formatOrderInfo = (order, orderProducts) => {
  return {
    order: order,
    products: orderProducts,
  };
};

const getOrderById = async (id) => {
  return await Order.findOne({
    where: { id },
    attributes: { exclude: ['paymentMethodId', 'deliveryMethodId', 'locationId'] },
    include: [PaymentMethod, DeliveryMethod, { model: Location, include: [{ model: Region }] }],
  });
};

class OrderController {
  async getPaymentMethods(req, res, next) {
    try {
      const paymentMethods = await PaymentMethod.findAll({ order: [['id']] });
      return res.json(paymentMethods);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getDeliveryMethods(req, res, next) {
    try {
      const deliveryMethod = await DeliveryMethod.findAll({ order: [['id']] });
      return res.json(deliveryMethod);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getManufacturerPickUpAddress(req, res, next) {
    try {
      const { mid } = req.params;
      if (!mid) {
        return next(ApiError.badRequest('getManufacturerPickUpAddress - request data is not complete'));
      }
      const manufacturerPickUpAddress = await ManufacturerPickUpAddress.findOne({
        where: { manufacturerId: mid },
        include: [{ model: Location, include: [{ model: Region }] }],
      });
      const address = formatAddress(manufacturerPickUpAddress);
      return res.json({ address });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createNewOrder(req, res, next) {
    try {
      const {
        mid,
        date,
        contactPersonName,
        contactPersonPhone,
        deliveryAddress,
        locationId,
        paymentMethodId,
        deliveryMethodId,
      } = req.body;
      const normDate = normalizeData(date);
      if (!mid || !normDate || !contactPersonName || !contactPersonPhone || !paymentMethodId || !deliveryMethodId) {
        return next(ApiError.internal('Create new order - request data is not complete'));
      }
      const userId = req.user.id;
      if (!userId) {
        return next(ApiError.badRequest('Create new order - userId does not exist in request'));
      }
      const basket = await Basket.findOne({ where: { userId } });
      if (!basket.id) {
        return next(ApiError.badRequest(`Create new order - could not find Basket for user with id=${userId}`));
      }
      const basketProductsByManufacturer = await BasketProduct.findAll({
        where: { basketId: basket.id },
        include: {
          model: Product,
          required: true,
          include: [{ model: Manufacturer, where: { id: mid } }],
        },
      });
      if (basketProductsByManufacturer.length === 0) {
        return next(ApiError.badRequest(`Create new order - no product in Basket for manufacturer with id=${mid}`));
      }

      const newOrder = await Order.create({
        date: normDate,
        contactPersonName,
        contactPersonPhone,
        deliveryAddress,
        userId,
        locationId,
        paymentMethodId,
        deliveryMethodId,
      });
      if (!newOrder) {
        return next(ApiError.badRequest('Create new order - error in newOrder creating'));
      }

      for (const basketProduct of basketProductsByManufacturer) {
        await OrderProduct.create({
          orderId: newOrder.id,
          amount: basketProduct.amount,
          productId: basketProduct.productId,
        });
        const candidate = await BasketProduct.findOne({
          where: { basketId: basket.id, productId: basketProduct.productId },
        });
        if (candidate) {
          await BasketProduct.destroy({ where: { basketId: basket.id, productId: basketProduct.productId } });
        }
      }

      const orderProducts = await getProductsInOrder(newOrder.id, OrderProduct, req.protocol, req.headers.host);

      const orderInfo = formatOrderInfo(newOrder, orderProducts);
      return res.json(orderInfo);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getOrderInfo(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return next(ApiError.badRequest('getOrderInfo - request data is not complete'));
      }
      const userId = req.user.id;
      if (!userId) {
        return next(ApiError.badRequest('getOrderInfo - userId does not exist in request'));
      }
      const candidateOrder = await getOrderById(id);
      if (!candidateOrder) {
        return next(ApiError.badRequest('getOrderInfo - order does not exist'));
      }
      if (userId !== candidateOrder.userId) {
        const candidateManufacturer = await Manufacturer.findOne({ where: { userId } });
        if (!candidateManufacturer) {
          return next(ApiError.badRequest('getOrderInfo - could not find manufacturer for user'));
        }
        const candidateOrderProduct = await OrderProduct.findOne({
          where: { orderId: id },
          include: {
            model: Product,
            include: { model: Manufacturer },
          },
        });
        if (!candidateOrderProduct) {
          return next(ApiError.badRequest('getOrderInfo - could not find products in order'));
        }
        if (candidateManufacturer.id !== candidateOrderProduct.product.manufacturer.id) {
          return next(ApiError.badRequest('getOrderInfo - user is not manufacturer for order'));
        }
      }
      const orderProducts = await getProductsInOrder(id, OrderProduct, req.protocol, req.headers.host);
      const orderInfo = formatOrderInfo(candidateOrder, orderProducts);
      return res.json(orderInfo);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getOrdersListByParams(req, res, next) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return next(ApiError.badRequest('getOrdersListByParams - userId does not exist in request'));
      }
      const {dateFrom, dateTo, ordersStatus} = req.body;
      const normDateFrom = normalizeData(dateFrom);
      const normDateTo = normalizeData(dateTo);
      if (!normDateFrom || !normDateTo || !ordersStatus) {
        return next(ApiError.badRequest('getOrdersListByParams - request data is not complete'));
      }
      console.log(normDateFrom, normDateTo, ordersStatus);
      const orders = [];
      const ordersList = await Order.findAll({
        where: { userId },
      });
      if (ordersList && ordersList.length > 0) {
        for (const order of ordersList) {
          const orderHeader = await getOrderById(order.id);
          const orderProducts = await getProductsInOrder(order.id, OrderProduct, req.protocol, req.headers.host);
          const orderResponse = formatOrderInfo(orderHeader, orderProducts);
          if (orderResponse) {
            orders.push(orderResponse);
          }
        }
      }
      return res.json(orders);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new OrderController();
