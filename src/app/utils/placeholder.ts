/** Imagen SVG inline usada cuando un empleado no tiene foto de perfil. */
export const FOTO_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">' +
      '<rect width="100%" height="100%" fill="#2a2a2a"/>' +
      '<text x="50%" y="50%" fill="#888888" font-size="22" text-anchor="middle" ' +
      'dominant-baseline="middle" font-family="sans-serif">Sin foto</text>' +
      '</svg>'
  );
