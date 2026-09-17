window.GIRL_COUNT = 15;

window.girlModels = function girlModels(base) {
  const prefix = base ?? "../images/";
  return Array.from({ length: window.GIRL_COUNT }, (_, index) => `${prefix}model${index + 1}.png`);
};
