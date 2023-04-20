const SizeTypeEnum = Object.freeze({ height: 'height', width: 'width', length: 'length', caliber: 'caliber' });

const PRODUCTS_PAGE_SIZE = 32;

const AMOUNT_OF_DAYS_FOR_ARCHIVED_ORDERS = 30;

const ARCHIVED_ORDERS_STATUS = 'inArchive';

const WELCOME_LICENSES_AMOUNT = 500;

const TEST_EMAIL = 'alexeyk500@yandex.ru';

const MessageFromToOptions = Object.freeze({
  ManufacturerToUser: 'MTU',
  UserToManufacturer: 'UTM',
  RobotToUser: 'RTU',
  RobotToManufacturer: 'RTM',
});

module.exports = {
  SizeTypeEnum,
  PRODUCTS_PAGE_SIZE,
  AMOUNT_OF_DAYS_FOR_ARCHIVED_ORDERS,
  ARCHIVED_ORDERS_STATUS,
  WELCOME_LICENSES_AMOUNT,
  TEST_EMAIL,
  MessageFromToOptions,
};
