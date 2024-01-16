// promis method of a high order function
const asyncHandler = (requestHandlerFn) => {
  return (req, res, next) => {
    Promise.resolve(requestHandlerFn(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { asyncHandler };
// try cath method

// const asyncHandler = (rhFun) => async (req, res, next) => {
//   try {
//     await rhFun(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
