export const ALLOWED_CATEGORIES = [
  'Food & Dining',
  'Books & Supplies',
  'Tuition & Fees',
  'Hostel & Rent',
  'Transport',
  'Entertainment',
  'Health & Personal',
  'Utilities',
  'Other'
];

/**
 * Validates request body for creating or updating a transaction.
 */
export const validateTransaction = (req, res, next) => {
  const { title, amount, category, date, description } = req.body;
  const errors = [];

  // Validate title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and cannot be empty.');
  } else if (title.trim().length < 2) {
    errors.push('Title must be at least 2 characters long.');
  } else if (title.trim().length > 100) {
    errors.push('Title cannot exceed 100 characters.');
  }

  // Validate amount
  const numericAmount = Number(amount);
  if (amount === undefined || amount === null || isNaN(numericAmount)) {
    errors.push('Amount is required and must be a valid number.');
  } else if (numericAmount <= 0) {
    errors.push('Amount must be greater than ₹0.');
  } else if (numericAmount > 10000000) {
    errors.push('Amount cannot exceed ₹10,000,000.');
  }

  // Validate category
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required.');
  }

  // Validate date
  if (!date || typeof date !== 'string') {
    errors.push('Date is required in YYYY-MM-DD format.');
  } else {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid date format. Expected YYYY-MM-DD.');
    }
  }

  // Validate description (optional)
  if (description !== undefined && description !== null && typeof description === 'string' && description.trim().length > 500) {
    errors.push('Description cannot exceed 500 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize fields on req.body for downstream controller
  req.body.title = title.trim();
  req.body.amount = Math.round(numericAmount * 100) / 100; // Round to 2 decimal places
  req.body.category = category.trim();
  req.body.date = date.trim();
  req.body.description = description ? description.trim() : '';

  next();
};
