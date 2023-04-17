const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

const getManufacturerAddress = (manufacturer) => {
  let address = '';
  address += manufacturer?.address?.location?.region?.title + ', ';
  address += manufacturer?.address?.location?.title + ', ';
  address += manufacturer?.address?.street + ', д.';
  address += manufacturer?.address?.building;
  if (manufacturer?.address?.office) {
    address += ', оф.' + manufacturer?.address?.office;
  }
  return address;
};

const formatManufacturerAddress = (manufacturer) => {
  return {
    id: manufacturer.address.id,
    region: manufacturer.address.location.region,
    location: {
      id: manufacturer.address.location.id,
      title: manufacturer.address.location.title,
    },
    postIndex: manufacturer.address.postIndex,
    street: manufacturer.address.street,
    building: manufacturer.address.building,
    office: manufacturer.address.office,
  };
};

const formatUTCtoDDMonthYear = (utcData) => {
  if (utcData) {
    return new Date(utcData).toLocaleString('ru-Ru', {
      month: 'long',
      year: 'numeric',
      day: '2-digit',
    });
  }
  return null;
};

const getProductSizesStr = (product) => {
  let sizes = '';
  if (product) {
    if (product.caliber) {
      sizes += product.caliber;
    } else {
      if (product.height) {
        sizes += product.height;
      }
      if (product.width) {
        sizes += `*${product.width}`;
      }
    }
    if (product.length) {
      sizes += `*${product.length}`;
    }
  }
  return sizes;
};

const splitBySubCategory = (products, subCategories) => {
  const separatedProducts = [];
  if (products && products.length > 0) {
    subCategories.forEach((subCategory) => {
      const subCategoryProducts = products.filter((product) =>
        product.subCategory ? product.subCategory.id === subCategory.id : undefined
      );
      if (subCategoryProducts.length > 0) {
        separatedProducts.push(subCategoryProducts);
      }
    });
    const withoutSubCategoryProducts = products.filter((product) => product.subCategory === undefined);
    if (withoutSubCategoryProducts.length > 0) {
      separatedProducts.push(withoutSubCategoryProducts);
    }
  }
  return separatedProducts;
};
const splitByIsDried = (productsGroup) => {
  const separatedProducts = [];
  if (productsGroup && productsGroup.length > 0) {
    productsGroup.forEach((productGroup) => {
      const isDriedProducts = productGroup.filter((product) => product.isDried === true);
      const notIsDriedProducts = productGroup.filter((product) => product.isDried === false);
      if (notIsDriedProducts.length > 0) {
        separatedProducts.push(notIsDriedProducts);
      }
      if (isDriedProducts.length > 0) {
        separatedProducts.push(isDriedProducts);
      }
    });
  }
  return separatedProducts;
};
const splitByIsSeptic = (productsGroup) => {
  const separatedProducts = [];
  if (productsGroup && productsGroup.length > 0) {
    productsGroup.forEach((productGroup) => {
      const isSepticProducts = productGroup.filter((product) => product.isSeptic === true);
      const notIsSepticProducts = productGroup.filter((product) => product.isSeptic === false);
      if (notIsSepticProducts.length > 0) {
        separatedProducts.push(notIsSepticProducts);
      }
      if (isSepticProducts.length > 0) {
        separatedProducts.push(isSepticProducts);
      }
    });
  }
  return separatedProducts;
};
const sortBySortId = (productsGroup) => {
  const separatedProducts = [];
  if (productsGroup && productsGroup.length > 0) {
    productsGroup.forEach((productGroup) => {
      if (productGroup.length > 0) {
        const sortedBySortId = productGroup.sort((a, b) => {
          return a.sort ? Number(a.sort.id) - Number(b.sort.id) : 0;
        });
        separatedProducts.push(sortedBySortId);
      }
    });
  }
  return separatedProducts;
};
const sortByMaterialId = (productsGroup) => {
  const separatedProducts = [];
  if (productsGroup && productsGroup.length > 0) {
    productsGroup.forEach((productGroup) => {
      if (productGroup.length > 0) {
        const sortedBySortId = productGroup.sort((a, b) => {
          return a.material ? Number(a.material.id) - Number(b.material.id) : 0;
        });
        separatedProducts.push(sortedBySortId);
      }
    });
  }
  return separatedProducts;
};
const sortBySize = (productsGroup) => {
  const separatedProducts = [];
  if (productsGroup && productsGroup.length > 0) {
    productsGroup.forEach((productGroup) => {
      if (productGroup.length > 0) {
        const sortedByLength = productGroup.sort((a, b) => {
          return Number(a.length) - Number(b.length);
        });
        if (productGroup[0].caliber) {
          const sortedByCaliber = sortedByLength.sort((a, b) => {
            return Number(a.caliber) - Number(b.caliber);
          });
          separatedProducts.push(sortedByCaliber);
        } else {
          const sortedByWidth = sortedByLength.sort((a, b) => {
            return Number(a.width) - Number(b.width);
          });
          const sortedByHeight = sortedByWidth.sort((a, b) => {
            return Number(a.height) - Number(b.height);
          });
          separatedProducts.push(sortedByHeight);
        }
      }
    });
  }
  return separatedProducts;
};

const groupProducts = (products, subCategories) => {
  let separatedProducts = splitBySubCategory(products, subCategories);
  separatedProducts = splitByIsDried(separatedProducts);
  separatedProducts = splitByIsSeptic(separatedProducts);
  separatedProducts = sortBySortId(separatedProducts);
  separatedProducts = sortByMaterialId(separatedProducts);
  separatedProducts = sortBySize(separatedProducts);
  return separatedProducts;
};

const getPriceSections = (groupedProducts) => {
  return groupedProducts.map((section) => {
    const subCategory = section[0].subCategory.title;
    const isDried = section[0].isDried || false;
    const isSeptic = section[0].isSeptic || false;
    let title = subCategory ? `${subCategory} (` : 'Пиломатериал без выбранной категории (';
    if (isDried) {
      title += 'камерная сушка';
    } else {
      title += 'естественная влажность';
    }
    if (isSeptic) {
      title += ', септирован';
    }
    title += ')';
    const products = section.map((product) => {
      return {
        size: getProductSizesStr(product),
        material: product.material ? product.material.title : '',
        sort: product.sort ? product.sort.title : '',
        code: product.code ? product.code : '',
        price: product.price ? product.price : '',
      };
    });
    return { title, products };
  });
};

const bitmapToBase64 = (bitmap) => {
  return Buffer.from(bitmap).toString('base64');
};

const createPDF = async (data, htmlTemplate) => {
  try {
    const template = handlebars.compile(htmlTemplate);
    const html = template(data);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: 30,
        bottom: 10,
        left: 30,
        right: 5,
      },
      printBackground: true,
    });
    await browser.close();
    return pdfBuffer;
  } catch (e) {
    throw new Error('creating PDF error');
  }
};

module.exports = {
  getManufacturerAddress,
  formatManufacturerAddress,
  formatUTCtoDDMonthYear,
  getProductSizesStr,
  groupProducts,
  getPriceSections,
  bitmapToBase64,
  createPDF,
};
