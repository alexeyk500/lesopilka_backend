const formatAddress = (address) => {
  if (!address) {
    return undefined;
  }
  return {
    id: address.id,
    postIndex: address.postIndex ? address.postIndex : undefined,
    region: address.location.region
      ? {
          id: address.location.region.id ? address.location.region.id : undefined,
          title: address.location.region.title ? address.location.region.title : undefined,
        }
      : undefined,
    location: address.location
      ? {
          id: address.location.id ? address.location.id : undefined,
          title: address.location.title ? address.location.title : undefined,
        }
      : undefined,
    street: address.street ? address.street : undefined,
    building: address.building ? address.building : undefined,
    office: address.office ? address.office : undefined,
  };
};

const formatManufacturer = (manufacturer) => {
  if (!manufacturer) {
    return undefined;
  }
  return {
    id: manufacturer.id,
    inn: manufacturer.inn ? manufacturer.inn : undefined,
    title: manufacturer.title ? manufacturer.title : undefined,
    phone: manufacturer.phone ? manufacturer.phone : undefined,
    address: formatAddress(manufacturer.address),
  };
};

const formatProduct = (product, protocol, host) => {
  return {
    id: product.id,
    code: product.code,
    price: product.price,
    isSeptic: product.isSeptic,
    editionDate: product.editionDate,
    publicationDate: product.publicationDate,
    productDescription: product.description,
    subCategory: { id: product.subCategory.id, title: product.subCategory.title },
    sizes: product.categorySizes.map((size) => ({ id: size.id, type: size.type, value: size.value })),
    pictures: product.pictures.map((picture) => protocol + '://' + host + '/' + picture.fileName),
    manufacturer: formatManufacturer(product.manufacturer),
  };
};

module.exports = { formatAddress, formatManufacturer, formatProduct };
