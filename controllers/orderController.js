const ApiError = require('../error/apiError');
const { PaymentMethod, DeliveryMethod, Order, OrderProduct } = require('../models/orderModels');
const { PickUpAddress, Location, Region, Address } = require('../models/addressModels');
const { Product, ProductDescription, ProductMaterial, ProductSort } = require('../models/productModels');
const { Basket, BasketProduct } = require('../models/basketModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { SubCategory } = require('../models/categoryModels');
const { Picture } = require('../models/pictureModels');
const { Op } = require('sequelize');
const { ConfirmedProduct } = require('../models/confirmedProducts');
const { ARCHIVED_ORDERS_STATUS, MessageFromToOptions } = require('../utils/constants');
const { User } = require('../models/userModels');
const { isOrderShouldBeInArchive, sendNewMessageForOrder, createOrderMessage } = require('../utils/ordersFunctions');
const { checkIsUserManufacturerForOrder, checkIsValueZeroAndPositiveNumber } = require('../utils/checkFunctions');
const { normalizeData, formatAddress, getManufacturerIdForUser, updateModelsField } = require('../utils/functions');

const { formatProduct } = require('../utils/productFunctions');

const getProductsInOrder = async (orderId, protocol, host) => {
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

const getConfirmedProductsByOrderId = async (orderId, protocol, host, manufacturerConfirmedDate) => {
  if (!manufacturerConfirmedDate) {
    return undefined;
  }
  const confirmedProductsRaw = await ConfirmedProduct.findAll({
    where: { orderId },
    include: [SubCategory, ProductMaterial, ProductSort],
  });
  const confirmedProductsWithPicture = confirmedProductsRaw.map((confirmedProduct) => {
    confirmedProduct.pictures = [{ fileName: confirmedProduct.image }];
    confirmedProduct.publicationDate = manufacturerConfirmedDate;
    return confirmedProduct;
  });
  return confirmedProductsWithPicture.map((product) => {
    const formattedProduct = formatProduct(product, protocol, host);
    formattedProduct.amountInConfirmation = product.amount;
    formattedProduct.confirmedProductId = product.productId;
    return formattedProduct;
  });
};

const formatOrderInfo = (order, products, confirmedProducts) => {
  return {
    order,
    products,
    confirmedProducts,
  };
};

const getOrderById = async (id) => {
  return await Order.findOne({
    where: { id },
    attributes: { exclude: ['paymentMethodId', 'deliveryMethodId', 'locationId'] },
    include: [PaymentMethod, DeliveryMethod, { model: Location, include: [{ model: Region }] }],
  });
};

const getOrderHeaderByOrderId = async (id, isOrdersForManufacturer) => {
  const orderHeader = await getOrderById(id);
  if (isOrdersForManufacturer) {
    if (!orderHeader.inArchiveForManufacturer) {
      const orderShouldBeInArchive = isOrderShouldBeInArchive(orderHeader.deliveryDate);
      if (orderShouldBeInArchive) {
        orderHeader.inArchiveForManufacturer = true;
      }
    }
  } else {
    if (!orderHeader.inArchiveForUser) {
      const orderShouldBeInArchive = isOrderShouldBeInArchive(orderHeader.deliveryDate);
      if (orderShouldBeInArchive) {
        orderHeader.inArchiveForUser = true;
      }
    }
  }
  if (isOrdersForManufacturer && orderHeader.userId) {
    const userCandidate = await User.findOne({ where: { id: orderHeader.userId } });
    if (userCandidate) {
      const headerObject = await orderHeader.get();
      headerObject.userInfo = {
        id: orderHeader.userId,
        name: userCandidate.name,
        email: userCandidate.email,
        phone: userCandidate.phone,
      };
      return headerObject;
    }
  }
  return orderHeader;
};

const getOrderResponse = async ({ order, protocol, host, isOrdersForManufacturer }) => {
  const orderHeader = await getOrderHeaderByOrderId(order.id, isOrdersForManufacturer);
  const orderProducts = await getProductsInOrder(order.id, protocol, host);
  const confirmedProducts = await getConfirmedProductsByOrderId(
    order.id,
    protocol,
    host,
    order.manufacturerConfirmedDate
  );
  return formatOrderInfo(orderHeader, orderProducts, confirmedProducts);
};

class OrderController {
  async getPaymentMethods(req, res, next) {
    try {
      const paymentMethods = await PaymentMethod.findAll({ order: [['id']] });
      return res.json(paymentMethods);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async getDeliveryMethods(req, res, next) {
    try {
      const deliveryMethod = await DeliveryMethod.findAll({ order: [['id']] });
      return res.json(deliveryMethod);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async getPickUpAddress(req, res, next) {
    try {
      const { mid } = req.params;
      if (!mid) {
        return next(ApiError.badRequest('getManufacturerPickUpAddress - request data is not complete'));
      }
      const pickUpAddress = await PickUpAddress.findOne({
        where: { manufacturerId: mid },
        include: [{ model: Location, include: [{ model: Region }] }],
      });
      const address = formatAddress(pickUpAddress);
      return res.json({ address });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
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
      const orderProducts = await getProductsInOrder(id, req.protocol, req.headers.host);
      const orderInfo = formatOrderInfo(candidateOrder, orderProducts);
      return res.json(orderInfo);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async getOrdersListByParams(req, res, next) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return next(ApiError.badRequest('getOrdersListByParams - userId does not exist in request'));
      }
      const { orderDateFrom, orderDateTo, ordersStatus, isOrdersForManufacturer } = req.body;
      if (!orderDateFrom || !orderDateTo || !ordersStatus) {
        return next(ApiError.badRequest('getOrdersListByParams - request data is not complete'));
      }
      let manufacturerId = undefined;
      if (isOrdersForManufacturer) {
        manufacturerId = await getManufacturerIdForUser(userId);
        if (!manufacturerId) {
          return next(ApiError.badRequest('user is not manufacturer'));
        }
      }
      const normOrderDateFrom = normalizeData(orderDateFrom);
      const normOrderDateTo = normalizeData(orderDateTo);
      const orders = [];

      let searchParams = {};
      if (manufacturerId) {
        searchParams.manufacturerId = manufacturerId;
      } else {
        searchParams.userId = userId;
      }
      searchParams.deliveryDate = {
        [Op.and]: {
          [Op.gte]: normOrderDateFrom,
          [Op.lte]: normOrderDateTo,
        },
      };
      if (
        ordersStatus === 'onConfirming' ||
        ordersStatus === 'confirmedOrder' ||
        ordersStatus === 'canceledByUser' ||
        ordersStatus === 'canceledByManufacturer'
      ) {
        searchParams.status = ordersStatus;
      }

      const ordersList = await Order.findAll({ where: searchParams, order: ['deliveryDate'] });
      if (ordersList && ordersList.length > 0) {
        for (const order of ordersList) {
          const orderResponse = await getOrderResponse({
            order,
            protocol: req.protocol,
            host: req.headers.host,
            isOrdersForManufacturer,
          });
          if (ordersStatus === 'all') {
            orders.push(orderResponse);
          } else if (ordersStatus === 'active') {
            if (isOrdersForManufacturer) {
              if (!orderResponse.order.inArchiveForManufacturer) {
                orders.push(orderResponse);
              }
            } else {
              if (!orderResponse.order.inArchiveForUser) {
                orders.push(orderResponse);
              }
            }
          } else if (ordersStatus === ARCHIVED_ORDERS_STATUS) {
            if (isOrdersForManufacturer) {
              if (orderResponse.order.inArchiveForManufacturer) {
                orders.push(orderResponse);
              }
            } else {
              if (orderResponse.order.inArchiveForUser) {
                orders.push(orderResponse);
              }
            }
          } else {
            if (isOrdersForManufacturer) {
              if (!orderResponse.order.inArchiveForManufacturer) {
                orders.push(orderResponse);
              }
            } else {
              if (!orderResponse.order.inArchiveForUser) {
                orders.push(orderResponse);
              }
            }
          }
        }
      }
      return res.json(orders);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async createNewOrder(req, res, next) {
    try {
      const {
        mid,
        deliveryDate,
        contactPersonName,
        contactPersonPhone,
        deliveryAddress,
        locationId,
        paymentMethodId,
        deliveryMethodId,
      } = req.body;
      const normDeliveryDate = normalizeData(deliveryDate);
      if (
        !mid ||
        !normDeliveryDate ||
        !contactPersonName ||
        !contactPersonPhone ||
        !paymentMethodId ||
        !deliveryMethodId
      ) {
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

      const nowDate = new Date();
      const orderDate = nowDate.toISOString();
      const newOrder = await Order.create({
        orderDate,
        deliveryDate: normDeliveryDate,
        contactPersonName,
        contactPersonPhone,
        deliveryAddress,
        userId,
        manufacturerId: mid,
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

      const orderProducts = await getProductsInOrder(newOrder.id, req.protocol, req.headers.host);
      const orderInfo = formatOrderInfo(newOrder, orderProducts);

      const newDate = new Date();
      const messageDate = newDate.toISOString();
      await createOrderMessage({ orderId: newOrder.id, messageDate, messageText: 'Покупатель создал заказ', next });
      await sendNewMessageForOrder({
        orderId: newOrder.id,
        messageFromTo: MessageFromToOptions.RobotToManufacturer,
        messageText: 'Покупатель создал новый заказ',
        next,
      });
      await sendNewMessageForOrder({
        orderId: newOrder.id,
        messageFromTo: MessageFromToOptions.RobotToUser,
        messageText: 'Вы создали новый заказ',
        next,
      });

      return res.json(orderInfo);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId, isOrderForManufacturer } = req.body;
      if (!orderId) {
        return next(ApiError.badRequest('cancelOrder - request data is not complete'));
      }
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        return next(ApiError.badRequest(`cancelOrder - order with id=${orderId} does not exist`));
      }
      if (!!isOrderForManufacturer) {
        const isManufacturer = await checkIsUserManufacturerForOrder(userId, orderId);
        if (!isManufacturer) {
          return next(ApiError.badRequest(`cancelOrder - only manufacturer could cancel the order`));
        }
        await updateModelsField(order, { status: 'canceledByManufacturer' });
      } else {
        if (order.userId !== userId) {
          return next(
            ApiError.badRequest(`cancelOrder - user with id=${userId} is not owner for Order with id=${orderId}`)
          );
        }
        await updateModelsField(order, { status: 'canceledByUser' });
      }

      const newDate = new Date();
      const messageDate = newDate.toISOString();
      if (isOrderForManufacturer) {
        await createOrderMessage({ orderId, messageDate, messageText: 'Поставщик отказался поставлять заказ', next });
        await sendNewMessageForOrder({
          orderId,
          messageFromTo: MessageFromToOptions.RobotToManufacturer,
          messageText: 'Вы отказалились поставлять заказ',
          next,
        });
        await sendNewMessageForOrder({
          orderId,
          messageFromTo: MessageFromToOptions.RobotToUser,
          messageText: 'Поставщик отказался поставлять заказ',
          next,
        });
      } else {
        await createOrderMessage({ orderId, messageDate, messageText: 'Покупатель отменил заказ', next });
        await sendNewMessageForOrder({
          orderId,
          messageFromTo: MessageFromToOptions.RobotToManufacturer,
          messageText: 'Покупатель отменил заказ',
          next,
        });
        await sendNewMessageForOrder({
          orderId: orderId,
          messageFromTo: MessageFromToOptions.RobotToUser,
          messageText: 'Вы отказались от заказа',
          next,
        });
      }

      return res.json({
        message: `Order with orderId=${orderId} canceled by ${isOrderForManufacturer ? 'Manufacturer' : 'User'}`,
      });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async cancelOrderAndReturnToBasket(req, res, next) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return next(ApiError.badRequest('cancelOrder - userId does not exist in request'));
      }
      const { orderId } = req.body;
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        return next(ApiError.badRequest(`cancelOrder - could not find Order with id=${orderId}`));
      }
      const orderProducts = await OrderProduct.findAll({
        where: { orderId },
      });
      if (orderProducts.length === 0) {
        return next(ApiError.badRequest(`cancelOrder - no products in Order with id=${orderId}`));
      }
      const basket = await Basket.findOne({ where: { userId } });
      if (!basket.id) {
        return next(ApiError.badRequest(`cancelOrder - could not find Basket for user with id=${userId}`));
      }
      for (const orderProduct of orderProducts) {
        await BasketProduct.create({
          basketId: basket.id,
          amount: orderProduct.amount,
          productId: orderProduct.productId,
        });
        const candidate = await OrderProduct.findOne({
          where: { id: orderProduct.id },
        });
        if (candidate) {
          await OrderProduct.destroy({ where: { id: orderProduct.id } });
        }
      }
      await Order.destroy({ where: { id: orderId } });

      const newDate = new Date();
      const messageDate = newDate.toISOString();
      await createOrderMessage({ orderId, messageDate, messageText: 'Покупатель отменил заказ', next });
      await sendNewMessageForOrder({
        orderId,
        messageFromTo: MessageFromToOptions.RobotToManufacturer,
        messageText: 'Покупатель отменил заказ',
        next,
      });
      await sendNewMessageForOrder({
        orderId,
        messageFromTo: MessageFromToOptions.RobotToUser,
        messageText: 'Вы отменили заказ',
        next,
      });

      return res.json({ message: `Order with id=${orderId} - canceled` });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async confirmOrderFromManufacturer(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId, deliveryPrice, requestProducts } = req.body;
      if (!orderId || !(Number(deliveryPrice) >= 0) || !requestProducts) {
        return next(ApiError.badRequest('confirmOrder - request data is not complete'));
      }
      const isManufacturer = await checkIsUserManufacturerForOrder(userId, orderId);
      if (!isManufacturer) {
        return next(ApiError.badRequest(`confirmOrder - only manufacturer could confirm the order`));
      }
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        return next(ApiError.badRequest(`confirmOrder - order with id=${orderId} does not exist`));
      }
      if (order.status !== 'onConfirming') {
        return next(ApiError.badRequest(`confirmOrder - order with id=${orderId} not in status "onConfirming"`));
      }
      if (order.manufacturerConfirmedDate !== null) {
        return next(
          ApiError.badRequest(
            `confirmOrder - order with id=${orderId} has confirmedDate=${order.manufacturerConfirmedDate}`
          )
        );
      }
      const hasConfirmedProductsInOrder = await ConfirmedProduct.findOne({ where: { orderId: orderId } });
      if (hasConfirmedProductsInOrder) {
        return next(ApiError.badRequest(`confirmOrder - order with id=${orderId} already has confirmed products`));
      }
      const orderProductsDB = await getProductsInOrder(orderId, req.protocol, req.headers.host);
      if (!orderProductsDB || orderProductsDB.length === 0) {
        return next(ApiError.badRequest(`confirmOrder - no products in DB for Order with id=${orderId}`));
      }
      if (orderProductsDB.length !== requestProducts.length) {
        return next(ApiError.badRequest(`confirmOrder - error with length for Order with id=${orderId}`));
      }
      for (const requestProduct of requestProducts) {
        if (!checkIsValueZeroAndPositiveNumber(requestProduct.amount)) {
          return next(
            ApiError.badRequest(`confirmOrder - product with id=${requestProduct.productId} incorrect value in amount`)
          );
        }
        const orderProduct = orderProductsDB.find((product) => product.id === requestProduct.productId);
        if (!orderProduct) {
          return next(
            ApiError.badRequest(`confirmOrder - product with id=${requestProduct.productId} does not present in Order`)
          );
        }
      }

      for (const orderProduct of orderProductsDB) {
        const requestAmount = requestProducts.find((product) => product.productId === orderProduct.id)['amount'];
        let imageFile = null;
        const image = orderProduct.images[0];
        if (image) {
          const split = image.split('/')[3];
          if (split) {
            imageFile = split;
          }
        }
        await ConfirmedProduct.create({
          code: orderProduct.code,
          height: orderProduct.height,
          width: orderProduct.width,
          length: orderProduct.length,
          caliber: orderProduct.caliber,
          isSeptic: orderProduct.isSeptic,
          isDried: orderProduct.isDried,
          amount: requestAmount,
          price: orderProduct.price,
          orderId: orderId,
          productId: orderProduct.id,
          subCategoryId: orderProduct.subCategory.id,
          productMaterialId: orderProduct.material.id,
          productSortId: orderProduct.sort.id,
          image: imageFile,
        });
      }

      const newDate = new Date();
      const manufacturerConfirmedDate = newDate.toISOString();
      await updateModelsField(order, { status: 'confirmedOrder', deliveryPrice, manufacturerConfirmedDate });

      await createOrderMessage({
        orderId,
        messageDate: manufacturerConfirmedDate,
        messageText: 'Поставщик подтвердил готовность поставить заказ',
        next,
      });
      await sendNewMessageForOrder({
        orderId,
        messageFromTo: MessageFromToOptions.RobotToManufacturer,
        messageText: 'Вы подтвердили готовность поставить заказ',
        next,
      });
      await sendNewMessageForOrder({
        orderId,
        messageFromTo: MessageFromToOptions.RobotToUser,
        messageText: 'Поставщик подтвердил готовность поставить заказ',
        next,
      });

      return res.json(orderProductsDB);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async sendOrderToArchive(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId, isOrderForManufacturer } = req.body;
      if (!orderId) {
        return next(ApiError.badRequest('sendOrderToArchive - request data is not complete'));
      }
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        return next(ApiError.badRequest(`sendOrderToArchive - order with id=${orderId} does not exist`));
      }
      if (!!isOrderForManufacturer) {
        const isManufacturer = await checkIsUserManufacturerForOrder(userId, orderId);
        if (!isManufacturer) {
          return next(ApiError.badRequest(`sendOrderToArchive - only manufacturer could archive the order`));
        }
        await updateModelsField(order, { inArchiveForManufacturer: true });
      } else {
        if (order.userId !== userId) {
          return next(
            ApiError.badRequest(`sendOrderToArchive - user with id=${userId} is not owner for Order with id=${orderId}`)
          );
        }
        await updateModelsField(order, { inArchiveForUser: true });
      }

      return res.json({
        message: `Order with orderId=${orderId} for ${isOrderForManufacturer ? 'manufacturer' : 'user'} archived`,
      });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }
}

module.exports = new OrderController();
