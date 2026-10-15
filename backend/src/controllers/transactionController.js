import { getCloudantClient, DB_NAME, isCloudantConfigured, isDbInitialized, initDatabase } from '../config/cloudant.js';

/**
 * Helper to get the active Cloudant client or throw a descriptive error if not configured.
 */
const getActiveClient = async () => {
  if (!isCloudantConfigured()) {
    const err = new Error(
      'IBM Cloudant credentials are missing. Set CLOUDANT_URL and CLOUDANT_APIKEY in backend/.env'
    );
    err.code = 'CLOUDANT_NOT_CONFIGURED';
    throw err;
  }

  // Ensure DB has been verified / created
  if (!isDbInitialized()) {
    await initDatabase();
  }

  const client = getCloudantClient();
  if (!client) {
    const err = new Error('Could not instantiate IBM Cloudant client. Check configuration.');
    err.code = 'CLOUDANT_NOT_CONFIGURED';
    throw err;
  }

  return client;
};

/**
 * GET /api/health
 * Returns service health and IBM Cloudant database connectivity status.
 */
export const getHealth = async (req, res, next) => {
  const configured = isCloudantConfigured();
  let dbStatus = {
    configured,
    connected: false,
    dbName: DB_NAME,
    message: configured ? 'Checking connection...' : 'Credentials missing. Update backend/.env'
  };

  if (configured) {
    try {
      const client = getCloudantClient();
      if (client) {
        const info = await client.getDatabaseInformation({ db: DB_NAME });
        dbStatus = {
          configured: true,
          connected: true,
          dbName: DB_NAME,
          docCount: info.result.doc_count,
          docDelCount: info.result.doc_del_count,
          diskSize: info.result.sizes ? info.result.sizes.file : null,
          message: 'Connected to IBM Cloudant NoSQL database'
        };
      }
    } catch (err) {
      dbStatus = {
        configured: true,
        connected: false,
        dbName: DB_NAME,
        error: err.message,
        message: 'Failed to connect to Cloudant database instance'
      };
    }
  }

  res.status(200).json({
    success: true,
    status: dbStatus.connected ? 'healthy' : 'degraded',
    service: 'SpendWise Student Expense Tracker API',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
};

/**
 * GET /api/transactions
 * Returns all expense transactions from Cloudant database with calculated dashboard metrics.
 * Supports query parameters: search, category.
 */
export const getAllTransactions = async (req, res, next) => {
  try {
    const client = await getActiveClient();

    // Query all documents including document bodies
    const response = await client.postAllDocs({
      db: DB_NAME,
      includeDocs: true
    });

    const rows = response.result.rows || [];

    // Filter out internal design documents (e.g., _design/...) and invalid docs
    const allExpenses = rows
      .filter((row) => row.doc && !row.id.startsWith('_design/'))
      .map((row) => {
        const doc = row.doc;
        return {
          _id: doc._id,
          _rev: doc._rev,
          title: doc.title,
          amount: Number(doc.amount) || 0,
          category: doc.category,
          date: doc.date,
          description: doc.description || '',
          type: doc.type || 'expense',
          createdAt: doc.createdAt || doc.date,
          updatedAt: doc.updatedAt || doc.createdAt || doc.date
        };
      });

    // Calculate totals across ALL database records for the dashboard
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const currentMonthPrefix = now.toISOString().slice(0, 7); // "YYYY-MM"

    let totalExpenses = 0;
    let todayExpenses = 0;
    let monthlyExpenses = 0;

    for (const exp of allExpenses) {
      const amt = Number(exp.amount) || 0;
      totalExpenses += amt;

      if (exp.date === todayStr) {
        todayExpenses += amt;
      }

      if (exp.date && exp.date.startsWith(currentMonthPrefix)) {
        monthlyExpenses += amt;
      }
    }

    // Apply search filter if query parameter provided
    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const categoryFilter = req.query.category ? req.query.category.trim() : '';

    let filtered = allExpenses;

    if (search) {
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(search) ||
          (exp.description && exp.description.toLowerCase().includes(search))
      );
    }

    if (categoryFilter && categoryFilter.toLowerCase() !== 'all') {
      filtered = filtered.filter(
        (exp) => exp.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Sort by date descending, then createdAt descending
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.status(200).json({
      success: true,
      count: filtered.length,
      totalCount: allExpenses.length,
      summary: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        todayExpenses: Math.round(todayExpenses * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        transactionCount: allExpenses.length
      },
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/:id
 * Fetches a single transaction document by its Cloudant document ID (_id).
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await getActiveClient();

    const response = await client.getDocument({
      db: DB_NAME,
      docId: id
    });

    res.status(200).json({
      success: true,
      data: response.result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/transactions
 * Creates a new student expense document in Cloudant database.
 */
export const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, category, date, description } = req.body;
    const client = await getActiveClient();

    const timestamp = new Date().toISOString();

    const newDocument = {
      type: 'expense',
      title,
      amount: Number(amount),
      category,
      date,
      description: description || '',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const response = await client.postDocument({
      db: DB_NAME,
      document: newDocument
    });

    const createdDoc = {
      ...newDocument,
      _id: response.result.id,
      _rev: response.result.rev
    };

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully in IBM Cloudant',
      data: createdDoc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/transactions/:id
 * Updates an existing transaction document in IBM Cloudant.
 * Manages Cloudant revision (_rev) to ensure NoSQL MVCC consistency.
 */
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, description, _rev } = req.body;
    const client = await getActiveClient();

    // Fetch existing document to retrieve current _rev if not passed or to preserve fields
    const currentDocResponse = await client.getDocument({
      db: DB_NAME,
      docId: id
    });

    const currentDoc = currentDocResponse.result;
    const revToUse = _rev || currentDoc._rev;

    const updatedDocument = {
      ...currentDoc,
      title,
      amount: Number(amount),
      category,
      date,
      description: description !== undefined ? description : currentDoc.description,
      updatedAt: new Date().toISOString(),
      _rev: revToUse
    };

    const response = await client.putDocument({
      db: DB_NAME,
      docId: id,
      document: updatedDocument
    });

    const finalDoc = {
      ...updatedDocument,
      _rev: response.result.rev
    };

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully in IBM Cloudant',
      data: finalDoc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction document from IBM Cloudant.
 * Cloudant requires both docId and current revision (_rev).
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    let rev = req.query.rev || req.body.rev || req.body._rev;
    const client = await getActiveClient();

    // If revision is not provided in query or body, fetch current document to retrieve _rev
    if (!rev) {
      const currentDoc = await client.getDocument({
        db: DB_NAME,
        docId: id
      });
      rev = currentDoc.result._rev;
    }

    const response = await client.deleteDocument({
      db: DB_NAME,
      docId: id,
      rev: rev
    });

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully from IBM Cloudant',
      data: {
        id: response.result.id,
        rev: response.result.rev
      }
    });
  } catch (error) {
    next(error);
  }
};
