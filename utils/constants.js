const SizeTypeEnum = Object.freeze({ height: 'height', width: 'width', length: 'length', caliber: 'caliber' });

const PRODUCTS_PAGE_SIZE = 32;

const AMOUNT_OF_DAYS_FOR_ARCHIVED_ORDERS = 30;

const ARCHIVED_ORDERS_STATUS = 'inArchive'

module.exports = { SizeTypeEnum, PRODUCTS_PAGE_SIZE, AMOUNT_OF_DAYS_FOR_ARCHIVED_ORDERS, ARCHIVED_ORDERS_STATUS};
