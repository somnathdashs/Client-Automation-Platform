import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'clients.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
}

/**
 * Reads all clients from the local JSON file
 */
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading local DB:', error);
        return [];
    }
};

/**
 * Writes all clients to the local JSON file
 */
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to local DB:', error);
    }
};

/**
 * Checks if a client already exists in the database
 */
export const getClientByEmail = async (email) => {
    const clients = readDB();
    return clients.find(c => c.email === email.toLowerCase()) || null;
};

/**
 * Creates a new client record
 */
export const createClient = async (clientData) => {
    const clients = readDB();
    const newClient = {
        $id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...clientData,
        email: clientData.email.toLowerCase(),
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
    };
    clients.push(newClient);
    writeDB(clients);
    return newClient;
};

/**
 * Updates an existing client record
 */
export const updateClient = async (documentId, updates) => {
    const clients = readDB();
    const index = clients.findIndex(c => c.$id === documentId);
    if (index === -1) throw new Error('Client not found');

    clients[index] = {
        ...clients[index],
        ...updates,
        $updatedAt: new Date().toISOString()
    };
    writeDB(clients);
    return clients[index];
};

/**
 * Saves or updates a client in the database
 */
export const saveClient = async (clientData) => {
    const existing = await getClientByEmail(clientData.email);
    if (existing) {
        return await updateClient(existing.$id, clientData);
    } else {
        return await createClient(clientData);
    }
};

/**
 * Saves multiple clients to the database
 */
export const saveClients = async (clientsToSave) => {
    const saved = [];
    for (const client of clientsToSave) {
        saved.push(await saveClient(client));
    }
    return saved;
};

/**
 * Gets all clients who haven't been emailed yet
 */
export const getUnemailedClients = async () => {
    const clients = readDB();
    const unemailed = clients.filter(c => !c.emailSent);
    return {
        unemailedClients: unemailed,
        totalClients: unemailed.length
    };
};

/**
 * Gets all clients from the database
 */
export const getAllClients = async () => {
    return readDB();
};

/**
 * Deletes a client from the database
 */
export const deleteClient = async (documentId) => {
    const clients = readDB();
    const newClients = clients.filter(c => c.$id !== documentId);
    writeDB(newClients);
    return true;
};
