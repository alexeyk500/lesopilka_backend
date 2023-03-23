const licenseJob = () => {
  const newDate = new Date();
  console.log(
    `${newDate.toISOString().split('.')[0]} : licenseJob - The answer to life, the universe, and everything!!!`
  );
};

module.exports = licenseJob;
