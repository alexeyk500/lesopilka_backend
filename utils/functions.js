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
  const sizes = [];
  if (product.categorySizes) {
    product.categorySizes.forEach((size) =>
      sizes.push({ id: size.id, type: size.type, value: size.value, isCustomSize: size.isCustomSize })
    );
  }
  if (product.customHeight) {
    sizes.push({ id: -1, type: 'height', value: product.customHeight, isCustomSize: true });
  }
  if (product.customWidth) {
    sizes.push({ id: -2, type: 'width', value: product.customWidth, isCustomSize: true });
  }
  if (product.customLength) {
    sizes.push({ id: -3, type: 'length', value: product.customLength, isCustomSize: true });
  }
  if (product.customCaliber) {
    sizes.push({ id: -4, type: 'caliber', value: product.customCaliber, isCustomSize: true });
  }

  console.log('product.pictures =', product.pictures);

  return {
    id: product.id,
    code: product.code ? product.code : undefined,
    price: product.price ? product.price : undefined,
    isSeptic: product.isSeptic,
    editionDate: product.editionDate ? product.editionDate : undefined,
    publicationDate: product.publicationDate ? product.publicationDate : undefined,
    description: product.productDescription.description ? product.productDescription.description : undefined,
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
    sizes: !!sizes.length ? sizes : undefined,
    images: product.pictures
      ? product.pictures.map((picture) => protocol + '://' + host + '/' + picture.fileName)
      : undefined,
    manufacturer: formatManufacturer(product.manufacturer),
  };
};

const updateModelsField = async (model, field) => {
  if (field) {
    return await model.update(field);
  }
};

const dropCustomSizeByType = async (product, type) => {
  if (type === 'height' && product.customHeight) {
    await product.update({ customHeight: null });
  }
  if (type === 'width' && product.customWidth) {
    await product.update({ customWidth: null });
  }
  if (type === 'length' && product.customLength) {
    await product.update({ customLength: null });
  }
  if (type === 'caliber' && product.customCaliber) {
    await product.update({ customCaliber: null });
  }
};

module.exports = { formatAddress, formatManufacturer, formatProduct, updateModelsField, dropCustomSizeByType };
