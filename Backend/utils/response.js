export const successResponse = (res, data, message = "Operation successful") => {
    res.status(200).json({ success: true, message, data });
  };
  
  export const errorResponse = (res, message, status = 400) => {
    res.status(status).json({ success: false, error: message });
  };