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
  console.log('product =', product)
  return {
    id: product.id,
    code: product.code ?product.code :undefined,
    price: product.price ?product.price :undefined,
    isSeptic: product.isSeptic,
    editionDate: product.editionDate ?product.editionDate :undefined,
    publicationDate: product.publicationDate ?product.publicationDate :undefined,
    description: product.productDescription.description ?product.productDescription.description :undefined,
    subCategory: product.subCategory ?{ id: product.subCategory.id, title: product.subCategory.title } :undefined,
    material: product.productMaterial ?{ id: product.productMaterial.id, title: product.productMaterial.title } :undefined,
    sort: product.productSort ?{ id: product.productSort.id, title: product.productSort.title } :undefined,
    sizes: product.categorySizes
      ? product.categorySizes.map((size) => ({ id: size.id, type: size.type, value: size.value }))
      : undefined,
    images: product.pictures
      ? product.pictures.map((picture) => protocol + '://' + host + '/' + picture.fileName)
      : undefined,
    manufacturer: formatManufacturer(product.manufacturer),
  };
};

module.exports = { formatAddress, formatManufacturer, formatProduct };
