import { CloudantV1 } from '@ibm-cloud/cloudant';
import { IamAuthenticator, BasicAuthenticator } from 'ibm-cloud-sdk-core';
import dotenv from 'dotenv';

dotenv.config();

let clientInstance = null;
let dbInitialized = false;

/**
 * Returns true if the required Cloudant credentials are provided in the environment.
 */
export const isCloudantConfigured = () => {
  const url = process.env.CLOUDANT_URL;
  const apikey = process.env.CLOUDANT_APIKEY || process.env.CLOUDANT_IAM_APIKEY;
  const username = process.env.CLOUDANT_USERNAME;
  const password = process.env.CLOUDANT_PASSWORD;

  return Boolean(url && (apikey || (username && password)));
};

/**
 * Gets or initializes the official IBM Cloudant Node.js SDK client.
 * Returns null if credentials are not configured.
 */
export const getCloudantClient = () => {
  if (clientInstance) {
    return clientInstance;
  }

  const url = process.env.CLOUDANT_URL;
  const apikey = process.env.CLOUDANT_APIKEY || process.env.CLOUDANT_IAM_APIKEY;
  const username = process.env.CLOUDANT_USERNAME;
  const password = process.env.CLOUDANT_PASSWORD;

  if (!url) {
    return null;
  }

  let authenticator = null;

  if (apikey) {
    authenticator = new IamAuthenticator({ apikey });
  } else if (username && password) {
    authenticator = new BasicAuthenticator({ username, password });
  } else {
    return null;
  }

  try {
    clientInstance = CloudantV1.newInstance({
      authenticator,
      serviceUrl: url.replace(/\/+$/, '') // trim trailing slash
    });
    return clientInstance;
  } catch (error) {
    console.error('[Cloudant] Failed to instantiate Cloudant client:', error.message);
    throw error;
  }
};

/**
 * The target database name for SpendWise.
 */
export const DB_NAME = process.env.CLOUDANT_DB_NAME || 'spendwise_db';

/**
 * Initializes the Cloudant database.
 * Checks if 'spendwise_db' exists; if not, automatically creates it.
 */
export const initDatabase = async () => {
  if (!isCloudantConfigured()) {
    console.warn('⚠️ [SpendWise] IBM Cloudant credentials are not configured yet.');
    console.warn('   Please create backend/.env with CLOUDANT_URL and CLOUDANT_APIKEY.');
    console.warn('   See .env.example or README.md for instructions.');
    return {
      connected: false,
      configured: false,
      message: 'Cloudant credentials not configured in environment.'
    };
  }

  const client = getCloudantClient();
  if (!client) {
    throw new Error('Unable to create IBM Cloudant client. Verify CLOUDANT_URL and CLOUDANT_APIKEY.');
  }

  try {
    console.log(`[SpendWise] Checking database "${DB_NAME}" on IBM Cloudant...`);
    const dbInfo = await client.getDatabaseInformation({ db: DB_NAME });
    dbInitialized = true;
    console.log(`✅ [SpendWise] Successfully connected to existing Cloudant database: "${DB_NAME}" (${dbInfo.result.doc_count} docs)`);
    return {
      connected: true,
      configured: true,
      dbName: DB_NAME,
      docCount: dbInfo.result.doc_count
    };
  } catch (err) {
    // If database doesn't exist (HTTP 404), create it
    if (err.status === 404 || err.code === 404) {
      console.log(`ℹ️ [SpendWise] Database "${DB_NAME}" not found. Creating it now on IBM Cloudant...`);
      try {
        await client.putDatabase({ db: DB_NAME });
        dbInitialized = true;
        console.log(`✅ [SpendWise] Successfully created IBM Cloudant database: "${DB_NAME}"`);
        return {
          connected: true,
          configured: true,
          dbName: DB_NAME,
          docCount: 0,
          created: true
        };
      } catch (createErr) {
        console.error(`❌ [SpendWise] Failed to create database "${DB_NAME}":`, createErr.message);
        throw createErr;
      }
    } else {
      console.error(`❌ [SpendWise] Error connecting to IBM Cloudant database "${DB_NAME}":`, err.message);
      throw err;
    }
  }
};

/**
 * Returns current database initialization state.
 */
export const isDbInitialized = () => dbInitialized;
