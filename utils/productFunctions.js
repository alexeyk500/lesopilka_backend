const { Product, ProductDescription, ProductMaterial, ProductSort } = require('../models/productModels');
const { SubCategory, Category } = require('../models/categoryModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const { Picture } = require('../models/pictureModels');
const { formatManufacturer } = require('./functions');

const formatProduct = (product, protocol, host) => {
  return {
    id: product.id,
    code: product.code ? product.code : undefined,
    height: product.height ? product.height : undefined,
    width: product.width ? product.width : undefined,
    length: product.length ? product.length : undefined,
    caliber: product.caliber ? product.caliber : undefined,
    price: product.price ? product.price : undefined,
    isSeptic: product.isSeptic,
    isDried: product.isDried,
    editionDate: product.editionDate ? product.editionDate : undefined,
    publicationDate: product.publicationDate ? product.publicationDate : undefined,
    description: product.productDescription
      ? product.productDescription.description
        ? product.productDescription.description
        : undefined
      : undefined,
    category: product.subCategory
      ? product.subCategory.category
        ? { id: product.subCategory.category.id, title: product.subCategory.category.title }
        : undefined
      : undefined,
    subCategory: product.subCategory ? { id: product.subCategory.id, title: product.subCategory.title } : undefined,
    material: product.productMaterial
      ? { id: product.productMaterial.id, title: product.productMaterial.title }
      : undefined,
    sort: product.productSort ? { id: product.productSort.id, title: product.productSort.title } : undefined,
    images: product.pictures
      ? product.pictures.map((picture) => protocol + '://' + host + '/' + picture.fileName)
      : undefined,
    manufacturer: product.manufacturer ? formatManufacturer(product.manufacturer) : undefined,
  };
};

const getProductResponse = async (productId, protocol, host) => {
  const product = await Product.findOne({
    where: { id: productId },
    include: [
      ProductDescription,
      ProductMaterial,
      ProductSort,
      {
        model: SubCategory,
        include: [{ model: Category }],
      },
      {
        model: Manufacturer,
        include: [{ model: Address, include: [{ model: Location, include: [{ model: Region }] }] }],
      },
      { model: Picture },
    ],
    order: [[Picture, 'order', 'ASC']],
  });
  return formatProduct(product, protocol, host);
};

module.exports = {
  formatProduct,
  getProductResponse,
};
