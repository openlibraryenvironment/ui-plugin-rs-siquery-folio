const FOLIOIDENTIFIERS = {
  '8261054f-be78-422d-bd51-4ed9f33c3422': 'isbn',
  '913300b2-03ed-469a-8179-c1092c991227': 'issn',
  '439bfbae-75bc-4f74-9fc7-b2a2d47ce3ef': 'oclc',
};

export default rec => {
  if (typeof rec !== 'object') return null;
  const res = {
    systemInstanceIdentifier: rec.id,
    title: rec.title,
    author: rec.contributors?.map(c => c.name).join('; '),
    edition: rec.editions?.[0],
    publisher: rec.publication?.[0]?.publisher,
    publicationDate: rec.publication?.[0]?.dateOfPublication,
    placeOfPublication: rec.publication?.[0]?.place
  };

  rec.identifiers?.forEach(i => { // eslint-disable-line no-unused-expressions
    const idType = FOLIOIDENTIFIERS[i.identifierTypeId];
    if (idType) res[idType] = i.value;
  });
  return res;
};
