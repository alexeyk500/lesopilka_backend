const jwt = require('jsonwebtoken');
const { User, SearchRegionAndLocation } = require('../models/userModels');
const { Region, Location, Address } = require('../models/addressModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { formatManufacturer, formatReseller, formatAddress } = require('./functions');
const { Reseller } = require('../models/resellerModels');

const generateUserToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '24h' });
};

const getUserResponse = async (userId, tokenRaw) => {
  const user = await User.findOne({
    where: { id: userId },
    include: [
      {
        model: SearchRegionAndLocation,
        include: [Region, Location],
      },
      {
        model: Manufacturer,
        include: [{ model: Address, include: [{ model: Location, include: [{ model: Region }] }] }],
      },
      {
        model: Reseller,
        include: [{ model: Address, include: [{ model: Location, include: [{ model: Region }] }] }],
      },
    ],
  });

  let userAddress;
  if (user.addressId) {
    userAddress = await Address.findOne({
      where: { id: user.addressId },
      include: [{ model: Location, include: Region }],
    });
  }

  let token;
  if (tokenRaw) {
    token = tokenRaw;
  } else {
    token = generateUserToken(user);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name ? user.name : user.email,
      phone: user.phone ? user.phone : undefined,
      searchRegion:
        user.searchRegionAndLocation && user.searchRegionAndLocation.region
          ? { id: user.searchRegionAndLocation.region.id, title: user.searchRegionAndLocation.region.title }
          : undefined,
      searchLocation:
        user.searchRegionAndLocation && user.searchRegionAndLocation.location
          ? { id: user.searchRegionAndLocation.location.id, title: user.searchRegionAndLocation.location.title }
          : undefined,
      address: userAddress ? formatAddress(userAddress) : undefined,
      manufacturer: user.manufacturer ? formatManufacturer(user.manufacturer) : undefined,
      reseller: user.reseller ? formatReseller(user.reseller) : undefined,
    },
    token,
  };
};

module.exports = {
  getUserResponse,
  generateUserToken,
};
