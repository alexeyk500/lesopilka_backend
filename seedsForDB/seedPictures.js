const { Picture } = require('../models/pictureModels');

const pictures = [
  { categoryId: '1', fileName: '0_SC_1_brus.jpg' },
  { categoryId: '2', fileName: '0_SC_2_doska.jpg' },
  { categoryId: '3', fileName: '0_SC_3_vagonka.jpg' },
  { categoryId: '4', fileName: '0_SC_4_pogonage.jpg' },
  { categoryId: '5', fileName: '0_SC_5_block_land_house.jpg' },
  { categoryId: '6', fileName: '0_SC_6_brevno.jpg' },
  { categoryId: '7', fileName: '0_SC_7_opilki_pellety.jpg' },
];

const seedPictures = async () => {
  await Picture.truncate({ cascade: true, restartIdentity: true });
  for (let picture of pictures) {
    const result = await Picture.create({
      fileName: picture.fileName,
      categoryId: picture.categoryId,
      productId: null,
    });
    console.log(`Создано ${result}`);
  }
};

module.exports = seedPictures;
