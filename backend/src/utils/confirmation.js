const generateConfirmationCode = () => {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  const timePart = Date.now().toString(36).slice(-6).toUpperCase();
  return `${randomPart}-${timePart}`;
};

module.exports = {
  generateConfirmationCode,
};
