export const formatResponseRecord: (record: any) => any = record => {
  const { _id, ...rest } = record;
  return { id: _id, ...rest };
};
